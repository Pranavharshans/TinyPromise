import React, { createContext, useContext, useEffect, useState } from 'react';
import { Habit } from '../types/habit';
import { habitService } from '../services/habit';
import { useAuth } from './auth';
import { useBadges } from './badges';
import { Toast } from '../components/ui/Toast';

interface HabitContextType {
  habits: Habit[];
  isLoading: boolean;
  createHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabitStatus: (id: string, status: Habit['status']) => Promise<void>;
  markHabitComplete: (id: string) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { updateProgress } = useBadges();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, [user]);

  const loadHabits = async () => {
    if (!user) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    try {
      const userHabits = await habitService.getUserHabits(user.uid);
      setHabits(userHabits);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading habits:', error);
      setIsLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const createHabit = async (habit: Omit<Habit, 'id'>) => {
    if (!user) return;

    try {
      const newHabit = await habitService.createHabit(user.uid, habit);
      setHabits(prev => [...prev, newHabit]);
      await updateProgress({ habitsCreated: habits.length + 1 });
      showToast('New habit created! You're on your way to building better habits! 🌱');
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user) return;

    try {
      await habitService.updateHabit(user.uid, id, updates);
      setHabits(prev => 
        prev.map(habit => 
          habit.id === id ? { ...habit, ...updates } : habit
        )
      );
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const updateHabitStatus = async (id: string, status: Habit['status']) => {
    if (!user) return;

    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      await habitService.updateHabit(user.uid, id, { status });
      setHabits(prev =>
        prev.map(h =>
          h.id === id ? { ...h, status } : h
        )
      );

      if (status === 'active' && habit.status === 'paused') {
        showToast('Welcome back! Let's get this streak going again! 💪');
        await updateProgress({ resumedHabits: 1 });
      } else if (status === 'paused') {
        showToast('Taking a break is okay. Come back when you're ready! 🌟');
      }
    } catch (error) {
      console.error('Error updating habit status:', error);
    }
  };

  const markHabitComplete = async (id: string) => {
    if (!user) return;

    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      const updatedHabit = await habitService.markComplete(user.uid, id);
      setHabits(prev =>
        prev.map(h =>
          h.id === id ? updatedHabit : h
        )
      );

      // Check if a streak was completed
      if (updatedHabit.currentStreak && updatedHabit.currentStreak % 3 === 0) {
        showToast('🎉 Amazing! You've completed another 3-day streak!');
        await updateProgress({
          streaksCompleted: (habit.streaksCompleted || 0) + 1,
          totalStreaks: (habit.totalStreaks || 0) + 1,
        });
      } else {
        const motivationalMessages = [
          'Keep going! You're building momentum! 🚀',
          'One step closer to your goal! 🎯',
          'You're making progress! Keep it up! ⭐️',
        ];
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        showToast(randomMessage);
      }
    } catch (error) {
      console.error('Error marking habit complete:', error);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;

    try {
      await habitService.deleteHabit(user.uid, id);
      setHabits(prev => prev.filter(habit => habit.id !== id));
      showToast('Habit deleted. Remember, you can always start again! 🌱');
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        isLoading,
        createHabit,
        updateHabit,
        deleteHabit,
        updateHabitStatus,
        markHabitComplete,
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