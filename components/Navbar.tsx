
import React from 'react';
import { User } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onGoHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onGoHome }) => {
  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={onGoHome} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
            F
          </div>
          <span className="font-bold text-slate-900 dark:text-white hidden sm:inline text-xl tracking-tight">FundaMinds</span>
        </button>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={onGoHome}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block"
              >
                Dashboard
              </button>
              <div className="flex items-center gap-2 sm:border-l sm:pl-6 border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 hidden sm:inline">Logged as </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">{user.name}</span>
                <button
                  onClick={onLogout}
                  className="ml-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </div>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
