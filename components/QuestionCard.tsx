
import React from 'react';
import { Question, QuestionType } from '../types';

interface QuestionCardProps {
  question: Question;
  currentResponse: string | number | null;
  onResponse: (val: string | number) => void;
  onNext: () => void;
  isLast: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  currentResponse, 
  onResponse, 
  onNext, 
  isLast 
}) => {
  const renderOptions = () => {
    if (question.type === QuestionType.MCQ || question.type === QuestionType.TF) {
      const options = question.options || [];
      return (
        <div className="space-y-3 mb-8">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onResponse(idx)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                currentResponse === idx 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium ${
                  currentResponse === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {question.type === QuestionType.MCQ ? String.fromCharCode(65 + idx) : (idx === 0 ? 'T' : 'F')}
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (question.type === QuestionType.FITB) {
      return (
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Your Answer</label>
          <input 
            type="text"
            autoFocus
            className="w-full p-4 text-lg rounded-lg border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
            placeholder="Type the correct word or phrase..."
            value={typeof currentResponse === 'string' ? currentResponse : ''}
            onChange={(e) => onResponse(e.target.value)}
          />
        </div>
      );
    }

    return null;
  };

  const isInputEmpty = () => {
    if (question.type === QuestionType.FITB) {
      return !currentResponse || currentResponse.toString().trim() === '';
    }
    return currentResponse === null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded">
          {question.type === QuestionType.MCQ ? 'Multiple Choice' : question.type === QuestionType.TF ? 'True / False' : 'Fill in the Blank'}
        </span>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
        {question.text}
      </h2>
      
      {renderOptions()}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={isInputEmpty()}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-100"
        >
          {isLast ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
