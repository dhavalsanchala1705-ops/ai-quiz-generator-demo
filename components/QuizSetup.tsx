
import React, { useState } from 'react';
import { Difficulty } from '../types';

interface QuizSetupProps {
  onStart: (subject: string, chapter: string, difficulty: Difficulty, apiKey?: string) => void;
  isLoading: boolean;
  suggestedDifficulty: Difficulty;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ onStart, isLoading, suggestedDifficulty }) => {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(suggestedDifficulty);
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && chapter) {
      onStart(subject, chapter, difficulty, apiKey);
    }
  };

  const subjects = ['Aptitude Test', 'Computer Science', 'Geography', 'History', 'Literature', 'Mathematics', 'Science'];
  const difficulties = [
    { value: Difficulty.EASY, label: 'Easy', color: 'text-green-600' },
    { value: Difficulty.MEDIUM, label: 'Medium', color: 'text-orange-600' },
    { value: Difficulty.HARD, label: 'Hard', color: 'text-red-600' },
  ];

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 transition-colors">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">New Quiz</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Personalize your learning path with AI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
          <select
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">Select a subject...</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="Other">Other (Custom)</option>
          </select>
        </div>

        {subject === 'Other' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Custom Subject</label>
            <input
              type="text"
              placeholder="e.g., Quantum Physics"
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Chapter / Topic</label>
          <input
            type="text"
            placeholder="e.g., Photosynthesis or Calculus I"
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${difficulty === d.value
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 font-bold'
                  : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500'
                  }`}
              >
                <span className={difficulty === d.value ? (d.value === Difficulty.HARD ? 'text-red-600 dark:text-red-400' : d.value === Difficulty.MEDIUM ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400') : ''}>{d.label}</span>
              </button>
            ))}
          </div>
          {difficulty !== suggestedDifficulty && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
              Note: System suggested {suggestedDifficulty} based on your last performance.
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Gemini API Key (Optional) <span className="font-normal opacity-70">- Leave empty to use system key</span>
          </label>
          <input
            type="password"
            placeholder="AIzaSy... (Paste your own key to override)"
            className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Quiz...
            </>
          ) : 'Generate Quiz'}
        </button>
      </form>
    </div>
  );
};

export default QuizSetup;
