import React from 'react';
import {
  Scale,
  Home,
  Search,
  Layers,
  Clock,
  BookOpen,
  BarChart3,
  HelpCircle,
  Settings,
  Lightbulb,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'verify', label: 'Verify Quote', icon: Search },
    { id: 'batch', label: 'Batch Audit', icon: Layers },
    { id: 'history', label: 'Audit History', icon: Clock },
    { id: 'corpus', label: 'Landmark Corpus', icon: BookOpen },
    { id: 'benchmark', label: 'Benchmark & Eval', icon: BarChart3 },
    { id: 'methodology', label: 'Methodology', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col shrink-0 min-h-screen border-r border-slate-200/90 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <div
          onClick={() => onTabChange('home')}
          className="flex items-start gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 shrink-0 group-hover:bg-indigo-700 transition-colors">
            <Scale size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base text-slate-900">PRAMAN AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
              Intelligent Legal Quote Verification &amp; Evidence Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-50/90 text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Settings & Help */}
      <div className="px-3 py-2 space-y-0.5 border-t border-slate-100 text-xs">
        <button
          onClick={() => onTabChange('methodology')}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
        >
          <Settings size={15} className="text-slate-400" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => onTabChange('methodology')}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
        >
          <HelpCircle size={15} className="text-slate-400" />
          <span>Help &amp; Support</span>
        </button>
      </div>

      {/* Demo Mode Badge Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-3.5 text-xs flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Lightbulb size={15} />
          </div>
          <div>
            <div className="font-bold text-indigo-950 text-xs">Demo Mode</div>
            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
              This is a demo version with sample data. Results are for illustration only.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
