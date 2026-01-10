const express = require('express');
const os = require('os');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Root Route (Friendly Message)
app.get('/', (req, res) => {
    res.send('<h1>AI Quiz Generator Backend is Running!</h1><p>Please access the frontend at <a href="http://localhost:3001">http://localhost:3001</a></p>');
});

// Database Connection (SQLite)
const dbPath = path.resolve(__dirname, 'ai_quiz.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        initializeSchema();
    }
});

function initializeSchema() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      last_difficulty TEXT DEFAULT 'Easy',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      owner_id TEXT,
      status TEXT DEFAULT 'waiting',
      config TEXT,
      questions TEXT,
      student_progress TEXT DEFAULT '{}',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS room_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT,
      user_id TEXT,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(room_id) REFERENCES rooms(id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      UNIQUE(room_id, user_id)
    )`);
    });
}

// Helper for Promisified DB calls
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// --- Auth Routes ---

app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const id = `u-${Date.now()}`;
    try {
        await dbRun(
            'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
            [id, name, email, password]
        );
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
        res.json(user);
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(400).json({ error: 'User not found' });

        if (user.password_hash !== password) return res.status(400).json({ error: 'Invalid password' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Room Routes ---

app.post('/api/rooms', async (req, res) => {
    const { ownerId } = req.body;
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const row = await dbGet('SELECT id FROM rooms WHERE id = ?', [code]);
        if (!row) isUnique = true;
    }

    try {
        await dbRun(
            'INSERT INTO rooms (id, owner_id) VALUES (?, ?)',
            [code, ownerId]
        );
        const room = await dbGet('SELECT * FROM rooms WHERE id = ?', [code]);

        // Parse JSON fields
        if (room.config) room.config = JSON.parse(room.config);
        if (room.questions) room.questions = JSON.parse(room.questions);
        if (room.student_progress) room.student_progress = JSON.parse(room.student_progress);
        room.is_active = !!room.is_active;

        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/rooms/teacher/:teacherId', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM rooms WHERE owner_id = ? ORDER BY created_at DESC', [req.params.teacherId]);

        const rooms = [];
        for (let room of rows) {
            const parts = await dbAll('SELECT user_id FROM room_participants WHERE room_id = ?', [room.id]);
            room.participants = parts.map(r => r.user_id);

            // Parse JSON
            try { room.config = JSON.parse(room.config); } catch (e) { }
            try { room.questions = JSON.parse(room.questions); } catch (e) { }
            try { room.student_progress = JSON.parse(room.student_progress); } catch (e) { }
            room.is_active = !!room.is_active;

            rooms.push(room);
        }

        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/rooms/:code', async (req, res) => {
    try {
        const room = await dbGet('SELECT * FROM rooms WHERE id = ?', [req.params.code]);
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const parts = await dbAll('SELECT user_id FROM room_participants WHERE room_id = ?', [req.params.code]);
        room.participants = parts.map(r => r.user_id);

        try { room.config = JSON.parse(room.config); } catch (e) { }
        try { room.questions = JSON.parse(room.questions); } catch (e) { }
        try { room.student_progress = JSON.parse(room.student_progress || '{}'); } catch (e) { }
        room.is_active = !!room.is_active;

        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/rooms/:code/quiz', async (req, res) => {
    const { questions, config } = req.body;
    try {
        await dbRun(
            'UPDATE rooms SET questions = ?, config = ?, status = ? WHERE id = ?',
            [JSON.stringify(questions), JSON.stringify(config), 'ready', req.params.code]
        );
        const room = await dbGet('SELECT * FROM rooms WHERE id = ?', [req.params.code]);
        // Helper to parse...
        try { room.config = JSON.parse(room.config); } catch (e) { }
        try { room.questions = JSON.parse(room.questions); } catch (e) { }
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/rooms/:code/end', async (req, res) => {
    try {
        await dbRun(
            'UPDATE rooms SET is_active = ?, status = ? WHERE id = ?',
            [0, 'completed', req.params.code]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rooms/:code/join', async (req, res) => {
    const { userId } = req.body;
    try {
        await dbRun(
            'INSERT OR IGNORE INTO room_participants (room_id, user_id) VALUES (?, ?)',
            [req.params.code, userId]
        );
        // Return room info?
        const room = await dbGet('SELECT * FROM rooms WHERE id = ?', [req.params.code]);
        // Parse...
        try { room.config = JSON.parse(room.config); } catch (e) { }
        try { room.questions = JSON.parse(room.questions); } catch (e) { }
        room.is_active = !!room.is_active;

        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/rooms/:code/progress', async (req, res) => {
    const { userId, progress } = req.body;
    try {
        // SQLite JSON update is hard. We fetch, update in memory, save back.
        const row = await dbGet('SELECT student_progress FROM rooms WHERE id = ?', [req.params.code]);
        let currentProgress = {};
        try { currentProgress = JSON.parse(row.student_progress || '{}'); } catch (e) { }

        currentProgress[userId] = progress;

        await dbRun('UPDATE rooms SET student_progress = ? WHERE id = ?', [JSON.stringify(currentProgress), req.params.code]);

        res.json({ success: true, progress: currentProgress });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    const interfaces = os.networkInterfaces();
    let networkIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                networkIp = iface.address;
                break;
            }
        }
    }
    console.log(`\nServer running on port ${PORT}`);
    console.log(`Local:   http://localhost:${PORT}`);
    console.log(`Network: http://${networkIp}:${PORT}\n`);
});
