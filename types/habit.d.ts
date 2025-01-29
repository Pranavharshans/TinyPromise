export interface Streak {
  startDate: number;  // timestamp
  endDate: number;    // timestamp
  completed: boolean;
  continued: boolean; // whether user chose to continue after 3 days
}

export interface Reminder {
  id: string;
  time: string;     // HH:mm format
  days: number[];   // 0-6 for days of week
  enabled: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: number;      // timestamp
  currentStreak: number;  // current streak days (0-3)
  totalStreaks: number;   // total number of completed 3-day streaks
  lastChecked?: number;   // timestamp of last check-in
  streakHistory: Streak[];
  reminders: Reminder[];
  badges: string[];       // achievement IDs
  status: 'active' | 'completed' | 'abandoned';
}

export interface HabitProgress {
  habitId: string;
  currentStreak: number;
  lastChecked?: number;
  todayCompleted: boolean;
  streakEndsAt?: number;  // timestamp when current streak ends
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