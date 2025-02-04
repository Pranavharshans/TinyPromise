import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Habit, HabitStats, OverallStats } from '../types/habit';
import { habitService } from '../services/habit';
import { useHabits } from './habit';

interface StatsContextProps {
  habitStats: Map<string, HabitStats>;
  overallStats: OverallStats;
  updateStats: () => void;
  refreshStats: () => void;
}

const initialOverallStats: OverallStats = {
  totalHabits: 0,
  activeHabits: 0,
  completedHabits: 0,
  currentStreak: 0,
  longestStreak: 0,
  streaksCompleted: 0,
  completionRate: 0,
  averageStreak: 0,
  topPerformingHabit: ''
};

const StatsContext = createContext<StatsContextProps>({
  habitStats: new Map(),
  overallStats: initialOverallStats,
  updateStats: () => {},
  refreshStats: () => {}
});

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { habits } = useHabits();
  const [habitStats, setHabitStats] = useState<Map<string, HabitStats>>(new Map());
  const [overallStats, setOverallStats] = useState<OverallStats>(initialOverallStats);

  // Calculate stats for all habits
  const calculateStats = useCallback(() => {
    const newHabitStats = new Map<string, HabitStats>();
    
    // Calculate individual habit stats
    habits.forEach((habit: Habit) => {
      const stats = habitService.getHabitStats(habit);
      newHabitStats.set(habit.id, stats);
    });

    // Calculate overall stats
    const newOverallStats = habitService.getOverallStats(habits);

    setHabitStats(newHabitStats);
    setOverallStats(newOverallStats);
  }, [habits]);

  // Force refresh stats
  const refreshStats = useCallback(() => {
    calculateStats();
  }, [calculateStats]);

  // Update stats when habits change
  useEffect(() => {
    calculateStats();
  }, [habits, calculateStats]);

  const value = useMemo(() => ({
    habitStats,
    overallStats,
    updateStats: calculateStats,
    refreshStats
  }), [habitStats, overallStats, calculateStats, refreshStats]);

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};