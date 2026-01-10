
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
        style={{ width: `${percentage}%` }}
      ></div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Question {current} of {total}</span>
        <span>{percentage}% Complete</span>
      </div>
    </div>
  );
};

export default ProgressBar;
