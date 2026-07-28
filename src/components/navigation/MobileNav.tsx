import React from 'react';
import { LayoutDashboard, ListCheck, Calendar as CalendarIcon, BarChart3, Plus } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'dashboard' | 'habits' | 'calendar' | 'statistics';
  setActiveTab: (tab: 'dashboard' | 'habits' | 'calendar' | 'statistics') => void;
  onOpenCreateModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-colors ${
            activeTab === 'dashboard'
              ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100/80 dark:bg-slate-800/80'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] xs:text-[11px] mt-0.5 font-medium">Today</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-colors ${
            activeTab === 'calendar'
              ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100/80 dark:bg-slate-800/80'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] xs:text-[11px] mt-0.5 font-medium">Calendar</span>
        </button>

        <button
          onClick={onOpenCreateModal}
          aria-label="Create Habit"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-colors ${
            activeTab === 'statistics'
              ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100/80 dark:bg-slate-800/80'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] xs:text-[11px] mt-0.5 font-medium">Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-colors ${
            activeTab === 'habits'
              ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100/80 dark:bg-slate-800/80'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ListCheck className="w-5 h-5" />
          <span className="text-[10px] xs:text-[11px] mt-0.5 font-medium">Habits</span>
        </button>
      </div>
    </div>
  );
};
