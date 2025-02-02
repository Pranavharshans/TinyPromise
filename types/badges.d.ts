export type BadgeId = 
  | 'first_streak'
  | 'triple_threat'
  | 'consistency_champion_1'
  | 'consistency_champion_2'
  | 'consistency_champion_3'
  | 'habit_hacker'
  | 'resilient_streak';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  level?: number;
}

export interface UserBadge extends Badge {
  earnedAt: string;
  progress?: {
    current: number;
    required: number;
  };
}

export interface BadgeProgress {
  streaksCompleted: number;
  habitsCreated: number;
  resumedHabits: number;
  totalStreaks: number;
}

export const BADGE_DEFINITIONS: Record<BadgeId, Omit<Badge, 'id'>> = {
  first_streak: {
    name: 'First Streak Completed',
    description: 'Complete your first 3-day streak for any habit',
    icon: '🌟',
    criteria: 'Complete one 3-day streak',
  },
  triple_threat: {
    name: 'Triple Threat',
    description: 'Complete 3 different habit streaks',
    icon: '🎯',
    criteria: 'Complete three 3-day streaks',
  },
  consistency_champion_1: {
    name: 'Consistency Champion I',
    description: 'Complete 5 streaks',
    icon: '🏆',
    criteria: 'Complete five 3-day streaks',
    level: 1,
  },
  consistency_champion_2: {
    name: 'Consistency Champion II',
    description: 'Complete 10 streaks',
    icon: '🏆',
    criteria: 'Complete ten 3-day streaks',
    level: 2,
  },
  consistency_champion_3: {
    name: 'Consistency Champion III',
    description: 'Complete 20 streaks',
    icon: '🏆',
    criteria: 'Complete twenty 3-day streaks',
    level: 3,
  },
  habit_hacker: {
    name: 'Habit Hacker',
    description: 'Create 5 different habits',
    icon: '🔧',
    criteria: 'Create five habits',
  },
  resilient_streak: {
    name: 'Resilient Streak',
    description: 'Resume a paused habit and complete a streak',
    icon: '🔄',
    criteria: 'Complete a streak after resuming a paused habit',
  },
};