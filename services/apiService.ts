import { QuizSession, User, Difficulty, DashboardStats, Room } from "../types";

const API_URL = 'http://localhost:3000/api';

// --- Helper for Auth Header (if we add Tokens later) ---
const getHeaders = () => ({
    'Content-Type': 'application/json',
});

// --- Auth Services ---

export const signup = async (name: string, email: string, password?: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const login = async (email: string, password?: string): Promise<User | null> => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) return null;
    return res.json();
};

// --- Room Services ---

export const createRoom = async (ownerId: string): Promise<Room> => {
    const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ownerId })
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
};

export const getRoom = async (roomCode: string): Promise<Room | null> => {
    const res = await fetch(`${API_URL}/rooms/${roomCode}`);
    if (!res.ok) return null;
    return res.json();
};

export const updateRoomQuiz = async (
    roomCode: string,
    questions: any[],
    config: any
): Promise<Room> => {
    const res = await fetch(`${API_URL}/rooms/${roomCode}/quiz`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ questions, config })
    });
    if (!res.ok) throw new Error('Failed to update quiz');
    return res.json();
};

export const joinRoom = async (roomCode: string, userId: string): Promise<Room> => {
    const res = await fetch(`${API_URL}/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to join room');
    return res.json();
};

export const updateStudentProgress = async (roomCode: string, userId: string, progress: any) => {
    await fetch(`${API_URL}/rooms/${roomCode}/progress`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ userId, progress })
    });
};
