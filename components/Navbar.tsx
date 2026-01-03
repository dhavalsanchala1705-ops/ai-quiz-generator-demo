
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onGoHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onGoHome }) => {
  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={onGoHome} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
            A
          </div>
          <span className="font-bold text-slate-900 hidden sm:inline">Adaptive AI Quiz</span>
        </button>

        {user && (
          <div className="flex items-center gap-6">
            <button 
              onClick={onGoHome}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Dashboard
            </button>
            <div className="flex items-center gap-2 border-l pl-6">
              <span className="text-xs text-slate-400 hidden sm:inline">Logged as </span>
              <span className="text-sm font-bold text-slate-800">{user.name}</span>
              <button 
                onClick={onLogout}
                className="ml-2 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
