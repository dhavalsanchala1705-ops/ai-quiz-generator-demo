
import React from 'react';
import { QuizSession, Difficulty, QuestionType } from '../types';
import { getSuggestedDifficulty } from '../services/storageService';

interface QuizResultProps {
  session: QuizSession;
  onRestart: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({ session, onRestart }) => {
  const scorePercentage = Math.round((session.score / session.questions.length) * 100);
  const nextDiff = getSuggestedDifficulty(scorePercentage, session.difficulty);
  
  const getStatus = () => {
    if (scorePercentage >= 80) return { title: 'Excellent!', color: 'text-green-600', msg: 'You’ve mastered this level.' };
    if (scorePercentage >= 50) return { title: 'Good Job!', color: 'text-blue-600', msg: 'A bit more practice and you’ll be perfect.' };
    return { title: 'Keep Trying!', color: 'text-orange-600', msg: 'Try reviewing the concepts again.' };
  };

  const status = getStatus();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-hidden">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-4 border-4 border-white shadow-inner">
          <span className={`text-4xl font-bold ${status.color}`}>{scorePercentage}%</span>
        </div>
        <h2 className={`text-3xl font-bold ${status.color}`}>{status.title}</h2>
        <p className="text-slate-500 mt-2">{status.msg}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Subject</p>
          <p className="font-bold text-slate-700 truncate">{session.subject}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Chapter</p>
          <p className="font-bold text-slate-700 truncate">{session.chapter}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Difficulty</p>
          <p className="font-bold text-slate-700 capitalize">{session.difficulty}</p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-10">
        <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Adaptive Recommendation
        </h3>
        <p className="text-indigo-700 mb-4">
          Based on your performance, the AI recommends starting your next session on:
        </p>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full font-bold uppercase text-sm border-2 ${
            nextDiff === Difficulty.HARD ? 'bg-red-100 border-red-300 text-red-700' :
            nextDiff === Difficulty.MEDIUM ? 'bg-orange-100 border-orange-300 text-orange-700' :
            'bg-green-100 border-green-300 text-green-700'
          }`}>
            {nextDiff} Difficulty
          </span>
        </div>
      </div>

      <div className="space-y-6 mb-10">
        <h3 className="font-bold text-slate-800 border-b pb-2">Question Review</h3>
        {session.questions.map((q, idx) => {
          const userAns = session.responses[idx];
          
          let isCorrect = false;
          let userDisplay = '';
          let correctDisplay = '';

          if (q.type === QuestionType.MCQ || q.type === QuestionType.TF) {
            isCorrect = userAns === q.correctAnswerIndex;
            userDisplay = q.options ? q.options[userAns as number] : 'No answer';
            correctDisplay = q.options ? q.options[q.correctAnswerIndex as number] : '';
          } else {
            isCorrect = (userAns as string).trim().toLowerCase() === (q.correctAnswerText || '').trim().toLowerCase();
            userDisplay = userAns as string;
            correctDisplay = q.correctAnswerText || '';
          }

          return (
            <div key={idx} className="p-4 border border-slate-100 rounded-lg">
              <div className="flex items-start gap-3 mb-2">
                <span className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
                <p className="text-slate-800 font-medium">{q.text}</p>
              </div>
              {!isCorrect && (
                <p className="text-xs text-slate-500 mb-1 ml-8">
                  Your Answer: <span className="text-red-500 line-through">{userDisplay}</span>
                </p>
              )}
              <p className="text-xs text-slate-500 ml-8">
                Correct Answer: <span className="text-green-600 font-semibold">{correctDisplay}</span>
              </p>
              <p className="text-xs bg-slate-50 p-2 rounded mt-2 ml-8 text-slate-600 italic">
                {q.explanation}
              </p>
            </div>
          );
        })}
      </div>

      <button
        onClick={onRestart}
        className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
      >
        Start New Session
      </button>
    </div>
  );
};

export default QuizResult;
