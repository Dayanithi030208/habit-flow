import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Habit, HabitLog, HabitStatus, CategoryType, StreakStats } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

/**
 * Subscribe to all non-archived habits for a specific user.
 */
export function subscribeUserHabits(
  userId: string,
  onUpdate: (habits: Habit[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'habits';
  const q = query(
    collection(db, path),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const habits: Habit[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.archived) {
          habits.push({
            id: docSnap.id,
            userId: data.userId,
            name: data.name,
            description: data.description || '',
            category: data.category as CategoryType,
            icon: data.icon || 'Flame',
            color: data.color || '#6366f1',
            createdAt: data.createdAt || new Date().toISOString(),
            archived: data.archived || false,
            targetFrequency: data.targetFrequency,
            targetUnit: data.targetUnit,
            reminderTime: data.reminderTime,
            targetDays: data.targetDays
          });
        }
      });
      // Sort habits by creation date descending
      habits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(habits);
    },
    (err) => {
      console.error('Error fetching habits:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Create a new habit.
 */
export async function createHabit(
  userId: string,
  data: {
    name: string;
    description?: string;
    category: CategoryType;
    icon: string;
    color: string;
    targetFrequency?: number;
    targetUnit?: string;
    reminderTime?: string;
  }
): Promise<string> {
  const path = 'habits';
  try {
    const habitRef = doc(collection(db, path));
    const habitId = habitRef.id;

    const newHabit = {
      userId,
      name: data.name.trim(),
      description: (data.description || '').trim(),
      category: data.category,
      icon: data.icon,
      color: data.color,
      createdAt: new Date().toISOString(),
      archived: false,
      timestamp: serverTimestamp(),
      ...(data.targetFrequency ? { targetFrequency: data.targetFrequency } : {}),
      ...(data.targetUnit ? { targetUnit: data.targetUnit } : {}),
      ...(data.reminderTime ? { reminderTime: data.reminderTime } : {})
    };

    await setDoc(habitRef, newHabit);
    return habitId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Update an existing habit.
 */
export async function updateHabit(
  habitId: string,
  data: Partial<{
    name: string;
    description: string;
    category: CategoryType;
    icon: string;
    color: string;
    targetFrequency: number;
    targetUnit: string;
    reminderTime: string;
  }>
): Promise<void> {
  const path = `habits/${habitId}`;
  try {
    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Delete a habit and clean up associated logs.
 */
export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  const path = `habits/${habitId}`;
  try {
    const habitRef = doc(db, 'habits', habitId);
    await deleteDoc(habitRef);

    const q = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId),
      where('habitId', '==', habitId)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach((logDoc) => {
      batch.delete(logDoc.ref);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to habit logs for a specific date (YYYY-MM-DD).
 */
export function subscribeHabitLogsForDate(
  userId: string,
  dateString: string,
  onUpdate: (logs: HabitLog[]) => void
) {
  const path = 'habitLogs';
  const q = query(
    collection(db, path),
    where('userId', '==', userId),
    where('date', '==', dateString)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: HabitLog[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        logs.push({
          id: docSnap.id,
          habitId: d.habitId,
          userId: d.userId,
          date: d.date,
          status: d.status as 'completed' | 'partial' | 'missed',
          updatedAt: d.updatedAt || new Date().toISOString(),
          notes: d.notes,
          value: d.value
        });
      });
      onUpdate(logs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Subscribe to all habit logs for a user (used for calculating historic streaks).
 */
export function subscribeAllHabitLogs(
  userId: string,
  onUpdate: (logs: HabitLog[]) => void
) {
  const path = 'habitLogs';
  const q = query(
    collection(db, path),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: HabitLog[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        logs.push({
          id: docSnap.id,
          habitId: d.habitId,
          userId: d.userId,
          date: d.date,
          status: d.status as 'completed' | 'partial' | 'missed',
          updatedAt: d.updatedAt || new Date().toISOString(),
          notes: d.notes,
          value: d.value
        });
      });
      onUpdate(logs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Upsert or remove a status for a habit on a given date.
 */
export async function setHabitStatus(
  userId: string,
  habitId: string,
  dateString: string,
  status: HabitStatus,
  notes?: string,
  value?: number
): Promise<void> {
  const logDocId = `${userId}_${habitId}_${dateString}`;
  const path = `habitLogs/${logDocId}`;
  const logRef = doc(db, 'habitLogs', logDocId);

  try {
    if (status === 'unlogged') {
      await deleteDoc(logRef);
      return;
    }

    await setDoc(
      logRef,
      {
        habitId,
        userId,
        date: dateString,
        status,
        updatedAt: new Date().toISOString(),
        timestamp: serverTimestamp(),
        ...(notes !== undefined ? { notes } : {}),
        ...(value !== undefined ? { value } : {})
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Format Date object to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper to convert YYYY-MM-DD to UTC epoch day count
 */
function dateStringToEpochDays(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcDate = Date.UTC(y, m - 1, d);
  return Math.floor(utcDate / (1000 * 60 * 60 * 24));
}

/**
 * Convert UTC epoch day count back to YYYY-MM-DD
 */
function epochDaysToDateString(epochDays: number): string {
  const utcDate = new Date(epochDays * 80000000 + 64000000); // approximate
  const d = new Date(epochDays * 86400000);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compute streaks & completion rates based on habits and all habit logs.
 */
export function calculateStats(
  habits: Habit[],
  allLogs: HabitLog[],
  selectedDateStr: string = formatDateKey(new Date())
): StreakStats {
  if (habits.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      todayCompletionRate: 0,
      completedTodayCount: 0,
      totalHabitsToday: 0
    };
  }

  // Map logs by date and habit
  const logsByDate = new Map<string, Map<string, string>>();
  allLogs.forEach((log) => {
    if (!logsByDate.has(log.date)) {
      logsByDate.set(log.date, new Map());
    }
    logsByDate.get(log.date)!.set(log.habitId, log.status);
  });

  // Calculate today completion stats
  const selectedDayMap = logsByDate.get(selectedDateStr);
  let completedTodayCount = 0;

  habits.forEach((habit) => {
    const st = selectedDayMap?.get(habit.id);
    if (st === 'completed' || st === 'partial') {
      completedTodayCount++;
    }
  });

  const todayCompletionRate = Math.round(
    (completedTodayCount / habits.length) * 100
  );

  // Helper to test if a date was "successful"
  const isDaySuccessful = (dateStr: string): boolean => {
    const dayMap = logsByDate.get(dateStr);
    if (!dayMap || dayMap.size === 0) return false;

    let totalCompleted = 0;
    habits.forEach((habit) => {
      const st = dayMap.get(habit.id);
      if (st === 'completed' || st === 'partial') {
        totalCompleted++;
      }
    });

    return totalCompleted > 0 && totalCompleted >= Math.ceil(habits.length * 0.4);
  };

  // Streak calculations using epoch day offsets
  const todayStr = formatDateKey(new Date());
  const todayEpochDays = dateStringToEpochDays(todayStr);

  let currentStreak = 0;
  let checkEpochDay = todayEpochDays;

  // Check today first
  const isTodayDone = isDaySuccessful(todayStr);

  if (isTodayDone) {
    currentStreak++;
    checkEpochDay--; // move to yesterday
  } else {
    // If today is not done, check if yesterday was done to keep active streak
    const yesterdayStr = epochDaysToDateString(todayEpochDays - 1);
    if (isDaySuccessful(yesterdayStr)) {
      checkEpochDay = todayEpochDays - 1;
    } else {
      checkEpochDay = -1; // broken
    }
  }

  if (checkEpochDay > 0) {
    while (true) {
      const checkStr = epochDaysToDateString(checkEpochDay);
      if (checkStr === todayStr && isTodayDone) {
        checkEpochDay--;
        continue;
      }

      if (isDaySuccessful(checkStr)) {
        currentStreak++;
        checkEpochDay--;
      } else {
        break;
      }

      if (currentStreak > 3650) break; // safety ceiling
    }
  }

  // Calculate longest streak by analyzing sorted successful days
  const successfulEpochDays = Array.from(logsByDate.keys())
    .filter(isDaySuccessful)
    .map(dateStringToEpochDays)
    .sort((a, b) => a - b);

  let longestStreak = currentStreak;
  let tempStreak = 0;

  for (let i = 0; i < successfulEpochDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = successfulEpochDays[i - 1];
      const curr = successfulEpochDays[i];

      if (curr === prev + 1) {
        // Consecutive calendar day
        tempStreak++;
      } else if (curr === prev) {
        // Same day (duplicate safeguard)
        continue;
      } else {
        // Gap in calendar
        tempStreak = 1;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    longestStreak,
    todayCompletionRate,
    completedTodayCount,
    totalHabitsToday: habits.length
  };
}
