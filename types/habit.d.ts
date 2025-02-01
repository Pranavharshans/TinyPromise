import { CategoryIconType } from '../components/CategoryIcon';

export interface HabitStreak {
  startDate: string;
  endDate: string;
}

export interface HabitReminder {
  enabled: boolean;
  time: string; // 24-hour format "HH:mm"
  notificationId?: string;
}

export interface HabitSync {
  status: 'pending' | 'synced' | 'conflict';
  lastSynced: number;
  version: number;
  error?: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  currentStreak: number;
  totalStreaks: number;
  status: 'active' | 'completed';
  createdAt: string;
  lastChecked?: string;
  order: number;
  category: CategoryIconType;
  reminder: HabitReminder;
  streakHistory: HabitStreak[];
  _sync?: HabitSync;
}

export interface HabitProgress {
  habitId: string;
  currentStreak: number;
  lastChecked: string;
  todayCompleted: boolean;
  streakEndsAt: number;
}

export interface HabitError {
  code: string;
  message: string;
}

export interface CreateHabitInput {
  title: string;
  description?: string;
  category: CategoryIconType;
  reminder?: {
    enabled: boolean;
    time: string;
  };
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  category?: CategoryIconType;
  reminder?: Partial<HabitReminder>;
}

export interface HabitStats {
  completionRate: number;
  longestStreak: number;
  currentStreak: number;
  totalCompletions: number;
  startDate: string;
  lastCompletedDate: string;
}

export interface OverallStats {
  totalHabits: number;
  activeHabits: number;
  completedHabits: number;
  overallCompletionRate: number;
  averageStreak: number;
  topPerformingHabit: string;
}