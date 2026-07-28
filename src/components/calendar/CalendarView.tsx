import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
  Flame,
  Tag,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { Habit, HabitLog, HabitStatus, CategoryType, CATEGORY_COLORS } from '../../types';
import { formatDateKey } from '../../services/habitService';
import { IconHelper } from '../common/IconHelper';

interface CalendarViewProps {
  habits: Habit[];
  allLogs: HabitLog[];
  onStatusChange: (habitId: string, status: HabitStatus, dateString?: string) => Promise<void> | void;
}

export type DayStatus = 'all_completed' | 'some_completed' | 'mostly_missed' | 'no_activity';

interface DaySummary {
  status: DayStatus;
  rate: number;
  completedLogs: { habit: Habit; log?: HabitLog }[];
  partialLogs: { habit: Habit; log?: HabitLog }[];
  missedLogs: { habit: Habit; log?: HabitLog }[];
  unloggedHabits: Habit[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  habits,
  allLogs,
  onStatusChange
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDayStr, setSelectedDayStr] = useState<string>(formatDateKey(today));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDayStr(formatDateKey(now));
  };

  // Build map of logs by date for fast lookup
  const logsByDate = new Map<string, HabitLog[]>();
  allLogs.forEach((log) => {
    if (!logsByDate.has(log.date)) {
      logsByDate.set(log.date, []);
    }
    logsByDate.get(log.date)!.push(log);
  });

  // Calculate day summary for any date string
  const getDaySummary = (dateStr: string): DaySummary => {
    const logsForDate = logsByDate.get(dateStr) || [];

    if (habits.length === 0) {
      return {
        status: 'no_activity',
        rate: 0,
        completedLogs: [],
        partialLogs: [],
        missedLogs: [],
        unloggedHabits: []
      };
    }

    const logMap = new Map<string, HabitLog>();
    logsForDate.forEach((l) => logMap.set(l.habitId, l));

    const completedLogs: { habit: Habit; log?: HabitLog }[] = [];
    const partialLogs: { habit: Habit; log?: HabitLog }[] = [];
    const missedLogs: { habit: Habit; log?: HabitLog }[] = [];
    const unloggedHabits: Habit[] = [];

    habits.forEach((h) => {
      const l = logMap.get(h.id);
      if (!l) {
        unloggedHabits.push(h);
      } else if (l.status === 'completed') {
        completedLogs.push({ habit: h, log: l });
      } else if (l.status === 'partial') {
        partialLogs.push({ habit: h, log: l });
      } else if (l.status === 'missed') {
        missedLogs.push({ habit: h, log: l });
      } else {
        unloggedHabits.push(h);
      }
    });

    const totalLogged = completedLogs.length + partialLogs.length + missedLogs.length;

    if (totalLogged === 0) {
      return {
        status: 'no_activity',
        rate: 0,
        completedLogs,
        partialLogs,
        missedLogs,
        unloggedHabits
      };
    }

    const rate = Math.round((completedLogs.length / habits.length) * 100);

    let status: DayStatus = 'no_activity';
    if (completedLogs.length === habits.length) {
      status = 'all_completed';
    } else if (completedLogs.length > 0 || partialLogs.length > 0) {
      status = 'some_completed';
    } else if (missedLogs.length > 0) {
      status = 'mostly_missed';
    }

    return {
      status,
      rate,
      completedLogs,
      partialLogs,
      missedLogs,
      unloggedHabits
    };
  };

  // Calendar Grid Days Generation
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon, ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysGrid: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDate - i;
    const prevDate = new Date(year, month - 1, dayNum);
    daysGrid.push({
      dateStr: formatDateKey(prevDate),
      dayNumber: dayNum,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const currDate = new Date(year, month, day);
    daysGrid.push({
      dateStr: formatDateKey(currDate),
      dayNumber: day,
      isCurrentMonth: true
    });
  }

  // Next month padding days to complete 35 or 42 grid cells
  const remainingCells = (7 - (daysGrid.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(year, month + 1, day);
    daysGrid.push({
      dateStr: formatDateKey(nextDate),
      dayNumber: day,
      isCurrentMonth: false
    });
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = formatDateKey(today);

  // Selected day details
  const selectedDaySummary = getDaySummary(selectedDayStr);
  const [selYear, selMonth, selDay] = selectedDayStr.split('-').map(Number);
  const selectedDateObj = new Date(selYear, selMonth - 1, selDay);
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Habit Calendar
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track consistency across days and review historical progress
            </p>
          </div>
        </div>

        {/* Month Navigation Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[120px] text-center">
            {monthName}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 ml-1 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all shadow-2xs active:scale-95"
          >
            Today
          </button>
        </div>
      </div>

      {/* Legend Indicator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-xs font-medium">
        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          Status Legend:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs" />
            <span className="text-slate-700 dark:text-slate-300">All Completed (100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-2xs" />
            <span className="text-slate-700 dark:text-slate-300">Some Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-2xs" />
            <span className="text-slate-700 dark:text-slate-300">Mostly Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-slate-500 dark:text-slate-400">No Activity</span>
          </div>
        </div>
      </div>

      {/* Main Grid & Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid Container (8 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 p-3 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-2 text-center text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysGrid.map(({ dateStr, dayNumber, isCurrentMonth }) => {
              const summary = getDaySummary(dateStr);
              const isTodayDate = dateStr === todayStr;
              const isSelected = dateStr === selectedDayStr;

              // Color classes based on status
              let bgClass = 'bg-slate-50/60 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800/60';
              let badgeColor = 'bg-slate-300 dark:bg-slate-700';

              if (summary.status === 'all_completed') {
                bgClass = 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800/60';
                badgeColor = 'bg-emerald-500';
              } else if (summary.status === 'some_completed') {
                bgClass = 'bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800/60';
                badgeColor = 'bg-amber-500';
              } else if (summary.status === 'mostly_missed') {
                bgClass = 'bg-rose-500/10 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800/60';
                badgeColor = 'bg-rose-500';
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDayStr(dateStr)}
                  className={`relative min-h-[52px] sm:min-h-[76px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between items-start text-left select-none ${bgClass} ${
                    !isCurrentMonth ? 'opacity-35 hover:opacity-70' : 'hover:border-slate-400 dark:hover:border-slate-600'
                  } ${
                    isSelected
                      ? 'ring-2 ring-slate-900 dark:ring-slate-100 shadow-md font-bold scale-[1.02] z-10'
                      : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-[11px] sm:text-sm font-semibold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ${
                        isTodayDate
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                          : ''
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {/* Status Dot */}
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${badgeColor}`} />
                  </div>

                  {/* Logged summary snippet inside cell */}
                  {summary.status !== 'no_activity' && (
                    <div className="w-full text-[9px] sm:text-[10px] font-semibold mt-0.5 flex items-center justify-between">
                      <span className="opacity-80">
                        {summary.completedLogs.length}/{habits.length}
                      </span>
                      <span className="hidden sm:inline font-bold">
                        {summary.rate}%
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel (4 cols on lg) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-5">
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Selected Date Details
                </span>
                {selectedDayStr === todayStr && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Today
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {formattedSelectedDate}
              </h2>
            </div>

            {/* Completion Percentage Meter */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Daily Completion
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedDaySummary.rate}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedDaySummary.rate}%` }}
                />
              </div>
            </div>

            {/* Grouped Habit Lists */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {/* Completed Habits */}
              {selectedDaySummary.completedLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed ({selectedDaySummary.completedLogs.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedDaySummary.completedLogs.map(({ habit }) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                          >
                            <IconHelper name={habit.icon} size={15} />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {habit.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onStatusChange(habit.id, 'unlogged', selectedDayStr)}
                          title="Click to reset"
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200"
                        >
                          Completed
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partial Habits */}
              {selectedDaySummary.partialLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Partial ({selectedDaySummary.partialLogs.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedDaySummary.partialLogs.map(({ habit }) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                          >
                            <IconHelper name={habit.icon} size={15} />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {habit.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onStatusChange(habit.id, 'unlogged', selectedDayStr)}
                          title="Click to reset"
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 hover:bg-amber-200"
                        >
                          Partial
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missed Habits */}
              {selectedDaySummary.missedLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missed ({selectedDaySummary.missedLogs.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedDaySummary.missedLogs.map(({ habit }) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                          >
                            <IconHelper name={habit.icon} size={15} />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {habit.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onStatusChange(habit.id, 'unlogged', selectedDayStr)}
                          title="Click to reset"
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 hover:bg-rose-200"
                        >
                          Missed
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unlogged Habits */}
              {selectedDaySummary.unloggedHabits.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Unlogged ({selectedDaySummary.unloggedHabits.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedDaySummary.unloggedHabits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                          >
                            <IconHelper name={habit.icon} size={15} />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                            {habit.name}
                          </span>
                        </div>

                        {/* Quick logging actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onStatusChange(habit.id, 'completed', selectedDayStr)}
                            title="Mark Completed"
                            className="p-1 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => onStatusChange(habit.id, 'partial', selectedDayStr)}
                            title="Mark Partial"
                            className="p-1 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                          <button
                            onClick={() => onStatusChange(habit.id, 'missed', selectedDayStr)}
                            title="Mark Missed"
                            className="p-1 rounded-md bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {habits.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-6 italic">
                  No habits created yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
