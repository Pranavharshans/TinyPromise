import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  FirestoreError
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebase';
import {
  Habit,
  HabitProgress,
  CreateHabitInput,
  UpdateHabitInput,
  HabitStats,
  OverallStats,
  HabitStreak
} from '../types/habit';
import { habitStorage } from './storage/habits';
import { notificationService } from './notifications';

const HABITS_COLLECTION = 'habits';

interface SyncMetadata {
  lastSynced: number;
  version: number;
  status: 'synced' | 'pending' | 'conflict';
}

interface StoredHabit extends Habit {
  _sync?: SyncMetadata;
}

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date | number | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Helper function to calculate streak end date
const calculateStreakEnd = (now: number, currentStreak: number): number => {
  if (currentStreak === 0) return 0;
  
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  
  // Add remaining days to complete 3-day streak
  const daysToAdd = 3 - currentStreak;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysToAdd);
  endDate.setHours(23, 59, 59, 999);
  
  return endDate.getTime();
};

// Helper function to handle Firestore errors
const handleFirestoreError = (error: FirestoreError | FirebaseError, operation: string): never => {
  console.error(`[HabitService] ${operation} error:`, error);
  
  switch (error.code) {
    case 'permission-denied':
      throw new Error('You do not have permission to perform this action');
    case 'not-found':
      throw new Error('The requested resource was not found');
    case 'already-exists':
      throw new Error('This habit already exists');
    case 'resource-exhausted':
      throw new Error('Too many requests. Please try again later');
    case 'failed-precondition':
      throw new Error('Operation cannot be performed in current state');
    case 'unavailable':
      throw new Error('Service temporarily unavailable. Please try again');
    default:
      throw new Error(`Firebase error: ${error.message}`);
  }
};

// Helper function to calculate completion rate
const calculateCompletionRate = (streakHistory: HabitStreak[], startDate: string): number => {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  const totalDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
  
  if (totalDays === 0) return 0;
  
  const completedDays = streakHistory.reduce((acc, streak) => {
    const streakStart = new Date(streak.startDate).getTime();
    const streakEnd = new Date(streak.endDate).getTime();
    return acc + Math.ceil((streakEnd - streakStart) / (1000 * 60 * 60 * 24));
  }, 0);
  
  return (completedDays / totalDays) * 100;
};

// Calculate individual habit statistics
const calculateHabitStats = (habit: Habit): HabitStats => {
  const longestStreak = Math.max(
    habit.currentStreak,
    ...habit.streakHistory.map(streak => {
      const start = new Date(streak.startDate).getTime();
      const end = new Date(streak.endDate).getTime();
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    })
  );

  return {
    completionRate: calculateCompletionRate(habit.streakHistory, habit.createdAt),
    longestStreak,
    currentStreak: habit.currentStreak,
    totalCompletions: habit.streakHistory.length * 3, // Each streak is 3 days
    startDate: habit.createdAt,
    lastCompletedDate: habit.lastChecked || habit.createdAt
  };
};

// Calculate overall statistics across all habits
const calculateOverallStats = (habits: Habit[]): OverallStats => {
  const activeHabits = habits.filter(h => h.status === 'active');
  const completedHabits = habits.filter(h => h.status === 'completed');
  
  const totalStreaks = habits.reduce((acc, h) => acc + h.totalStreaks, 0);
  const averageStreak = habits.length ? totalStreaks / habits.length : 0;
  
  const habitStats = habits.map(h => ({
    habit: h,
    stats: calculateHabitStats(h)
  }));
  
  const topPerforming = habitStats.reduce((top, current) => {
    if (!top || current.stats.completionRate > top.stats.completionRate) {
      return current;
    }
    return top;
  }, null as { habit: Habit; stats: HabitStats } | null);

  // Calculate longest streak across all habits
  const longestStreak = Math.max(...habits.map(h => h.longestStreak || 0), 0);
  
  // Calculate current streak across all habits
  const currentStreak = Math.max(...habits.map(h => h.currentStreak || 0), 0);
  
  // Calculate total streaks completed
  const streaksCompleted = habits.reduce((acc, h) => acc + (h.streaksCompleted || 0), 0);
  
  // Calculate average completion rate
  const completionRate = habits.length ?
    habitStats.reduce((acc, h) => acc + h.stats.completionRate, 0) / habits.length : 0;
  
  return {
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
    completedHabits: completedHabits.length,
    currentStreak,
    longestStreak,
    streaksCompleted,
    completionRate,
    averageStreak,
    topPerformingHabit: topPerforming?.habit.title || ''
  };
};

