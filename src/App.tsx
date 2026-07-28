import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileNav } from './components/navigation/MobileNav';
import { Header } from './components/navigation/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { HabitManagementView } from './components/habits/HabitManagementView';
import { CalendarView } from './components/calendar/CalendarView';
import { StatisticsView } from './components/stats/StatisticsView';
import { HabitModal } from './components/habits/HabitModal';
import { DeleteConfirmModal } from './components/habits/DeleteConfirmModal';
import { Habit, HabitLog, HabitStatus, CategoryType } from './types';
import {
  subscribeUserHabits,
  subscribeHabitLogsForDate,
  subscribeAllHabitLogs,
  createHabit,
  updateHabit,
  deleteHabit,
  setHabitStatus,
  formatDateKey,
  calculateStats
} from './services/habitService';
import { CheckCircle2, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'calendar' | 'statistics'>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

  // Modal states
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  const selectedDateStr = formatDateKey(selectedDate);

  // Subscribe to user habits and logs when authenticated
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setTodayLogs([]);
      setAllLogs([]);
      return;
    }

    const unsubHabits = subscribeUserHabits(user.uid, (data) => {
      setHabits(data);
    });

    const unsubLogs = subscribeHabitLogsForDate(user.uid, selectedDateStr, (data) => {
      setTodayLogs(data);
    });

    const unsubAllLogs = subscribeAllHabitLogs(user.uid, (data) => {
      setAllLogs(data);
    });

    return () => {
      unsubHabits();
      unsubLogs();
      unsubAllLogs();
    };
  }, [user, selectedDateStr]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-md">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">
            Habit Flow
          </span>
        </div>
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Handle status toggle for a habit (supports optional target date string)
  const handleStatusChange = async (habitId: string, status: HabitStatus, targetDateStr?: string) => {
    if (!user) return;
    const dateToUpdate = targetDateStr || selectedDateStr;
    try {
      await setHabitStatus(user.uid, habitId, dateToUpdate, status);
    } catch (err) {
      console.error('Failed to set habit status:', err);
    }
  };

  // Handle Save Habit (Create or Edit)
  const handleSaveHabit = async (data: {
    name: string;
    description?: string;
    category: CategoryType;
    icon: string;
    color: string;
  }) => {
    if (!user) return;

    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
    } else {
      await createHabit(user.uid, data);
    }
    setEditingHabit(null);
  };

  // Handle Delete Habit
  const handleConfirmDelete = async (habitId: string) => {
    if (!user) return;
    await deleteHabit(user.uid, habitId);
    setDeletingHabit(null);
  };

  // Calculate stats
  const stats = calculateStats(habits, allLogs, selectedDateStr);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        habits={habits}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenCreateModal={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onOpenCreateModal={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
        />

        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              habits={habits}
              todayLogs={todayLogs}
              stats={stats}
              selectedDate={selectedDate}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onStatusChange={handleStatusChange}
              onOpenCreateModal={() => {
                setEditingHabit(null);
                setIsHabitModalOpen(true);
              }}
              onEditHabit={(habit) => {
                setEditingHabit(habit);
                setIsHabitModalOpen(true);
              }}
              onDeleteHabit={(habit) => {
                setDeletingHabit(habit);
              }}
            />
          )}

          {activeTab === 'habits' && (
            <HabitManagementView
              habits={habits}
              onOpenCreateModal={() => {
                setEditingHabit(null);
                setIsHabitModalOpen(true);
              }}
              onEditHabit={(habit) => {
                setEditingHabit(habit);
                setIsHabitModalOpen(true);
              }}
              onDeleteHabit={(habit) => {
                setDeletingHabit(habit);
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              habits={habits}
              allLogs={allLogs}
              onStatusChange={handleStatusChange}
            />
          )}

          {activeTab === 'statistics' && (
            <StatisticsView
              habits={habits}
              allLogs={allLogs}
              stats={stats}
            />
          )}
        </main>

        {/* Mobile Navigation Bar */}
        <MobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreateModal={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
        />
      </div>

      {/* Create / Edit Habit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        habit={deletingHabit}
        onClose={() => setDeletingHabit(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
