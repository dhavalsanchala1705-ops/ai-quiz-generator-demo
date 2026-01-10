
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum QuestionType {
  MCQ = 'mcq',
  TF = 'tf',
  FITB = 'fitb'
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerText?: string;
  explanation: string;
}

export interface QuizSession {
  id: string;
  userId: string;
  subject: string;
  chapter: string;
  difficulty: Difficulty;
  questions: Question[];
  responses: Record<number, string | number>;
  score: number;
  completedAt?: number;
  createdAt: number;
  roomCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  lastDifficulty: Difficulty;
  createdAt: number;
}

export interface DashboardStats {
  totalQuizzes: number;
  averageScore: number;
  masteredSubjects: string[];
  recentSessions: QuizSession[];
}

export interface Room {
  id: string;      // The 6-digit code
  ownerId: string; // User ID of the teacher
  createdAt: number;
  participants: { id: string; name: string }[]; // List of Participants
  isActive: boolean;
  status: 'waiting' | 'ready' | 'active' | 'completed';
  questions?: Question[];
  config?: {
    subject: string;
    topic: string;
    difficulty: Difficulty;
    questionCount: number;
    durationSeconds: number;
  };
  studentProgress?: Record<string, {
    currentQuestionIndex: number;
    completed: boolean;
    score: number;
  }>;
}
