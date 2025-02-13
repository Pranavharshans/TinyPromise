export interface HabitStreak {
  startDate: string;
  endDate: string;
  completed: boolean;
}

export interface HabitProgress {
  habitId: string;
  currentStreak: number;
  lastChecked: string;
  todayCompleted: boolean;
  streakEndsAt: number;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  lastChecked?: string;
  pausedAt?: string;
  currentStreak: number;
  longestStreak: number;
  streaksCompleted: number;
  totalStreaks: number;
  checkInHistory: string[];
  streakHistory: HabitStreak[];
  streakFreezes: string[];
  reminder: {
    enabled: boolean;
    time: string;
    notificationId?: string;
  };
  order?: number;
  _sync?: {
    status: 'pending' | 'synced' | 'error' | 'conflict';
    version?: number;
    lastSynced?: number;
  };
}

export interface CreateHabitInput {
  title: string;
  description?: string;
  reminder?: {
    enabled: boolean;
    time: string;
  };
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  status?: Habit['status'];
  lastChecked?: string;
  pausedAt?: string;
  currentStreak?: number;
  longestStreak?: number;
  streaksCompleted?: number;
  totalStreaks?: number;
  checkInHistory?: string[];
  streakHistory?: HabitStreak[];
  streakFreezes?: string[];
  reminder?: {
    enabled: boolean;
    time: string;
    notificationId?: string;
  };
  order?: number;
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
  currentStreak: number;
  longestStreak: number;
  streaksCompleted: number;
  completionRate: number;
  averageStreak: number;
  topPerformingHabit: string;
}