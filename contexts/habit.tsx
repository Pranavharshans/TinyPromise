import React, { createContext, useContext, useEffect, useState } from 'react';
import { habitService } from '../services/habit';
import { useAuth } from './auth';
import { Habit, HabitProgress } from '../types/habit';

interface HabitContextType {
  habits: Habit[];
  isLoading: boolean;
  activeHabits: Habit[];
  completedHabits: Habit[];
  createHabit: (title: string, description?: string) => Promise<Habit>;
  updateStreak: (habitId: string, completed: boolean) => Promise<HabitProgress>;
  handleStreakDecision: (habitId: string, continue_: boolean) => Promise<void>;
  refreshHabits: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType>({
  habits: [],
  isLoading: true,
  activeHabits: [],
  completedHabits: [],
  createHabit: async () => { throw new Error('Not implemented'); },
  updateStreak: async () => { throw new Error('Not implemented'); },
  handleStreakDecision: async () => { throw new Error('Not implemented'); },
  refreshHabits: async () => { throw new Error('Not implemented'); }
});

export const useHabits = () => useContext(HabitContext);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Filter habits by status
  const activeHabits = habits.filter(h => h.status === 'active');
  const completedHabits = habits.filter(h => h.status === 'completed');

  // Load user's habits
  const loadHabits = async () => {
    if (!user) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('[HabitContext] Loading habits for user:', user.email);
      const userHabits = await habitService.getUserHabits(user.uid);
      setHabits(userHabits);
      console.log('[HabitContext] Loaded habits:', userHabits.length);
    } catch (error) {
      console.error('[HabitContext] Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load habits when user changes
  useEffect(() => {
    console.log('[HabitContext] User changed, reloading habits...');
    setIsLoading(true);
    loadHabits();
  }, [user]);

  // Create new habit
  const createHabit = async (title: string, description?: string): Promise<Habit> => {
    if (!user) throw new Error('User not authenticated');

    console.log('[HabitContext] Creating new habit:', title);
    const newHabit = await habitService.createHabit(user.uid, title, description);
    
    setHabits(current => [newHabit, ...current]);
    return newHabit;
  };

  // Update habit streak
  const updateStreak = async (habitId: string, completed: boolean): Promise<HabitProgress> => {
    console.log('[HabitContext] Updating streak:', { habitId, completed });
    const progress = await habitService.updateStreak(habitId, completed);

    // Update local state
    setHabits(current => 
      current.map(habit => 
        habit.id === habitId
          ? {
              ...habit,
              currentStreak: progress.currentStreak,
              lastChecked: progress.lastChecked
            }
          : habit
      )
    );

    return progress;
  };

  // Handle streak decision
  const handleStreakDecision = async (habitId: string, continue_: boolean): Promise<void> => {
    console.log('[HabitContext] Processing streak decision:', { habitId, continue_ });
    await habitService.handleStreakDecision(habitId, continue_);

    // Update local state
    setHabits(current =>
      current.map(habit =>
        habit.id === habitId
          ? {
              ...habit,
              currentStreak: continue_ ? 0 : habit.currentStreak,
              status: continue_ ? 'active' : 'completed'
            }
          : habit
      )
    );
  };

  // Refresh habits manually
  const refreshHabits = async (): Promise<void> => {
    console.log('[HabitContext] Manually refreshing habits...');
    setIsLoading(true);
    await loadHabits();
  };

  const value = {
    habits,
    isLoading,
    activeHabits,
    completedHabits,
    createHabit,
    updateStreak,
    handleStreakDecision,
    refreshHabits
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}