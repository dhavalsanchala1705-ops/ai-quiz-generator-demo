
import React, { useState, useEffect } from 'react';
import { Difficulty, QuizSession, Question, QuestionType } from './types';
import QuizSetup from './components/QuizSetup';
import QuestionCard from './components/QuestionCard';
import QuizResult from './components/QuizResult';
import ProgressBar from './components/ProgressBar';
import { generateQuizQuestions } from './services/geminiService';
import { 
  saveSession, 
  getUserProfile, 
  updateUserProfile, 
  getSuggestedDifficulty,
  getSessions
} from './services/storageService';

const App: React.FC = () => {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentResponse, setCurrentResponse] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedDiff, setSuggestedDiff] = useState<Difficulty>(Difficulty.EASY);

  useEffect(() => {
    const sessions = getSessions();
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      const lastScorePerc = Math.round((lastSession.score / lastSession.questions.length) * 100);
      setSuggestedDiff(getSuggestedDifficulty(lastScorePerc, lastSession.difficulty));
    }
  }, []);

  const handleStartQuiz = async (subject: string, chapter: string, difficulty: Difficulty) => {
    setLoading(true);
    setError(null);
    try {
      const questions = await generateQuizQuestions(subject, chapter, difficulty);
      const newSession: QuizSession = {
        id: `session-${Date.now()}`,
        subject,
        chapter,
        difficulty,
        questions,
        responses: {},
        score: 0,
        createdAt: Date.now()
      };
      setSession(newSession);
      setCurrentIdx(0);
      setCurrentResponse(null);
      setShowResult(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseUpdate = (val: string | number) => {
    setCurrentResponse(val);
  };

  const checkCorrectness = (question: Question, response: string | number | null): boolean => {
    if (response === null) return false;

    if (question.type === QuestionType.MCQ || question.type === QuestionType.TF) {
      return response === question.correctAnswerIndex;
    }

    if (question.type === QuestionType.FITB) {
      const userTxt = response.toString().trim().toLowerCase();
      const correctTxt = (question.correctAnswerText || '').trim().toLowerCase();
      return userTxt === correctTxt;
    }

    return false;
  };

  const handleNext = () => {
    if (session && currentResponse !== null) {
      const currentQuestion = session.questions[currentIdx];
      const isCorrect = checkCorrectness(currentQuestion, currentResponse);
      
      const updatedSession = {
        ...session,
        responses: { ...session.responses, [currentIdx]: currentResponse },
        score: isCorrect ? session.score + 1 : session.score
      };

      if (currentIdx < session.questions.length - 1) {
        setSession(updatedSession);
        setCurrentIdx(currentIdx + 1);
        setCurrentResponse(null);
      } else {
        const finalSession = {
          ...updatedSession,
          completedAt: Date.now()
        };
        setSession(finalSession);
        saveSession(finalSession);
        
        const scorePerc = Math.round((finalSession.score / finalSession.questions.length) * 100);
        updateUserProfile(scorePerc, finalSession.difficulty);
        setSuggestedDiff(getSuggestedDifficulty(scorePerc, finalSession.difficulty));
        setShowResult(true);
      }
    }
  };

  const handleRestart = () => {
    setSession(null);
    setShowResult(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
            A
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Adaptive Quiz</h1>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
          {error}
        </div>
      )}

      <main>
        {!session && (
          <QuizSetup 
            onStart={handleStartQuiz} 
            isLoading={loading} 
            suggestedDifficulty={suggestedDiff}
          />
        )}

        {session && !showResult && (
          <div className="max-w-2xl mx-auto">
            <ProgressBar current={currentIdx + 1} total={session.questions.length} />
            <QuestionCard 
              question={session.questions[currentIdx]}
              currentResponse={currentResponse}
              onResponse={handleResponseUpdate}
              onNext={handleNext}
              isLast={currentIdx === session.questions.length - 1}
            />
          </div>
        )}

        {showResult && session && (
          <QuizResult session={session} onRestart={handleRestart} />
        )}
      </main>

      <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Adaptive AI Quiz Generator. Empowering students and teachers.</p>
        <p className="mt-1">Multimodal Quiz Engine v2.0</p>
      </footer>
    </div>
  );
};

export default App;
