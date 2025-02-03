import React, { createContext, useContext, useEffect, useState } from 'react';
import { Badge, BadgeId, BadgeProgress, UserBadge } from '../types/badges';
import { badgeService } from '../services/badges';
import { useAuth } from './auth';

interface BadgeContextType {
  badges: UserBadge[];
  progress: BadgeProgress;
  isLoading: boolean;
  checkAndAwardBadges: () => Promise<void>;
  updateProgress: (updates: Partial<BadgeProgress>) => Promise<void>;
}

export const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [progress, setProgress] = useState<BadgeProgress>({
    streaksCompleted: 0,
    habitsCreated: 0,
    resumedHabits: 0,
    totalStreaks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user's badges and progress when component mounts
  useEffect(() => {
    const loadBadges = async () => {
      if (!user) {
        setBadges([]);
        setProgress({
          streaksCompleted: 0,
          habitsCreated: 0,
          resumedHabits: 0,
          totalStreaks: 0,
        });
        setIsLoading(false);
        return;
      }

      try {
        const userBadges = await badgeService.getUserBadges(user.uid);
        setBadges(userBadges);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading badges:', error);
        setIsLoading(false);
      }
    };

    loadBadges();
  }, [user]);

  const checkAndAwardBadges = async () => {
    if (!user) return;

    try {
      const eligibleBadgeIds = badgeService.checkEligibility(progress);
      const existingBadgeIds = badges.map(badge => badge.id);
      const newBadgeIds = eligibleBadgeIds.filter(id => !existingBadgeIds.includes(id));

      for (const badgeId of newBadgeIds) {
        await badgeService.awardBadge(user.uid, badgeId);
      }

      if (newBadgeIds.length > 0) {
        const updatedBadges = await badgeService.getUserBadges(user.uid);
        setBadges(updatedBadges);
      }
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
    }
  };

  const updateProgress = async (updates: Partial<BadgeProgress>) => {
    if (!user) return;

    try {
      const updatedProgress = {
        ...progress,
        ...updates,
      };

      setProgress(updatedProgress);
      await badgeService.updateProgress(user.uid, updatedProgress);
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error updating badge progress:', error);
    }
  };

  return (
    <BadgeContext.Provider
      value={{
        badges,
        progress,
        isLoading,
        checkAndAwardBadges,
        updateProgress,
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadges = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
};