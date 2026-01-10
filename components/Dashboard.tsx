
import React from 'react';
import { DashboardStats, User } from '../types';

interface DashboardProps {
  user: User;
  stats: DashboardStats;
  onNewQuiz: () => void;
  onTeacherRoom: () => void;
  onJoinRoom: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, stats, onNewQuiz, onTeacherRoom, onJoinRoom }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome, {user.name}!</h1>
          <p className="text-slate-500 dark:text-slate-400">Track your progress and start new challenges.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onJoinRoom}
            className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-900/30 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            Join Room
          </button>
          <button
            onClick={onTeacherRoom}
            className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-900/30 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Teacher Room
          </button>
          <button
            onClick={onNewQuiz}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Start New Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Quizzes</p>
          <h3 className="text-4xl font-black text-slate-800 dark:text-white">{stats.totalQuizzes}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Average Score</p>
          <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{stats.averageScore}%</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Current Level</p>
          <h3 className="text-4xl font-black text-orange-500 capitalize">{user.lastDifficulty}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-50 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent History</h2>
        </div>
        <div className="overflow-x-auto">
          {stats.recentSessions.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-3">Subject / Topic</th>
                  <th className="px-6 py-3">Difficulty</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {stats.recentSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{session.subject}</p>
                      <p className="text-xs text-slate-400">{session.chapter}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-bold text-slate-500 dark:text-slate-400">
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round((session.score / session.questions.length) * 100)}%
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-400">No quizzes taken yet. Ready to start?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
