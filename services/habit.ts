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
import { Habit, HabitProgress, Reminder, Streak } from '../types/habit';
import { habitStorage } from './storage/habits';

const HABITS_COLLECTION = 'habits';

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
    title: string,
    description: string = '',
    reminders: Reminder[] = []
  ): Promise<Habit> {
    try {
      console.log('[HabitService] Creating new habit:', { title, userId });
      
      // Validate input
      if (!userId) throw new Error('User ID is required');
      if (!title.trim()) throw new Error('Habit title is required');
      
      const habitData: Omit<Habit, 'id'> = {
        userId,
        title: title.trim(),
        description: description.trim(),
        createdAt: Date.now(),
        currentStreak: 0,
        totalStreaks: 0,
        streakHistory: [] as Streak[],
        reminders: [...reminders],
        badges: [] as string[],
        status: 'active' as const,
        lastChecked: null
      };

      // Create locally first for immediate feedback
      const habitsRef = collection(db, HABITS_COLLECTION);
      const newHabitRef = doc(habitsRef);
      const newHabit = {
        id: newHabitRef.id,
        ...habitData
      };

      await habitStorage.addHabit(userId, newHabit);

      // Then create in Firebase with timeout
      const createPromise = setDoc(newHabitRef, habitData);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );

      try {
        await Promise.race([createPromise, timeoutPromise]);
      } catch (error) {
        console.error('[HabitService] Firebase create failed:', error);
        // Firebase creation failed but we have local data
        // Mark for sync later
        await habitStorage.updateHabit(userId, {
          ...newHabit,
          _sync: {
            status: 'pending',
            version: Date.now(),
            lastSynced: Date.now()
          }
        });
      }
      
      console.log('[HabitService] Habit created with ID:', newHabitRef.id);
      return newHabit;
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
        
        return localHabits;
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

      // Save to local storage
      await habitStorage.saveHabits(userId, habits);

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
        return localHabit;
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
      await habitStorage.updateHabit(userId, habit);

      return habit;
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Get habit');
      }
      throw error;
    }
  },

  /**
   * Sync local habits with Firebase
   */
  syncWithFirebase: async function(userId: string): Promise<void> {
    try {
      console.log('[HabitService] Starting background sync');
      
      // Get habits from Firebase
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
      })) as Habit[];

      // Get local habits
      const localHabits = await habitStorage.getHabits(userId);

      // Update local storage with any new or updated remote habits
      const merged = this.mergeHabits(localHabits, remoteHabits);
      await habitStorage.saveHabits(userId, merged);

      console.log('[HabitService] Background sync completed');
    } catch (error) {
      console.error('[HabitService] Sync error:', error);
      throw error;
    }
  },

  /**
   * Merge local and remote habits, preferring newer versions
   */
  mergeHabits: function(local: Habit[], remote: Habit[]): Habit[] {
    const merged = new Map<string, Habit>();

    // Add all remote habits
    remote.forEach(habit => {
      merged.set(habit.id, habit);
    });

    // Override with local habits that have newer versions
    local.forEach(habit => {
      const remoteHabit = merged.get(habit.id);
      if (!remoteHabit || (habit._sync?.version || 0) > (remoteHabit._sync?.version || 0)) {
        merged.set(habit.id, habit);
      }
    });

    return Array.from(merged.values());
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
        const firebaseHabit = { id: habitDoc.id, ...habitDoc.data() } as Habit;
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
            startDate: now - (2 * 24 * 60 * 60 * 1000),
            endDate: now,
            completed: true,
            continued: false
          });
        }
      } else {
        if (currentStreak > 0) {
          streakHistory.push({
            startDate: now - (currentStreak * 24 * 60 * 60 * 1000),
            endDate: now,
            completed: false,
            continued: false
          });
        }
        currentStreak = 0;
      }

      const updates = {
        currentStreak,
        lastChecked: now,
        streakHistory,
        totalStreaks: streakHistory.filter(s => s.completed).length
      };

      // Update local first
      const updatedHabit = { ...habit, ...updates };
      await habitStorage.updateHabit(userId, updatedHabit);

      // Then update Firebase
      await updateDoc(doc(db, HABITS_COLLECTION, habitId), updates);
      console.log('[HabitService] Streak updated:', { currentStreak });

      return {
        habitId,
        currentStreak,
        lastChecked: now,
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
      const habit = storedHabits.find(h => h.id === habitId) || await this.getHabit(habitId, userId);
      
      if (!habit) {
        throw new Error('Habit not found');
      }

      const updates: Partial<Habit> = {
        currentStreak: continue_ ? 0 : habit.currentStreak,
        status: continue_ ? 'active' : 'completed',
      };

      if (habit.streakHistory.length > 0) {
        const lastStreak = habit.streakHistory[habit.streakHistory.length - 1];
        lastStreak.continued = continue_;
        updates.streakHistory = habit.streakHistory;
      }

      // Update local first
      const updatedHabit = { ...habit, ...updates };
      await habitStorage.updateHabit(userId, updatedHabit);

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
   * Update habit reminders
   */
  async updateReminders(habitId: string, reminders: Reminder[], userId: string): Promise<void> {
    try {
      console.log('[HabitService] Updating reminders:', { habitId });
      
      if (!habitId) throw new Error('Habit ID is required');

      if (!userId) throw new Error('User ID is required');

      // Get current habit
      const storedHabits = await habitStorage.getHabits(userId);
      const habit = storedHabits.find(h => h.id === habitId);
      
      if (habit) {
        // Update local first
        const updatedHabit = { ...habit, reminders };
        await habitStorage.updateHabit(userId, updatedHabit);
      }
      
      // Then update Firebase
      await updateDoc(doc(db, HABITS_COLLECTION, habitId), { reminders });
      console.log('[HabitService] Reminders updated');
    } catch (error) {
      if (error instanceof FirestoreError || error instanceof FirebaseError) {
        handleFirestoreError(error, 'Update reminders');
      }
      throw error;
    }
  }
};