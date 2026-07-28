import React from 'react';
import { Flame, Award, CheckCircle2, Plus, Filter, Calendar as CalendarIcon, Clock, Percent, Target, Layers, Sparkles } from 'lucide-react';
import { Habit, HabitLog, HabitStatus, StreakStats, CATEGORY_COLORS, CategoryType } from '../../types';
import { HabitCard } from './HabitCard';
import { formatDateKey } from '../../services/habitService';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  habits: Habit[];
  todayLogs: HabitLog[];
  stats: StreakStats;
  selectedDate: Date;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
  onStatusChange: (habitId: string, status: HabitStatus) => void;
  onOpenCreateModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habit: Habit) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  habits,
  todayLogs,
  stats,
  selectedDate,
  selectedCategory = 'All',
  setSelectedCategory,
  onStatusChange,
  onOpenCreateModal,
  onEditHabit,
  onDeleteHabit
}) => {
  const { userProfile, user } = useAuth();

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Friend';

  // Calculate greeting according to current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const selectedDateStr = formatDateKey(selectedDate);
  const formattedTodayDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Map of logs for quick status lookup
  const statusMap = new Map<string, HabitStatus>();
  todayLogs.forEach((log) => {
    statusMap.set(log.habitId, log.status);
  });

  // Dynamic category list from user habits
  const activeCategories = Array.from(new Set(habits.map((h) => h.category))).sort();

  // Filter habits by category if selected
  const filteredHabits = habits.filter((habit) => {
    if (selectedCategory === 'All') return true;
    return habit.category === selectedCategory;
  });

  // Group habits by category
  const habitsByCategory = filteredHabits.reduce((acc, habit) => {
    const cat = habit.category || 'Personal';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);

  const totalHabitsCount = habits.length;
  const completedTodayCount = stats.completedTodayCount;
  const remainingTodayCount = Math.max(0, stats.totalHabitsToday - stats.completedTodayCount);

  return (
    <div className="space-y-8 pb-24 md:pb-12">
      {/* Top Banner: Greeting & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
        {/* Background Subtle Geometric Deco */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 font-medium text-xs">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{formattedTodayDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, <span className="text-indigo-200">{displayName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg font-normal">
            Build consistency through daily habits. Every completed task compounds into long-term growth.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 font-semibold text-xs rounded-2xl shadow-sm transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Metrics Grid (6 Key Dashboard Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Good Morning Greeting Badge / Streak */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Current Streak
            </span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.currentStreak}
            </span>
            <span className="text-xs text-slate-500 ml-1 font-medium">days</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Longest Streak
            </span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.longestStreak}
            </span>
            <span className="text-xs text-slate-500 ml-1 font-medium">days</span>
          </div>
        </div>

        {/* Completion Percentage */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Completion
            </span>
            <Percent className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.todayCompletionRate}%
            </span>
          </div>
        </div>

        {/* Total Habits */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Habits
            </span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {totalHabitsCount}
            </span>
            <span className="text-xs text-slate-500 ml-1 font-medium">habits</span>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Completed Today
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {completedTodayCount}
            </span>
            <span className="text-xs text-slate-500 ml-1 font-medium">done</span>
          </div>
        </div>

        {/* Remaining Today */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Remaining
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {remainingTodayCount}
            </span>
            <span className="text-xs text-slate-500 ml-1 font-medium">left</span>
          </div>
        </div>
      </div>

      {/* Dynamic Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 pr-1">
          <Filter className="w-3.5 h-3.5" />
          Category Filter:
        </span>

        <button
          onClick={() => setSelectedCategory && setSelectedCategory('All')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
            selectedCategory === 'All'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-2xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All ({habits.length})</span>
        </button>

        {activeCategories.map((cat) => {
          const count = habits.filter((h) => h.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory && setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Habits List Grouped By Category */}
      {filteredHabits.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(habitsByCategory).map(([categoryName, habitsList]) => {
            const categoryHabits = habitsList as Habit[];
            const categoryConfig = CATEGORY_COLORS[categoryName as CategoryType];
            return (
              <div key={categoryName} className="space-y-3.5">
                {/* Category Section Header */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        categoryConfig ? categoryConfig.text.replace('text-', 'bg-') : 'bg-slate-400'
                      }`}
                    />
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {categoryName}
                    </h2>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {categoryHabits.length} {categoryHabits.length === 1 ? 'habit' : 'habits'}
                    </span>
                  </div>
                </div>

                {/* Habit Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryHabits.map((habit) => {
                    const status = statusMap.get(habit.id) || 'unlogged';
                    return (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        currentStatus={status}
                        onStatusChange={onStatusChange}
                        onEdit={onEditHabit}
                        onDelete={onDeleteHabit}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State Illustration & CTA */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 sm:p-14 text-center shadow-2xs max-w-lg mx-auto my-6 space-y-6">
          {/* Attractive Vector Illustration */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-emerald-100 dark:from-indigo-950/50 dark:to-emerald-950/50 rounded-full blur-xl opacity-70" />
            <div className="relative w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md">
              <Sparkles className="w-10 h-10 stroke-[1.6]" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {habits.length === 0 ? 'Create your first habit' : 'No habits in this category'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {habits.length === 0
                ? 'Start building consistent daily routines today. Track your habits, maintain streaks, and celebrate small wins.'
                : `There are currently no active habits tagged under "${selectedCategory}". Switch filters or create a new habit.`}
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-2xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Your First Habit</span>
          </button>
        </div>
      )}
    </div>
  );
};
