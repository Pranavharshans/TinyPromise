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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Habit, HabitProgress, Reminder } from '../types/habit';
import { AuthUser } from '../types/auth';

const HABITS_COLLECTION = 'habits';

// Calculate when the current streak ends
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

export const habitService = {
  /**
   * Create a new habit
   */
  async createHabit(
    userId: string, 
    title: string, 
    description?: string, 
    reminders?: Reminder[]
  ): Promise<Habit> {
    console.log('[HabitService] Creating new habit:', { title, userId });
    
    const habitData: Omit<Habit, 'id'> = {
      userId,
      title,
      description,
      createdAt: Date.now(),
      currentStreak: 0,
      totalStreaks: 0,
      streakHistory: [],
      reminders: reminders || [],
      badges: [],
      status: 'active'
    };

    const habitsRef = collection(db, HABITS_COLLECTION);
    const newHabitRef = doc(habitsRef);
    
    await setDoc(newHabitRef, habitData);
    console.log('[HabitService] Habit created with ID:', newHabitRef.id);

    return {
      id: newHabitRef.id,
      ...habitData
    };
  },

  /**
   * Get all habits for a user
   */
  async getUserHabits(userId: string): Promise<Habit[]> {
    console.log('[HabitService] Fetching habits for user:', userId);
    
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

    console.log('[HabitService] Found habits:', habits.length);
    return habits;
  },

  /**
   * Get a single habit by ID
   */
  async getHabit(habitId: string): Promise<Habit | null> {
    console.log('[HabitService] Fetching habit:', habitId);
    
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) {
      console.log('[HabitService] Habit not found');
      return null;
    }

    return {
      id: habitDoc.id,
      ...habitDoc.data()
    } as Habit;
  },

  /**
   * Update a habit's streak
   */
  async updateStreak(habitId: string, completed: boolean): Promise<HabitProgress> {
    console.log('[HabitService] Updating streak for habit:', habitId);
    
    const habit = await this.getHabit(habitId);
    if (!habit) {
      throw new Error('Habit not found');
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
      
      // Check if streak is complete (3 days)
      if (currentStreak === 3) {
        streakHistory.push({
          startDate: now - (2 * 24 * 60 * 60 * 1000), // 2 days ago
          endDate: now,
          completed: true,
          continued: false
        });
      }
    } else {
      // Break the streak
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

    await updateDoc(doc(db, HABITS_COLLECTION, habitId), updates);
    console.log('[HabitService] Streak updated:', { currentStreak });

    return {
      habitId,
      currentStreak,
      lastChecked: now,
      todayCompleted: completed,
      streakEndsAt: calculateStreakEnd(now, currentStreak)
    };
  },

  /**
   * Continue or complete a streak after 3 days
   */
  async handleStreakDecision(habitId: string, continue_: boolean): Promise<void> {
    console.log('[HabitService] Handling streak decision:', { habitId, continue_ });
    
    const habit = await this.getHabit(habitId);
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

    await updateDoc(doc(db, HABITS_COLLECTION, habitId), updates);
    console.log('[HabitService] Streak decision processed');
  },

  /**
   * Update habit reminders
   */
  async updateReminders(habitId: string, reminders: Reminder[]): Promise<void> {
    console.log('[HabitService] Updating reminders for habit:', habitId);
    
    await updateDoc(doc(db, HABITS_COLLECTION, habitId), { reminders });
    console.log('[HabitService] Reminders updated');
  }
};