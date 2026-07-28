import React from 'react';
import {
  TrendingUp,
  Award,
  Flame,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Calendar,
  Percent
} from 'lucide-react';
import { Habit, HabitLog, StreakStats, CategoryType, CATEGORY_COLORS } from '../../types';
import { formatDateKey } from '../../services/habitService';
import { IconHelper } from '../common/IconHelper';

interface StatisticsViewProps {
  habits: Habit[];
  allLogs: HabitLog[];
  stats: StreakStats;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  habits,
  allLogs,
  stats
}) => {
  const today = new Date();
  const todayStr = formatDateKey(today);

  // Helper to generate array of date strings going back N days
  const getLastNDays = (n: number): string[] => {
    const dates: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(formatDateKey(d));
    }
    return dates;
  };

  const last7Days = getLastNDays(7);
  const last30Days = getLastNDays(30);

  // Fast log lookup map: date -> (habitId -> status)
  const logMapByDate = new Map<string, Map<string, string>>();
  allLogs.forEach((log) => {
    if (!logMapByDate.has(log.date)) {
      logMapByDate.set(log.date, new Map());
    }
    logMapByDate.get(log.date)!.set(log.habitId, log.status);
  });

  // Calculate completion percentage for a list of dates
  const calculateRateForDates = (dates: string[]): number => {
    if (habits.length === 0 || dates.length === 0) return 0;
    let completedCount = 0;
    const totalPossible = habits.length * dates.length;

    dates.forEach((d) => {
      const dayMap = logMapByDate.get(d);
      if (dayMap) {
        habits.forEach((h) => {
          const st = dayMap.get(h.id);
          if (st === 'completed' || st === 'partial') {
            completedCount++;
          }
        });
      }
    });

    return Math.round((completedCount / totalPossible) * 100);
  };

  const weeklyCompletionRate = calculateRateForDates(last7Days);
  const monthlyCompletionRate = calculateRateForDates(last30Days);

  // Calculate per-habit stats for last 30 days
  const habitStats = habits.map((habit) => {
    let completedDays = 0;
    let partialDays = 0;
    let missedDays = 0;

    last30Days.forEach((d) => {
      const st = logMapByDate.get(d)?.get(habit.id);
      if (st === 'completed') completedDays++;
      else if (st === 'partial') partialDays++;
      else if (st === 'missed') missedDays++;
    });

    const successDays = completedDays + partialDays;
    const rate = Math.round((successDays / 30) * 100);

    return {
      habit,
      completedDays,
      partialDays,
      missedDays,
      successDays,
      rate
    };
  });

  // Sort by rate descending
  const sortedHabitStats = [...habitStats].sort((a, b) => b.rate - a.rate);

  const bestHabit = sortedHabitStats.length > 0 ? sortedHabitStats[0] : null;
  const leastHabit = sortedHabitStats.length > 1
    ? sortedHabitStats[sortedHabitStats.length - 1]
    : null;

  // Category breakdown calculation
  const categoryStatsMap = new Map<CategoryType, { totalHabits: number; completedLogs: number; possibleLogs: number }>();

  habits.forEach((h) => {
    const cat = h.category || 'Personal';
    if (!categoryStatsMap.has(cat)) {
      categoryStatsMap.set(cat, { totalHabits: 0, completedLogs: 0, possibleLogs: 0 });
    }
    const curr = categoryStatsMap.get(cat)!;
    curr.totalHabits += 1;
    curr.possibleLogs += 30;

    // Count completed logs in last 30 days
    last30Days.forEach((d) => {
      const st = logMapByDate.get(d)?.get(h.id);
      if (st === 'completed' || st === 'partial') {
        curr.completedLogs += 1;
      }
    });
  });

  const categoryBreakdown = Array.from(categoryStatsMap.entries()).map(([category, data]) => {
    const rate = data.possibleLogs > 0 ? Math.round((data.completedLogs / data.possibleLogs) * 100) : 0;
    return {
      category,
      totalHabits: data.totalHabits,
      completedLogs: data.completedLogs,
      rate
    };
  }).sort((a, b) => b.rate - a.rate);

  // Daily completion for last 7 days chart
  const weeklyChartData = last7Days.map((dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    let completed = 0;
    const dayMap = logMapByDate.get(dateStr);

    if (dayMap && habits.length > 0) {
      habits.forEach((h) => {
        const st = dayMap.get(h.id);
        if (st === 'completed' || st === 'partial') completed++;
      });
    }

    const rate = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;

    return {
      dateStr,
      dayName,
      formattedDate,
      completed,
      total: habits.length,
      rate,
      isToday: dateStr === todayStr
    };
  });

  return (
    <div className="space-y-8 pb-24 md:pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Analytics & Statistics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              In-depth view of habit performance, trends, and category consistency
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Completion */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Weekly Completion
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {weeklyCompletionRate}%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">last 7 days</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${weeklyCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Completion */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Monthly Completion
            </span>
            <Percent className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {monthlyCompletionRate}%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">last 30 days</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${monthlyCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Current Streak
            </span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {stats.currentStreak}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stats.currentStreak === 1 ? 'day active' : 'days active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              {stats.currentStreak > 0 ? 'Keep the momentum going!' : 'Complete habits today to ignite your streak'}
            </p>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Longest Streak
            </span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {stats.longestStreak}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stats.longestStreak === 1 ? 'day record' : 'days record'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              All-time personal consistency record
            </p>
          </div>
        </div>
      </div>

      {/* Best vs Least Performing Habit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Best Performing Habit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Best Performing Habit
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Last 30 Days</span>
          </div>

          {bestHabit ? (
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: `${bestHabit.habit.color}20`, color: bestHabit.habit.color }}
                >
                  <IconHelper name={bestHabit.habit.icon} size={22} />
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    {bestHabit.habit.name}
                  </h3>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {bestHabit.habit.category}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {bestHabit.rate}%
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  {bestHabit.successDays}/30 days
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4">No habits available yet.</p>
          )}
        </div>

        {/* Least Consistent Habit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Needs Attention
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Least Consistent</span>
          </div>

          {leastHabit ? (
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: `${leastHabit.habit.color}20`, color: leastHabit.habit.color }}
                >
                  <IconHelper name={leastHabit.habit.icon} size={22} />
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    {leastHabit.habit.name}
                  </h3>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {leastHabit.habit.category}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                  {leastHabit.rate}%
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  {leastHabit.successDays}/30 days
                </p>
              </div>
            </div>
          ) : bestHabit ? (
            <p className="text-xs text-slate-400 py-4 italic">
              Add more habits to view comparison statistics.
            </p>
          ) : (
            <p className="text-xs text-slate-400 py-4 italic">No habits available yet.</p>
          )}
        </div>
      </div>

      {/* Weekly Visual Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              7-Day Completion Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily habit completion rates over the past week
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Completion Rate</span>
          </div>
        </div>

        {/* Clean Bar Visualizer */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          {weeklyChartData.map((item) => (
            <div key={item.dateStr} className="flex flex-col items-center h-full justify-end group">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {item.rate}%
              </span>

              <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-2xl h-full flex items-end p-1 relative">
                <div
                  className={`w-full rounded-xl transition-all duration-500 ${
                    item.isToday
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md'
                      : 'bg-indigo-500/80 hover:bg-indigo-500'
                  }`}
                  style={{ height: `${Math.max(8, item.rate)}%` }}
                />
              </div>

              <div className="mt-2 text-center">
                <p className={`text-xs font-bold ${item.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.dayName}
                </p>
                <p className="text-[10px] text-slate-400">{item.formattedDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion By Category */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Completion by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              30-day breakdown across active categories
            </p>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
            <Layers className="w-4 h-4" />
            <span>{categoryBreakdown.length} Categories</span>
          </div>
        </div>

        {categoryBreakdown.length > 0 ? (
          <div className="space-y-4">
            {categoryBreakdown.map((item) => {
              const catConfig = CATEGORY_COLORS[item.category as CategoryType];
              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${catConfig ? catConfig.text.replace('text-', 'bg-') : 'bg-slate-400'}`} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.category}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({item.totalHabits} {item.totalHabits === 1 ? 'habit' : 'habits'})
                      </span>
                    </div>

                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {item.rate}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        catConfig ? catConfig.text.replace('text-', 'bg-') : 'bg-indigo-500'
                      }`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No category data available.
          </p>
        )}
      </div>
    </div>
  );
};
