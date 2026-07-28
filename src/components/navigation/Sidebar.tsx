import React from 'react';
import { LayoutDashboard, ListCheck, Calendar as CalendarIcon, BarChart3, LogOut, CheckCircle2, Tag, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { Habit, CategoryType, CATEGORY_COLORS } from '../../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'habits' | 'calendar' | 'statistics';
  setActiveTab: (tab: 'dashboard' | 'habits' | 'calendar' | 'statistics') => void;
  onOpenCreateModal: () => void;
  habits?: Habit[];
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  habits = [],
  selectedCategory = 'All',
  setSelectedCategory
}) => {
  const { userProfile, user, logout } = useAuth();

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = userProfile?.email || user?.email || '';

  // Calculate dynamic category counts from user habits
  const categoryCounts = habits.reduce((acc, habit) => {
    if (habit.category) {
      acc[habit.category] = (acc[habit.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const dynamicCategories = Object.keys(categoryCounts).sort();

  const handleCategoryClick = (cat: string) => {
    if (setSelectedCategory) {
      setSelectedCategory(cat);
    }
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md h-screen sticky top-0 p-4 justify-between select-none">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-sm">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-tight tracking-tight">
                Habit Flow
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Daily Tracker
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Action Button */}
        <div className="px-1">
          <button
            onClick={onOpenCreateModal}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-sm rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <span className="text-base font-normal">+</span>
            <span>New Habit</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 stroke-[2]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('habits')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'habits'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ListCheck className="w-4 h-4 stroke-[2]" />
            <span>Manage Habits</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4 stroke-[2]" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('statistics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'statistics'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 stroke-[2]" />
            <span>Statistics</span>
          </button>

          {/* Categories Header */}
          <div className="pt-4 pb-1.5 flex items-center justify-between px-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Categories
            </span>
          </div>

          <div className="space-y-0.5">
            {/* All Habits Filter */}
            <button
              onClick={() => handleCategoryClick('All')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard' && selectedCategory === 'All'
                  ? 'bg-slate-900/10 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>All Habits</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 font-semibold">
                {habits.length}
              </span>
            </button>

            {/* Dynamic Categories */}
            {dynamicCategories.length > 0 ? (
              dynamicCategories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = activeTab === 'dashboard' && selectedCategory === cat;
                const categoryConfig = CATEGORY_COLORS[cat as CategoryType];
                
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-900/10 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${categoryConfig ? categoryConfig.text.replace('text-', 'bg-') : 'bg-slate-400'}`} />
                      <span className="truncate">{cat}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      ({count})
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                No active categories
              </p>
            )}
          </div>
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3 mt-auto">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-semibold text-xs shrink-0 uppercase">
              {displayName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
