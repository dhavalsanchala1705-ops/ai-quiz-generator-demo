import { QuizSession, User, Difficulty, DashboardStats, Room } from "../types";
import { api } from "./api";

const DB_USERS = "quiz_db_users";
const DB_SESSIONS = "quiz_db_sessions";
const SESSION_USER_ID = "quiz_current_user_id";

// --- Helpers ---

const getFromDB = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  try {
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`Error parsing data for key ${key}`, e);
    return [];
  }
};

const saveToDB = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Auth Services (Async Wrapper over API) ---

export const signup = async (name: string, email: string, password?: string): Promise<User> => {
  try {
    const user = await api.auth.signup({ name, email, password });
    localStorage.setItem(SESSION_USER_ID, user.id);
    // Also save to local DB for hybrid fallback if needed? 
    // For now, trust the API return.
    return user;
  } catch (err: any) {
    throw new Error(err.message || 'Signup failed');
  }
};

export const login = async (email: string, password?: string): Promise<User | null> => {
  try {
    const user = await api.auth.login({ email, password });
    localStorage.setItem(SESSION_USER_ID, user.id);
    return user;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const forgotPassword = async (email: string) => {
  return await api.auth.forgot(email);
};

export const resetPassword = async (token: string, newPassword: string) => {
  return await api.auth.reset(token, newPassword);
};

export const logout = () => {
  localStorage.removeItem(SESSION_USER_ID);
};

export const getCurrentUser = (): User | null => {
  const userId = localStorage.getItem(SESSION_USER_ID);
  if (!userId) return null;
  // If we are fully API based, we might want to validate token?
  // For now, we return a shell user or we need to GET user from API?
  // Let's rely on LocalStorage cache of profile if we have it?
  // But strictly, we only have ID.
  // We need `getUser(id)` in API?
  // Or just cache the User Object in Login?
  // Let's cache the full user object for simplicity in this demo.
  const cached = localStorage.getItem('quiz_user_cache');
  if (cached) return JSON.parse(cached);

  // Fallback: If we have ID but no object, we are stuck in Sync mode.
  // We'll return null to force re-login?
  return null;
};

// Update login/signup to cache user
const cacheUser = (user: User) => {
  localStorage.setItem(SESSION_USER_ID, user.id);
  localStorage.setItem('quiz_user_cache', JSON.stringify(user));
}

// Redefine login/signup to use cacheUser
export const loginWrapper = async (e: string, p?: string) => {
  const u = await login(e, p);
  if (u) cacheUser(u);
  return u;
}
export const signupWrapper = async (n: string, e: string, p?: string) => {
  const u = await signup(n, e, p);
  if (u) cacheUser(u);
  return u;
}

// --- Quiz Services (Local for now) ---

export const saveQuizSession = (session: QuizSession) => {
  // 1. Local Save
  const sessions = getFromDB<QuizSession>(DB_SESSIONS);
  sessions.push(session);
  saveToDB(DB_SESSIONS, sessions);

  // 2. Remote Save (Fire & Forget)
  api.sessions.create(session).catch(err => console.error("Failed to save session remotely:", err));
};

export const getDashboardStatsLocal = (userId: string): DashboardStats => {
  const allSessions = getFromDB<QuizSession>(DB_SESSIONS);
  return calculateStats(allSessions, userId);
};

export const getDashboardStatsAsync = async (userId: string): Promise<DashboardStats> => {
  try {
    const remoteSessions = await api.sessions.getHistory(userId);
    // Merge or just use remote? Remote is truth.
    // Convert remote structure to QuizSession if needed or ensure API returns compatible
    return calculateStats(remoteSessions, userId);
  } catch (e) {
    console.error("Failed to fetch remote stats, falling back to local", e);
    return getDashboardStatsLocal(userId);
  }
};

const calculateStats = (sessions: any[], userId: string): DashboardStats => {
  // If remote returns matching userId sessions only, filter check is redundant but safe
  const userSessions = sessions.filter(s => s.userId === userId);
  const total = userSessions.length;
  // Handle potential missing 'questions' array in remote light objects
  const avgScore = total > 0 ? userSessions.reduce((acc, curr) => {
    const totalQ = curr.questions?.length || curr.totalQuestions || 10;
    return acc + (curr.score / totalQ);
  }, 0) / total : 0;

  const subjects = Array.from(new Set(userSessions.map(s => s.subject)));
  return {
    totalQuizzes: total,
    averageScore: Math.round(avgScore * 100),
    masteredSubjects: subjects.slice(0, 3) as string[],
    recentSessions: userSessions.slice(0, 5)
  };
};

export const getSuggestedDifficulty = (lastScore: number | null, currentDifficulty: Difficulty): Difficulty => {
  if (lastScore === null) return currentDifficulty;
  if (lastScore >= 80) return currentDifficulty === Difficulty.EASY ? Difficulty.MEDIUM : Difficulty.HARD;
  if (lastScore < 40) return currentDifficulty === Difficulty.HARD ? Difficulty.MEDIUM : Difficulty.EASY;
  return currentDifficulty;
};

// --- Room Services (Async API) ---

export const createRoom = async (ownerId: string): Promise<Room> => {
  return await api.rooms.create(ownerId);
};

export const updateRoomQuiz = async (
  roomCode: string,
  questions: any[],
  config: any
): Promise<Room> => {
  return await api.rooms.updateQuiz(roomCode, questions, config);
};

export const endRoomSession = async (roomCode: string): Promise<void> => {
  await api.rooms.end(roomCode);
};

export const getRoom = async (roomCode: string): Promise<Room | null> => {
  return await api.rooms.get(roomCode);
};

export const joinRoom = async (roomCode: string, userId: string): Promise<Room> => {
  return await api.rooms.join(roomCode, userId);
};

export const getTeacherRooms = async (teacherId: string): Promise<Room[]> => {
  return await api.rooms.getTeacherRooms(teacherId);
};

export const updateStudentProgress = async (roomCode: string, userId: string, progress: any) => {
  return await api.rooms.updateProgress(roomCode, userId, progress);
}

