
import React, { useState, useEffect, useMemo } from 'react';
import { Difficulty, QuizSession, User, DashboardStats } from './types';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import QuizSetup from './components/QuizSetup';
import QuestionCard from './components/QuestionCard';
import QuizResult from './components/QuizResult';
import ProgressBar from './components/ProgressBar';
import PrivacyPolicy from './components/PrivacyPolicy';
import { generateQuizQuestions } from './services/geminiService';
import {
  getCurrentUser,
  logout,
  getDashboardStats,
  saveQuizSession,
  getSuggestedDifficulty
} from './services/storageService';

enum AppView {
  AUTH = 'auth',
  DASHBOARD = 'dashboard',
  SETUP = 'setup',
  QUIZ = 'quiz',
  RESULT = 'result',
  PRIVACY = 'privacy'
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.AUTH);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentResponse, setCurrentResponse] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial user session
  useEffect(() => {
    const activeUser = getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
      setView(AppView.DASHBOARD);
    } else {
      setView(AppView.AUTH);
    }
  }, []);

  const stats: DashboardStats = useMemo(() => {
    if (!user) return { totalQuizzes: 0, averageScore: 0, masteredSubjects: [], recentSessions: [] };
    return getDashboardStats(user.id);
  }, [user, view]);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView(AppView.AUTH);
  };

  const handleStartQuiz = async (subject: string, chapter: string, difficulty: Difficulty) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const questions = await generateQuizQuestions(subject, chapter, difficulty);
      const newSession: QuizSession = {
        id: `session-${Date.now()}`,
        userId: user.id,
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
      setView(AppView.QUIZ);
    } catch (err: any) {
      setError(err.message || 'AI Generation failed. Check your API Key.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (session && currentResponse !== null) {
      const currentQuestion = session.questions[currentIdx];

      let isCorrect = false;
      if (typeof currentResponse === 'number') {
        isCorrect = currentResponse === currentQuestion.correctAnswerIndex;
      } else {
        isCorrect = currentResponse.toString().trim().toLowerCase() === (currentQuestion.correctAnswerText || '').trim().toLowerCase();
      }

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
        const finalSession = { ...updatedSession, completedAt: Date.now() };
        setSession(finalSession);
        saveQuizSession(finalSession);
        // Refresh local user state with updated level
        setUser(getCurrentUser());
        setView(AppView.RESULT);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onGoHome={() => setView(user ? AppView.DASHBOARD : AppView.AUTH)}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === AppView.AUTH && <Auth onAuthSuccess={handleAuthSuccess} onShowPrivacy={() => setView(AppView.PRIVACY)} />}

        {view === AppView.PRIVACY && <PrivacyPolicy onBack={() => setView(AppView.AUTH)} />}

        {view === AppView.DASHBOARD && user && (
          <Dashboard
            user={user}
            stats={stats}
            onNewQuiz={() => setView(AppView.SETUP)}
          />
        )}

        {view === AppView.SETUP && (
          <QuizSetup
            onStart={handleStartQuiz}
            isLoading={loading}
            suggestedDifficulty={user?.lastDifficulty || Difficulty.EASY}
          />
        )}

        {view === AppView.QUIZ && session && (
          <div className="max-w-2xl mx-auto">
            <ProgressBar current={currentIdx + 1} total={session.questions.length} />
            <QuestionCard
              question={session.questions[currentIdx]}
              currentResponse={currentResponse}
              onResponse={setCurrentResponse}
              onNext={handleNext}
              isLast={currentIdx === session.questions.length - 1}
            />
          </div>
        )}

        {view === AppView.RESULT && session && (
          <QuizResult
            session={session}
            onRestart={() => setView(AppView.DASHBOARD)}
          />
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
            {error}
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 text-center text-slate-400 dark:text-slate-500 text-sm border-t border-slate-200 dark:border-slate-800">
        <p>FundaMinds AI Engine &copy; {new Date().getFullYear()}</p>
        <div className="mt-2 flex justify-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-300">
          <span>Persisted DB: LocalStorage</span>
          <span>•</span>
          <span>Engine: Gemini 1.5 Flash</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
