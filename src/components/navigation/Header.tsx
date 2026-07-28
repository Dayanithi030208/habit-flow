import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { formatDateKey } from '../../services/habitService';

interface HeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  setSelectedDate,
  onOpenCreateModal
}) => {
  const { userProfile, user, logout } = useAuth();

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Friend';

  // Greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const isToday = formatDateKey(selectedDate) === formatDateKey(new Date());

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleResetToday = () => {
    setSelectedDate(new Date());
  };

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-20 px-4 md:px-8 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Greeting */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {getGreeting()}, <span className="font-bold">{displayName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Focus on one day at a time. Consistency compounds.
          </p>
        </div>

        {/* Right: Date Navigation & Mobile Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Day Navigation Pill */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={handlePrevDay}
              title="Previous Day"
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetToday}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                isToday
                  ? 'bg-white dark:bg-slate-700 font-semibold text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{isToday ? 'Today' : formattedDate}</span>
            </button>

            <button
              onClick={handleNextDay}
              title="Next Day"
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop CTA */}
          <button
            onClick={onOpenCreateModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs rounded-lg transition-all shadow-2xs active:scale-95"
          >
            <span>+ New Habit</span>
          </button>

          {/* Mobile Theme & Logout */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
