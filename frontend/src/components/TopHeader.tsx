import React from 'react';
import { Search, Bell } from 'lucide-react';

interface TopHeaderProps {
  onSearch?: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onSearch }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search judgments, cases, or citations..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <div className="absolute right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-400 font-mono font-medium shadow-2xs">
            <span>Ctrl + K</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            YP
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-800">Yogesh Pandey</div>
            <div className="text-[10px] text-slate-400 font-medium">B.Tech CSE - 2nd Year</div>
          </div>
        </div>
      </div>
    </header>
  );
};
