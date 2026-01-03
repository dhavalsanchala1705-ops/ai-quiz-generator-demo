
import { QuizSession, User, Difficulty, DashboardStats } from "../types";

const DB_USERS = "quiz_db_users";
const DB_SESSIONS = "quiz_db_sessions";
const SESSION_USER_ID = "quiz_current_user_id";

// --- Database Operations ---

const getFromDB = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToDB = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Auth Services ---

export const signup = (name: string, email: string): User => {
  const users = getFromDB<User>(DB_USERS);
  const newUser: User = {
    id: `u-${Date.now()}`,
    name,
    email,
    lastDifficulty: Difficulty.EASY,
    createdAt: Date.now()
  };
  users.push(newUser);
  saveToDB(DB_USERS, users);
  localStorage.setItem(SESSION_USER_ID, newUser.id);
  return newUser;
};

export const login = (email: string): User | null => {
  const users = getFromDB<User>(DB_USERS);
  const user = users.find(u => u.email === email);
  if (user) {
    localStorage.setItem(SESSION_USER_ID, user.id);
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(SESSION_USER_ID);
};

export const getCurrentUser = (): User | null => {
  const userId = localStorage.getItem(SESSION_USER_ID);
  if (!userId) return null;
  const users = getFromDB<User>(DB_USERS);
  return users.find(u => u.id === userId) || null;
};

// --- Quiz Services ---

export const saveQuizSession = (session: QuizSession) => {
  const sessions = getFromDB<QuizSession>(DB_SESSIONS);
  sessions.push(session);
  saveToDB(DB_SESSIONS, sessions);
  
  // Update User profile based on results
  const users = getFromDB<User>(DB_USERS);
  const userIdx = users.findIndex(u => u.id === session.userId);
  if (userIdx > -1) {
    const scorePerc = (session.score / session.questions.length) * 100;
    users[userIdx].lastDifficulty = getSuggestedDifficulty(scorePerc, session.difficulty);
    saveToDB(DB_USERS, users);
  }
};

export const getDashboardStats = (userId: string): DashboardStats => {
  const allSessions = getFromDB<QuizSession>(DB_SESSIONS);
  const userSessions = allSessions
    .filter(s => s.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const total = userSessions.length;
  const avgScore = total > 0 
    ? userSessions.reduce((acc, curr) => acc + (curr.score / curr.questions.length), 0) / total 
    : 0;
  
  const subjects = Array.from(new Set(userSessions.map(s => s.subject)));

  return {
    totalQuizzes: total,
    averageScore: Math.round(avgScore * 100),
    masteredSubjects: subjects.slice(0, 3),
    recentSessions: userSessions.slice(0, 5)
  };
};

export const getSuggestedDifficulty = (lastScore: number | null, currentDifficulty: Difficulty): Difficulty => {
  if (lastScore === null) return currentDifficulty;
  if (lastScore >= 80) {
    if (currentDifficulty === Difficulty.EASY) return Difficulty.MEDIUM;
    if (currentDifficulty === Difficulty.MEDIUM) return Difficulty.HARD;
    return Difficulty.HARD;
  } else if (lastScore < 40) {
    if (currentDifficulty === Difficulty.HARD) return Difficulty.MEDIUM;
    if (currentDifficulty === Difficulty.MEDIUM) return Difficulty.EASY;
    return Difficulty.EASY;
  }
  return currentDifficulty;
};
