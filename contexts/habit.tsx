import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Habit, CreateHabitInput, HabitProgress } from '../types/habit';
import { habitService } from '../services/habit';
import { useAuth } from './auth';

interface HabitContextType {
  habits: Habit[];
  activeHabits: Habit[];
  pausedHabits: Habit[];
  completedHabits: Habit[];
  loadHabits: () => Promise<void>;
  refreshHabits: () => Promise<void>;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  getHabitById: (id: string) => Habit | undefined;
  createHabit: (input: CreateHabitInput) => Promise<Habit>;
  updateStreak: (habitId: string, completed: boolean) => Promise<HabitProgress>;
  updateHabitStatus: (habitId: string, status: Habit['status']) => Promise<void>;
}

const HabitContext = createContext<HabitContextType>({
  habits: [],
  activeHabits: [],
  pausedHabits: [],
  completedHabits: [],
  loadHabits: async () => {},
  refreshHabits: async () => {},
  loading: false,
  isLoading: false,
  error: null,
  clearError: () => {},
  getHabitById: () => undefined,
  createHabit: async () => ({} as Habit),
  updateStreak: async () => ({} as HabitProgress),
  updateHabitStatus: async () => {},
});

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadHabits = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const loadedHabits = await habitService.getUserHabits(user.uid);
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Failed to load habits:', error);
      setError(error instanceof Error ? error.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const refreshHabits = useCallback(() => loadHabits(), [loadHabits]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const activeHabits = useMemo(() => {
    return habits.filter(h => h.status === 'active');
  }, [habits]);

  const pausedHabits = useMemo(() => {
    return habits.filter(h => h.status === 'paused');
  }, [habits]);

  const completedHabits = useMemo(() => {
    return habits.filter(h => h.status === 'completed');
  }, [habits]);

  const getHabitById = useCallback((id: string) => {
    return habits.find(h => h.id === id);
  }, [habits]);

  const createHabit = useCallback(async (input: CreateHabitInput): Promise<Habit> => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      const newHabit = await habitService.createHabit(user.uid, input);
      setHabits(prev => [newHabit, ...prev]);
      return newHabit;
    } catch (error) {
      console.error('Failed to create habit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create habit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const updateStreak = useCallback(async (habitId: string, completed: boolean): Promise<HabitProgress> => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      setError(null);
      const result = await habitService.updateStreak(habitId, completed, user.uid);
      setHabits(prev => prev.map(h => 
        h.id === habitId 
          ? { ...h, currentStreak: result.currentStreak, lastChecked: result.lastChecked }
          : h
      ));
      return result;
    } catch (error) {
      console.error('Failed to update streak:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update streak';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user?.uid]);

  const updateHabitStatus = useCallback(async (habitId: string, status: Habit['status']) => {
    if (!user?.uid) return;

    try {
      setError(null);
      await habitService.handleStreakDecision(habitId, status, user.uid);
      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, status } : h
      ));
    } catch (error) {
      console.error('Failed to update habit status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update habit status');
    }
  }, [user?.uid]);

  const value = useMemo(() => ({
    habits,
    activeHabits,
    pausedHabits,
    completedHabits,
    loadHabits,
    refreshHabits,
    loading,
    isLoading: loading,
    error,
    clearError,
    getHabitById,
    createHabit,
    updateStreak,
    updateHabitStatus,
  }), [
    habits,
    activeHabits,
    pausedHabits,
    completedHabits,
    loadHabits,
    refreshHabits,
    loading,
    error,
    clearError,
    getHabitById,
    createHabit,
    updateStreak,
    updateHabitStatus,
  ]);

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
};