export const habitService = {
  /**
   * Create a new habit
   */
  async createHabit(
    userId: string,
    input: CreateHabitInput
  ): Promise<Habit> {
    try {
      console.log('[HabitService] Creating new habit:', { title: input.title, userId });
      
      // Validate input
      if (!userId) throw new Error('User ID is required');
      if (!input.title.trim()) throw new Error('Habit title is required');
      
      const habitData: Omit<Habit, 'id'> = {
        userId,
        title: input.title.trim(),
        description: input.description?.trim(),
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        streaksCompleted: 0,
        totalStreaks: 0,
        checkInHistory: [],
        streakHistory: [],
        streakFreezes: [],
        reminder: {
          enabled: input.reminder?.enabled ?? false,
          time: input.reminder?.time ?? "09:00"
        },
        status: 'active' as const,
        order: Date.now()
      };

      // Create locally first for immediate feedback
      const habitsRef = collection(db, HABITS_COLLECTION);
      const newHabitRef = doc(habitsRef);
      const newHabit: StoredHabit = {
        id: newHabitRef.id,
        ...habitData,
        _sync: {
          lastSynced: Date.now(),
          version: 1,
          status: 'pending'
        }
      };

      await habitStorage.addHabit(userId, newHabit);

      // Schedule notification if enabled
      if (input.reminder?.enabled) {
        try {
          const notificationId = await notificationService.scheduleHabitReminder(
            newHabit.id,
            input.reminder.time
          );
          newHabit.reminder.notificationId = notificationId;
        } catch (error: unknown) {
          console.error('[HabitService] Failed to schedule notification:', error);
        }
      }

      // Then create in Firebase with timeout
      const createPromise = setDoc(newHabitRef, habitData);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );

      try {
        await Promise.race([createPromise, timeoutPromise]);
        const { _sync, ...habitOnly } = newHabit;
        return habitOnly;
      } catch (error) {
        console.error('[HabitService] Firebase create failed:', error);
        // Firebase creation failed but we have local data
        await habitStorage.updateHabit(userId, newHabit);
        const { _sync, ...habitOnly } = newHabit;
        return habitOnly;
      }
    } catch (error) {
      console.error('[HabitService] Create habit error:', error);
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Create habit');
      }
      throw error;
    }
  },

  /**
   * Get all habits for a user
   */
  async getUserHabits(userId: string): Promise<Habit[]> {
    try {
      console.log('[HabitService] Fetching habits for user:', userId);
      
      if (!userId) throw new Error('User ID is required');

      // First try to get from local storage
      const localHabits = await habitStorage.getHabits(userId);
      
      // If we have local data, return it immediately
      if (localHabits.length > 0) {
        console.log('[HabitService] Returning habits from local storage:', localHabits.length);
        
        // Fetch from Firebase in background
        this.syncWithFirebase(userId).catch(error => {
          console.error('[HabitService] Background sync error:', error);
        });
        
        return localHabits.map(habit => {
          const { _sync, ...habitData } = habit;
          return habitData;
        });
      }

      // If no local data, fetch from Firebase
      const habitsRef = collection(db, HABITS_COLLECTION);
      const q = query(
        habitsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const habits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];

      // Save to local storage with sync metadata
      const storedHabits: StoredHabit[] = habits.map(habit => ({
        ...habit,
        _sync: {
          lastSynced: Date.now(),
          version: 1,
          status: 'synced'
        }
      }));

      await habitStorage.saveHabits(userId, storedHabits);

      console.log('[HabitService] Found habits:', habits.length);
      return habits;
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Get user habits');
      }
      throw error;
    }
  },

  /**
   * Get a single habit by ID
   */
  async getHabit(habitId: string, userId: string): Promise<Habit | null> {
    try {
      console.log('[HabitService] Fetching habit:', habitId);
      
      if (!habitId) throw new Error('Habit ID is required');
      if (!userId) throw new Error('User ID is required');
      
      // Try to find in local storage first
      const storedHabits = await habitStorage.getHabits(userId);
      const localHabit = storedHabits.find(h => h.id === habitId);
      
      if (localHabit) {
        const { _sync, ...habitData } = localHabit;
        return habitData;
      }

      // If not in local storage, fetch from Firebase
      const habitRef = doc(db, HABITS_COLLECTION, habitId);
      const habitDoc = await getDoc(habitRef);

      if (!habitDoc.exists()) {
        console.log('[HabitService] Habit not found');
        return null;
      }

      const habit = {
        id: habitDoc.id,
        ...habitDoc.data()
      } as Habit;

      // Store in local storage for next time
      await habitStorage.updateHabit(userId, {
        ...habit,
        _sync: {
          lastSynced: Date.now(),
          version: 1,
          status: 'synced'
        }
      });

      return habit;
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Get habit');
      }
      throw error;
    }
  },

  /**
   * Update a habit's streak
   */
  async updateStreak(habitId: string, completed: boolean, userId: string): Promise<HabitProgress> {
    try {
      console.log('[HabitService] Updating streak:', { habitId, completed });
      
      if (!habitId) throw new Error('Habit ID is required');
      if (!userId) throw new Error('User ID is required');

      // First check if habit exists in Firebase
      const habitRef = doc(db, HABITS_COLLECTION, habitId);
      const habitDoc = await getDoc(habitRef);
      
      if (!habitDoc.exists()) {
        console.error('[HabitService] Habit not found in Firebase');
        throw new Error('Habit not found');
      }

      // Then get from local storage
      const storedHabits = await habitStorage.getHabits(userId);
      let habit = storedHabits.find(h => h.id === habitId);
      
      if (!habit) {
        // If not in local storage but exists in Firebase, use Firebase data
        const firebaseHabit = { 
          id: habitDoc.id,
          ...habitDoc.data(),
          _sync: {
            lastSynced: Date.now(),
            version: 1,
            status: 'synced'
          }
        } as StoredHabit;
        await habitStorage.addHabit(userId, firebaseHabit);
        habit = firebaseHabit;
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time part to ensure consistent date comparison
      const todayFormatted = formatDateToYYYYMMDD(now);
      const lastCheckedFormatted = habit.lastChecked ? formatDateToYYYYMMDD(habit.lastChecked) : '';
      
      // Check if already checked in today
      if (lastCheckedFormatted === todayFormatted) {
        console.log('[HabitService] Already checked in today');
        return {
          habitId,
          currentStreak: habit.currentStreak,
          lastChecked: lastCheckedFormatted,
          todayCompleted: true,
          streakEndsAt: calculateStreakEnd(+now, habit.currentStreak)
        };
      }

      let currentStreak = habit.currentStreak;
      const streakHistory = [...habit.streakHistory];
      const checkInHistory = [...(habit.checkInHistory || [])];

      if (completed) {
        // Add to check-in history if not already there
        if (!checkInHistory.includes(todayFormatted)) {
          checkInHistory.push(todayFormatted);
        }

        currentStreak += 1;
        
        if (currentStreak === 3) {
          // For a 3-day streak, create entry from two days ago to today
          const twoDaysAgo = new Date(now);
          twoDaysAgo.setDate(now.getDate() - 2);

          streakHistory.push({
            startDate: formatDateToYYYYMMDD(twoDaysAgo),
            endDate: todayFormatted,
            completed: true
          });
        }
      } else {
        if (currentStreak > 0) {
          const startDate = new Date(now);
          startDate.setDate(now.getDate() - currentStreak);

          streakHistory.push({
            startDate: formatDateToYYYYMMDD(startDate),
            endDate: todayFormatted,
            completed: false
          });
        }
        currentStreak = 0;
      }

      const updates = {
        currentStreak,
        lastChecked: todayFormatted,
        streakHistory,
        checkInHistory,
        totalStreaks: streakHistory.length
      };

      // Update local first
      await habitStorage.updateHabit(userId, {
        ...habit,
        ...updates,
      });

      // Then update Firebase
      await updateDoc(doc(db, HABITS_COLLECTION, habitId), updates);
      console.log('[HabitService] Streak updated:', { currentStreak });

      return {
        habitId,
        currentStreak,
        lastChecked: todayFormatted,
        todayCompleted: completed,
        streakEndsAt: calculateStreakEnd(now.getTime(), currentStreak)
      };
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Update streak');
      }
      throw error;
    }
  },

  /**
   * Continue or complete a streak after 3 days
   */
  async handleStreakDecision(habitId: string, continue_: boolean, userId: string): Promise<void> {
    try {
      console.log('[HabitService] Handling streak decision:', { habitId, continue_ });
      
      if (!habitId) throw new Error('Habit ID is required');
      if (!userId) throw new Error('User ID is required');

      // Get from local storage first
      const storedHabits = await habitStorage.getHabits(userId);
      const habit = storedHabits.find(h => h.id === habitId);
      
      if (!habit) {
        throw new Error('Habit not found');
      }

      const updates: Partial<StoredHabit> = {
        currentStreak: continue_ ? 0 : habit.currentStreak,
        status: continue_ ? 'active' : 'completed',
      };

      if (habit.streakHistory.length > 0) {
        const lastStreak = [...habit.streakHistory];
        updates.streakHistory = lastStreak;
      }

      // If completing the habit, cancel any active notifications
      if (!continue_ && habit.reminder.notificationId) {
        await notificationService.cancelHabitReminder(habitId);
        updates.reminder = {
          ...habit.reminder,
          enabled: false,
          notificationId: undefined
        };
      }

      // Update local first
      await habitStorage.updateHabit(userId, {
        ...habit,
        ...updates,
      });

      // Then update Firebase
      await updateDoc(doc(db, HABITS_COLLECTION, habitId), updates);
      console.log('[HabitService] Streak decision processed');
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Handle streak decision');
      }
      throw error;
    }
  },

  /**
   * Update habit order
   */
  async updateHabitOrder(habitId: string, newOrder: number, userId: string): Promise<void> {
    try {
      console.log('[HabitService] Updating habit order:', { habitId, newOrder });
      
      if (!habitId) throw new Error('Habit ID is required');
      if (!userId) throw new Error('User ID is required');

      const storedHabits = await habitStorage.getHabits(userId);
      const habit = storedHabits.find(h => h.id === habitId);
      
      if (habit) {
        // Update local first
        await habitStorage.updateHabit(userId, {
          ...habit,
          order: newOrder
        });
      }
      
      // Then update Firebase
      await updateDoc(doc(db, HABITS_COLLECTION, habitId), { order: newOrder });
      console.log('[HabitService] Order updated successfully');
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Update habit order');
      }
      throw error;
    }
  },

  /**
   * Update habit reminder settings
   */
  async updateHabitReminder(
    habitId: string,
    userId: string,
    settings: { enabled: boolean; time: string }
  ): Promise<void> {
    try {
      console.log('[HabitService] Updating reminder:', { habitId, settings });

      const storedHabits = await habitStorage.getHabits(userId);
      const habit = storedHabits.find(h => h.id === habitId);
      
      if (!habit) throw new Error('Habit not found');

      // Cancel existing notification if any
      if (habit.reminder.notificationId) {
        await notificationService.cancelHabitReminder(habitId);
      }

      let notificationId: string | undefined;

      // Schedule new notification if enabled
      if (settings.enabled) {
        try {
          notificationId = await notificationService.scheduleHabitReminder(
            habitId,
            settings.time
          );
        } catch (error) {
          console.error('[HabitService] Failed to schedule notification:', error);
        }
      }

      const updates: Partial<StoredHabit> = {
        reminder: {
          enabled: settings.enabled,
          time: settings.time,
          notificationId
        }
      };

      // Update local first
      await habitStorage.updateHabit(userId, {
        ...habit,
        ...updates
      });

      // Then update Firebase
      await updateDoc(doc(db, HABITS_COLLECTION, habitId), updates);
      console.log('[HabitService] Reminder updated successfully');
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Update habit reminder');
      }
      throw error;
    }
  },

  /**
   * Sync local habits with Firebase
   */
  async syncWithFirebase(userId: string): Promise<void> {
    try {
      console.log('[HabitService] Starting sync...');

      // Get Firebase habits
      const habitsRef = collection(db, HABITS_COLLECTION);
      const q = query(
        habitsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const remoteHabits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoredHabit[];

      // Get local habits
      const localHabits = await habitStorage.getHabits(userId);

      // Merge habits
      const mergedHabits = this.mergeHabits(localHabits, remoteHabits);

      // Update local storage
      await habitStorage.saveHabits(userId, mergedHabits);

      console.log('[HabitService] Sync completed');
    } catch (error) {
      console.error('[HabitService] Sync error:', error);
      throw error;
    }
  },

  /**
   * Merge local and remote habits
   */
  mergeHabits(local: StoredHabit[], remote: StoredHabit[]): StoredHabit[] {
    const merged = new Map<string, StoredHabit>();

    // Add all remote habits first
    remote.forEach(habit => {
      merged.set(habit.id, {
        ...habit,
        _sync: {
          lastSynced: Date.now(),
          version: 1,
          status: 'synced'
        }
      });
    });

    // Override with local habits that have newer versions or pending changes
    local.forEach(habit => {
      const remoteHabit = merged.get(habit.id);
      if (!remoteHabit || (habit._sync?.version && habit._sync.version > (remoteHabit._sync?.version || 0))) {
        merged.set(habit.id, habit);
      }
    });

    return Array.from(merged.values());
  },

  /**
   * Delete a habit
   */
  async deleteHabit(habitId: string, userId: string): Promise<void> {
    try {
      console.log('[HabitService] Deleting habit:', habitId);
      
      if (!habitId) throw new Error('Habit ID is required');
      if (!userId) throw new Error('User ID is required');

      // Get habit to check if it exists and has a notification
      const storedHabits = await habitStorage.getHabits(userId);
      const habit = storedHabits.find(h => h.id === habitId);
      
      if (!habit) {
        throw new Error('Habit not found');
      }

      // Cancel any existing notifications
      if (habit.reminder?.notificationId) {
        await notificationService.cancelHabitReminder(habitId);
      }

      // Delete from local storage
      await habitStorage.deleteHabit(userId, habitId);

      // Delete from Firebase
      await deleteDoc(doc(db, HABITS_COLLECTION, habitId));
      
      console.log('[HabitService] Habit deleted successfully');
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Delete habit');
      }
      throw error;
    }
  },

  /**
   * Get statistics for a single habit
   */
  getHabitStats(habit: Habit): HabitStats {
    return calculateHabitStats(habit);
  },

  /**
   * Get statistics for all habits
   */
  getOverallStats(habits: Habit[]): OverallStats {
    return calculateOverallStats(habits);
  }
};
