export interface Habit {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  lastChecked?: string;
  currentStreak: number;
  longestStreak: number;
  streaksCompleted: number;
  totalStreaks: number;
  checkInHistory: string[];
  _sync?: {
    status: 'pending' | 'synced' | 'error';
  };
}

export interface CreateHabitInput {
  title: string;
  description?: string;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  status?: Habit['status'];
  lastChecked?: string;
  currentStreak?: number;
  longestStreak?: number;
  streaksCompleted?: number;
  totalStreaks?: number;
  checkInHistory?: string[];
}

export interface OverallStats {
  totalHabits: number;
  activeHabits: number;
  completedHabits: number;
  currentStreak: number;
  longestStreak: number;
  streaksCompleted: number;
  completionRate: number;
}