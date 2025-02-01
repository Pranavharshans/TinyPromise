import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  FirestoreError
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../config/firebase';
import { Habit, HabitProgress, CreateHabitInput, UpdateHabitInput } from '../types/habit';
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
        totalStreaks: 0,
        streakHistory: [],
        reminder: {
          enabled: input.reminder?.enabled ?? false,
          time: input.reminder?.time ?? "09:00"
        },
        status: 'active' as const,
        lastChecked: undefined,
        category: input.category || 'other',
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

      const now = Date.now();
      const lastChecked = habit.lastChecked || 0;
      const isNewDay = new Date(lastChecked).getDate() !== new Date(now).getDate();
      
      if (!isNewDay && habit.lastChecked) {
        console.log('[HabitService] Already checked in today');
        return {
          habitId,
          currentStreak: habit.currentStreak,
          lastChecked: habit.lastChecked,
          todayCompleted: true,
          streakEndsAt: calculateStreakEnd(now, habit.currentStreak)
        };
      }

      let currentStreak = habit.currentStreak;
      const streakHistory = [...habit.streakHistory];

      if (completed) {
        currentStreak = isNewDay ? currentStreak + 1 : currentStreak;
        
        if (currentStreak === 3) {
          streakHistory.push({
            startDate: new Date(now - (2 * 24 * 60 * 60 * 1000)).toISOString(),
            endDate: new Date(now).toISOString()
          });
        }
      } else {
        if (currentStreak > 0) {
          streakHistory.push({
            startDate: new Date(now - (currentStreak * 24 * 60 * 60 * 1000)).toISOString(),
            endDate: new Date(now).toISOString()
          });
        }
        currentStreak = 0;
      }

      const updates = {
        currentStreak,
        lastChecked: new Date(now).toISOString(),
        streakHistory,
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
        lastChecked: new Date(now).toISOString(),
        todayCompleted: completed,
        streakEndsAt: calculateStreakEnd(now, currentStreak)
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
  }
};
