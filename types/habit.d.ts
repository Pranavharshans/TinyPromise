export interface Streak {
  startDate: number;  // timestamp
  endDate: number;    // timestamp
  completed: boolean;
  continued: boolean; // whether user chose to continue after 3 days
}

export interface Reminder {
  id?: string;        // Optional for new reminders
  time: string;       // HH:mm format
  days: number[];     // 0-6 for days of week
  enabled: boolean;
}

export interface SyncMetadata {
  lastSynced: number;
  version: number;
  status: 'synced' | 'pending' | 'conflict';
}

export interface Habit {
  _sync?: SyncMetadata;
  id: string;
  userId: string;
  title: string;
  description: string;         // Empty string if no description
  createdAt: number;          // timestamp
  currentStreak: number;      // current streak days (0-3)
  totalStreaks: number;       // total number of completed 3-day streaks
  lastChecked: number | null; // timestamp of last check-in, null for new habits
  streakHistory: Streak[];
  reminders: Reminder[];
  badges: string[];           // achievement IDs
  status: 'active' | 'completed' | 'abandoned';
}

export interface HabitProgress {
  habitId: string;
  currentStreak: number;
  lastChecked: number | null;
  todayCompleted: boolean;
  streakEndsAt?: number;      // timestamp when current streak ends
}

export interface HabitSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  defaultReminders?: {
    time: string;
    days: number[];
  }[];
}

// Error types
export type HabitServiceError = 
  | 'permission-denied'
  | 'not-found'
  | 'already-exists'
  | 'resource-exhausted'
  | 'failed-precondition'
  | 'unavailable'
  | 'unknown';

export interface HabitError extends Error {
  code: HabitServiceError;
  originalError?: unknown;
}