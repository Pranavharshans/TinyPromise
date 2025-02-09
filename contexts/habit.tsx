import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Habit, CreateHabitInput } from '../types/habit';
import { habitService } from '../services/habit';
import { useAuth } from './auth';
import { useBadges } from './badges';
import { Toast } from '../components/ui/Toast';

interface HabitContextType {
  habits: Habit[];
  activeHabits: Habit[];
  pausedHabits: Habit[];
  completedHabits: Habit[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  createHabit: (habit: CreateHabitInput) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabitStatus: (id: string, status: Habit['status']) => Promise<void>;
  updateStreak: (id: string, completed: boolean) => Promise<any>;
  refreshHabits: () => Promise<void>;
  reorderHabits: (newOrder: Habit[]) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const badges = useBadges();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeHabits = useMemo(() =>
    habits.filter(habit => habit.status === 'active')
  , [habits]);

  const pausedHabits = useMemo(() =>
    habits.filter(habit => habit.status === 'paused')
  , [habits]);

  const completedHabits = useMemo(() =>
    habits.filter(habit => habit.status === 'completed')
  , [habits]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadHabits = async () => {
    if (!user) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    try {
      const userHabits = await habitService.getUserHabits(user.uid);
      setHabits(userHabits);
      setError(null);
    } catch (err) {
      console.error('Error loading habits:', err);
      setError('Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, [user]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const updateBadgeProgress = useCallback(async (updates: Parameters<typeof badges.updateProgress>[0]) => {
    try {
      await badges.updateProgress(updates);
    } catch (error) {
      console.error('Error updating badge progress:', error);
    }
  }, [badges]);

  const createHabit = async (input: CreateHabitInput) => {
    if (!user) return;

    try {
      const newHabit = await habitService.createHabit(user.uid, input);
      setHabits(prev => [...prev, newHabit]);
      await updateBadgeProgress({ habitsCreated: habits.length + 1 });
      showToast("New habit created! You're on your way to building better habits! 🌱");
    } catch (err) {
      console.error('Error creating habit:', err);
      setError('Failed to create habit');
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user) return;

    try {
      await habitService.handleStreakDecision(id, true, user.uid);
      setHabits(prev => 
        prev.map(habit => 
          habit.id === id ? { ...habit, ...updates } : habit
        )
      );
    } catch (err) {
      console.error('Error updating habit:', err);
      setError('Failed to update habit');
    }
  };

  const updateHabitStatus = async (id: string, status: Habit['status']) => {
    if (!user) return;

    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      await habitService.handleStreakDecision(id, status === 'active', user.uid);
      setHabits(prev =>
        prev.map(h =>
          h.id === id ? { ...h, status } : h
        )
      );

      if (status === 'active' && habit.status === 'paused') {
        showToast("Welcome back! Let's get this streak going again! 💪");
        await updateBadgeProgress({ resumedHabits: 1 });
      } else if (status === 'paused') {
        showToast("Taking a break is okay. Come back when you're ready! 🌟");
      }
    } catch (err) {
      console.error('Error updating habit status:', err);
      setError('Failed to update habit status');
    }
  };

  const updateStreak = async (id: string, completed: boolean) => {
    if (!user) return;

    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      const progress = await habitService.updateStreak(id, completed, user.uid);
      setHabits(prev =>
        prev.map(h =>
          h.id === id ? { ...h, currentStreak: progress.currentStreak, lastChecked: progress.lastChecked } : h
        )
      );

      if (progress.currentStreak && progress.currentStreak % 3 === 0) {
        showToast("🎉 Amazing! You've completed another 3-day streak!");
        await updateBadgeProgress({
          streaksCompleted: (habit.streaksCompleted || 0) + 1,
          totalStreaks: (habit.totalStreaks || 0) + 1,
        });
      } else {
        const motivationalMessages = [
          "Keep going! You're building momentum! 🚀",
          "One step closer to your goal! 🎯",
          "You're making progress! Keep it up! ⭐️",
        ];
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        showToast(randomMessage);
      }

      return progress;
    } catch (err) {
      console.error('Error updating streak:', err);
      setError('Failed to update streak');
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;

    try {
      await habitService.deleteHabit(id, user.uid);
      setHabits(prev => prev.filter(habit => habit.id !== id));
      showToast('Habit deleted. Remember, you can always start again! 🌱');
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError('Failed to delete habit');
    }
  };

  const refreshHabits = async () => {
    setIsLoading(true);
    await loadHabits();
  };

  const reorderHabits = async (newOrder: Habit[]) => {
    if (!user) return;

    try {
      // Update the order property for each habit based on its position
      const updatedHabits = newOrder.map((habit, index) => ({
        ...habit,
        order: index
      }));

      // Update local state immediately for responsiveness
      setHabits(updatedHabits);

      // Update the order in Firebase for each habit
      for (const habit of updatedHabits) {
        await habitService.updateHabitOrder(habit.id, habit.order, user.uid);
      }
    } catch (err) {
      console.error('Error reordering habits:', err);
      setError('Failed to reorder habits');
      // Reload habits to ensure consistency
      await loadHabits();
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        activeHabits,
        pausedHabits,
        completedHabits,
        isLoading,
        error,
        clearError,
        createHabit,
        updateHabit,
        deleteHabit,
        updateHabitStatus,
        updateStreak,
        refreshHabits,
        reorderHabits,
      }}
    >
      {children}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onHide={() => setToastMessage(null)}
        />
      )}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};