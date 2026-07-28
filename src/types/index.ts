export type CategoryType = 
  | 'Career'
  | 'Health'
  | 'Fitness'
  | 'Learning'
  | 'Reading'
  | 'Mind'
  | 'Personal';

export type HabitStatus = 'completed' | 'partial' | 'missed' | 'unlogged';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  theme?: 'light' | 'dark';
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: CategoryType;
  icon: string;
  color: string;
  createdAt: string;
  archived?: boolean;
  // Scalable Goal & Notification parameters
  targetFrequency?: number; // Times per week/month
  targetUnit?: string; // e.g. "mins", "pages", "reps"
  reminderTime?: string; // HH:MM format
  targetDays?: number[]; // [0,1,2,3,4,5,6]
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'partial' | 'missed';
  updatedAt: string;
  // Scalable Journal & Analytics parameters
  notes?: string; // Reflection or Journal note for the date
  value?: number; // Numeric metric logged (e.g. 30 mins)
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  habitId?: string;
  title: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  todayCompletionRate: number; // percentage 0-100
  completedTodayCount: number;
  totalHabitsToday: number;
}

export const DEFAULT_CATEGORIES: CategoryType[] = [
  'Career',
  'Health',
  'Fitness',
  'Learning',
  'Reading',
  'Mind',
  'Personal'
];

export const CATEGORY_COLORS: Record<CategoryType, { bg: string; text: string; border: string; darkBg: string; darkText: string }> = {
  Career: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', darkBg: 'dark:bg-blue-950/40', darkText: 'dark:text-blue-300' },
  Health: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', darkBg: 'dark:bg-emerald-950/40', darkText: 'dark:text-emerald-300' },
  Fitness: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', darkBg: 'dark:bg-orange-950/40', darkText: 'dark:text-orange-300' },
  Learning: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', darkBg: 'dark:bg-purple-950/40', darkText: 'dark:text-purple-300' },
  Reading: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', darkBg: 'dark:bg-amber-950/40', darkText: 'dark:text-amber-300' },
  Mind: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', darkBg: 'dark:bg-teal-950/40', darkText: 'dark:text-teal-300' },
  Personal: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', darkBg: 'dark:bg-indigo-950/40', darkText: 'dark:text-indigo-300' },
};

export const AVAILABLE_ICONS = [
  'Flame',
  'Dumbbell',
  'BookOpen',
  'Brain',
  'Heart',
  'Briefcase',
  'Sparkles',
  'Smile',
  'Sun',
  'Droplets',
  'Target',
  'Compass',
  'Coffee',
  'Activity',
  'Apple',
  'Award',
  'CheckCircle2',
  'Code',
  'Feather',
  'Footprints',
  'GraduationCap',
  'Laptop',
  'Moon',
  'Music',
  'PenTool',
  'Shield',
  'SmilePlus',
  'Zap'
];

export const AVAILABLE_COLORS = [
  { name: 'Indigo', value: '#6366f1', bgClass: 'bg-indigo-500' },
  { name: 'Emerald', value: '#10b981', bgClass: 'bg-emerald-500' },
  { name: 'Amber', value: '#f59e0b', bgClass: 'bg-amber-500' },
  { name: 'Rose', value: '#f43f5e', bgClass: 'bg-rose-500' },
  { name: 'Sky', value: '#0ea5e9', bgClass: 'bg-sky-500' },
  { name: 'Violet', value: '#8b5cf6', bgClass: 'bg-violet-500' },
  { name: 'Teal', value: '#14b8a6', bgClass: 'bg-teal-500' },
  { name: 'Slate', value: '#64748b', bgClass: 'bg-slate-500' },
];
