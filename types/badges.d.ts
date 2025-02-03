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

export type BadgeDefinitions = Record<BadgeId, Omit<Badge, 'id'>>;