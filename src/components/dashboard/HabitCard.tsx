import React from 'react';
import { Check, AlertCircle, X, Edit2, Trash2, Calendar } from 'lucide-react';
import { Habit, HabitStatus } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import { IconHelper } from '../common/IconHelper';

interface HabitCardProps {
  habit: Habit;
  currentStatus: HabitStatus; // 'completed' | 'partial' | 'missed' | 'unlogged'
  onStatusChange: (habitId: string, status: HabitStatus) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  currentStatus,
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const handleStatusClick = (targetStatus: 'completed' | 'partial' | 'missed') => {
    if (currentStatus === targetStatus) {
      // Toggle off back to unlogged
      onStatusChange(habit.id, 'unlogged');
    } else {
      onStatusChange(habit.id, targetStatus);
    }
  };

  const createdDateFormatted = habit.createdAt
    ? new Date(habit.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <div
      className={`relative group bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all duration-300 shadow-2xs hover:shadow-lg hover:-translate-y-1 ${
        currentStatus === 'completed'
          ? 'border-emerald-300/90 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
          : currentStatus === 'partial'
          ? 'border-amber-300/90 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
          : currentStatus === 'missed'
          ? 'border-rose-300/80 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/20'
          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Title & Description */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Icon Box */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${habit.color}15`,
              color: habit.color
            }}
          >
            <IconHelper name={habit.icon} size={22} />
          </div>

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                {habit.name}
              </h3>
              <CategoryBadge category={habit.category} />
            </div>

            {habit.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                {habit.description}
              </p>
            )}

            {/* Created Date */}
            {createdDateFormatted && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Created {createdDateFormatted}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Edit and Quick Delete buttons */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            title="Quick Edit Habit"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit)}
            title="Quick Delete Habit"
            className="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom: Status Control Buttons */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Today's Status:
          </span>
          {currentStatus !== 'unlogged' && (
            <span
              className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                currentStatus === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : currentStatus === 'partial'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {currentStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Completed Button */}
          <button
            type="button"
            onClick={() => handleStatusClick('completed')}
            title="Mark Completed"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
              currentStatus === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold ring-2 ring-emerald-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Completed</span>
          </button>

          {/* Partial Button */}
          <button
            type="button"
            onClick={() => handleStatusClick('partial')}
            title="Mark Partial"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
              currentStatus === 'partial'
                ? 'bg-amber-500 text-white shadow-sm font-semibold ring-2 ring-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Partial</span>
          </button>

          {/* Missed Button */}
          <button
            type="button"
            onClick={() => handleStatusClick('missed')}
            title="Mark Missed"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
              currentStatus === 'missed'
                ? 'bg-rose-600 text-white shadow-sm font-semibold ring-2 ring-rose-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300'
            }`}
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Missed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
