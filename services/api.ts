const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const api = {
    auth: {
        signup: async (userData: any) => {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        login: async (credentials: any) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        forgot: async (email: string) => {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        reset: async (token: string, newPassword: string) => {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        }
    },
    rooms: {
        create: async (ownerId: string) => {
            const res = await fetch(`${API_URL}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ownerId }),
            });
            return res.json();
        },
        get: async (code: string) => {
            const res = await fetch(`${API_URL}/rooms/${code}`);
            if (!res.ok) return null;
            return res.json();
        },
        join: async (code: string, userId: string) => {
            const res = await fetch(`${API_URL}/rooms/${code}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            return res.json();
        },
        updateQuiz: async (code: string, questions: any[], config: any) => {
            const res = await fetch(`${API_URL}/rooms/${code}/quiz`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions, config }),
            });
            return res.json();
        },
        end: async (code: string) => {
            await fetch(`${API_URL}/rooms/${code}/end`, { method: 'PUT' });
        },
        getTeacherRooms: async (teacherId: string) => {
            const res = await fetch(`${API_URL}/rooms/teacher/${teacherId}`);
            if (!res.ok) return [];
            return res.json();
        },
        updateProgress: async (code: string, userId: string, progress: any) => {
            await fetch(`${API_URL}/rooms/${code}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, progress })
            });
        }
    },
    sessions: {
        create: async (session: any) => {
            const res = await fetch(`${API_URL}/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.userId,
                    subject: session.subject,
                    score: session.score,
                    totalQuestions: session.questions.length,
                    difficulty: session.difficulty,
                    id: session.id
                })
            });
            return res.json();
        },
        getHistory: async (userId: string) => {
            const res = await fetch(`${API_URL}/sessions/${userId}`);
            if (!res.ok) return [];
            return res.json();
        }
    }
};
