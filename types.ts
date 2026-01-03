
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
  subject: string;
  chapter: string;
  difficulty: Difficulty;
  questions: Question[];
  responses: Record<number, string | number>; // index: optionIndex or string for FITB
  score: number;
  completedAt?: number;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  totalQuizzes: number;
  averageScore: number;
  lastDifficulty: Difficulty;
}
