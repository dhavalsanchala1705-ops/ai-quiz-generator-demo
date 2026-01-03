
import { QuizSession, UserProfile, Difficulty } from "../types";

const STORAGE_KEY_SESSIONS = "adaptive_quiz_sessions";
const STORAGE_KEY_USER = "adaptive_quiz_user";

export const getSessions = (): QuizSession[] => {
  const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
  return data ? JSON.parse(data) : [];
};

export const saveSession = (session: QuizSession) => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  if (index > -1) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
};

export const getUserProfile = (): UserProfile => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (data) return JSON.parse(data);
  
  const defaultUser: UserProfile = {
    id: "user-1",
    name: "Student",
    totalQuizzes: 0,
    averageScore: 0,
    lastDifficulty: Difficulty.EASY
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
  return defaultUser;
};

export const updateUserProfile = (score: number, difficulty: Difficulty) => {
  const user = getUserProfile();
  const totalScore = (user.averageScore * user.totalQuizzes) + score;
  const newTotal = user.totalQuizzes + 1;
  
  const updatedUser: UserProfile = {
    ...user,
    totalQuizzes: newTotal,
    averageScore: totalScore / newTotal,
    lastDifficulty: difficulty
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
};

export const getSuggestedDifficulty = (lastScore: number | null, currentDifficulty: Difficulty): Difficulty => {
  if (lastScore === null) return currentDifficulty;
  
  // Logic: 
  // > 80%? Level up. 
  // < 40%? Level down. 
  // Otherwise stay same.
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
