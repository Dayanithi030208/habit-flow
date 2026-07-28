import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Habit } from '../../types';

interface DeleteConfirmModalProps {
  habit: Habit | null;
  onClose: () => void;
  onConfirm: (habitId: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  habit,
  onClose,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);

  if (!habit) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onConfirm(habit.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Delete "{habit.name}"?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This will permanently delete this habit and all its logged history. This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none flex items-center justify-center min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Habit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
