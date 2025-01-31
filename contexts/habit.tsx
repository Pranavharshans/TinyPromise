import React, { createContext, useContext, useEffect, useState } from 'react';
import { habitService } from '../services/habit';
import { useAuth } from './auth';
import { Habit, HabitProgress, HabitError } from '../types/habit';

interface HabitContextState {
  habits: Habit[];
  isLoading: boolean;
  activeHabits: Habit[];
  completedHabits: Habit[];
  error: string | null;
}

interface HabitContextType extends HabitContextState {
  createHabit: (title: string, description?: string) => Promise<Habit>;
  updateStreak: (habitId: string, completed: boolean) => Promise<HabitProgress>;
  refreshHabits: () => Promise<void>;
  updateHabitStatus: (habitId: string, completed: boolean) => Promise<void>;
  reorderHabits: (fromIndex: number, toIndex: number) => Promise<void>;
  clearError: () => void;
}

const initialState: HabitContextState = {
  habits: [],
  isLoading: true,
  activeHabits: [],
  completedHabits: [],
  error: null,
};

const HabitContext = createContext<HabitContextType>({
  ...initialState,
  createHabit: async () => { throw new Error('Not implemented'); },
  updateStreak: async () => { throw new Error('Not implemented'); },
  refreshHabits: async () => { throw new Error('Not implemented'); },
  updateHabitStatus: async () => { throw new Error('Not implemented'); },
  reorderHabits: async () => { throw new Error('Not implemented'); },
  clearError: () => {},
});

export const useHabits = () => useContext(HabitContext);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HabitContextState>(initialState);
  const { user } = useAuth();

  // Filter habits by status
  const activeHabits = state.habits.filter(h => h.status === 'active');
  const completedHabits = state.habits.filter(h => h.status === 'completed');

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setError(null);
  };

  // Load user's habits
  const loadHabits = async () => {
    if (!user) {
      setState(prev => ({ ...prev, habits: [], isLoading: false }));
      return;
    }

    try {
      console.log('[HabitContext] Loading habits for user:', user.email, user.uid);
      const userHabits = await habitService.getUserHabits(user.uid);
      setState(prev => ({
        ...prev,
        habits: userHabits,
        isLoading: false,
        error: null,
      }));
      console.log('[HabitContext] Loaded habits:', userHabits.length);
    } catch (error) {
      console.error('[HabitContext] Error loading habits:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load habits',
      }));
    }
  };

  // Load habits when user changes
  useEffect(() => {
    console.log('[HabitContext] User changed, reloading habits...');
    setState(prev => ({ ...prev, isLoading: true }));
    loadHabits();
  }, [user]);

  // Create new habit
  const createHabit = async (title: string, description?: string): Promise<Habit> => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('[HabitContext] Creating new habit:', title);
      const newHabit = await habitService.createHabit(user.uid, title, description);
      
      setState(prev => ({
        ...prev,
        habits: [newHabit, ...prev.habits],
        error: null,
      }));

      return newHabit;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create habit';
      setError(errorMessage);
      throw error;
    }
  };

  // Update habit streak
  const updateStreak = async (habitId: string, completed: boolean): Promise<HabitProgress> => {
    if (!user) throw new Error('User not authenticated');
    try {
      console.log('[HabitContext] Updating streak:', { habitId, completed });
      const progress = await habitService.updateStreak(habitId, completed, user.uid);

      setState(prev => ({
        ...prev,
        habits: prev.habits.map(habit =>
          habit.id === habitId
            ? {
                ...habit,
                currentStreak: progress.currentStreak,
                lastChecked: progress.lastChecked
              }
            : habit
        ),
        error: null,
      }));

      return progress;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update streak';
      setError(errorMessage);
      throw error;
    }
  };

  // Update habit status (complete/continue)
  const updateHabitStatus = async (habitId: string, continue_: boolean): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    try {
      console.log('[HabitContext] Processing habit status:', { habitId, continue_, userId: user.uid });
      await habitService.handleStreakDecision(habitId, continue_, user.uid);

      setState(prev => ({
        ...prev,
        habits: prev.habits.map(habit =>
          habit.id === habitId
            ? {
                ...habit,
                currentStreak: continue_ ? 0 : habit.currentStreak,
                status: continue_ ? 'active' : 'completed'
              }
            : habit
        ),
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update habit status';
      setError(errorMessage);
      throw error;
    }
  };

  // Refresh habits manually
  const refreshHabits = async (): Promise<void> => {
    console.log('[HabitContext] Manually refreshing habits...');
    setState(prev => ({ ...prev, isLoading: true }));
    await loadHabits();
  };

  const reorderHabits = async (fromIndex: number, toIndex: number): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const habitToMove = state.habits[fromIndex];
      const newHabits = [...state.habits];
      newHabits.splice(fromIndex, 1);
      newHabits.splice(toIndex, 0, habitToMove);

      // Update all affected habits' order
      const updatedHabits = newHabits.map((habit, index) => ({
        ...habit,
        order: index
      }));

      // Update state immediately for smooth UI
      setState(prev => ({
        ...prev,
        habits: updatedHabits
      }));

      // Update each habit's order in Firebase
      await Promise.all(
        updatedHabits.map(habit =>
          habitService.updateHabitOrder(habit.id, habit.order, user.uid)
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder habits';
      setError(errorMessage);
      throw error;
    }
  };

  const value: HabitContextType = {
    ...state,
    activeHabits,
    completedHabits,
    createHabit,
    updateStreak,
    refreshHabits,
    updateHabitStatus,
    reorderHabits,
    clearError,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}