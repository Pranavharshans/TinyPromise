import { Badge, BadgeId, BadgeProgress, UserBadge } from '../types/badges';
import { BADGE_DEFINITIONS } from './badges-data';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export class BadgeService {
  private db = getFirestore();

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const docRef = doc(this.db, 'users', userId, 'data', 'badges');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return [];
    }
    
    return docSnap.data().badges || [];
  }

  async saveBadges(userId: string, badges: UserBadge[]): Promise<void> {
    const docRef = doc(this.db, 'users', userId, 'data', 'badges');
    await setDoc(docRef, { badges }, { merge: true });
  }

  async updateProgress(userId: string, progress: BadgeProgress): Promise<void> {
    const docRef = doc(this.db, 'users', userId, 'data', 'badges');
    await updateDoc(docRef, { progress });
  }

  async awardBadge(userId: string, badgeId: BadgeId): Promise<void> {
    const badge: Badge = {
      id: badgeId,
      ...BADGE_DEFINITIONS[badgeId],
    };

    const userBadge: UserBadge = {
      ...badge,
      earnedAt: new Date().toISOString(),
    };

    const existingBadges = await this.getUserBadges(userId);
    const updatedBadges = [...existingBadges, userBadge];
    
    await this.saveBadges(userId, updatedBadges);
  }

  checkEligibility(progress: BadgeProgress): BadgeId[] {
    const eligibleBadges: BadgeId[] = [];

    // First Streak
    if (progress.streaksCompleted >= 1) {
      eligibleBadges.push('first_streak');
    }

    // Triple Threat
    if (progress.streaksCompleted >= 3) {
      eligibleBadges.push('triple_threat');
    }

    // Consistency Champion Levels
    if (progress.totalStreaks >= 5) {
      eligibleBadges.push('consistency_champion_1');
    }
    if (progress.totalStreaks >= 10) {
      eligibleBadges.push('consistency_champion_2');
    }
    if (progress.totalStreaks >= 20) {
      eligibleBadges.push('consistency_champion_3');
    }

    // Habit Hacker
    if (progress.habitsCreated >= 5) {
      eligibleBadges.push('habit_hacker');
    }

    // Resilient Streak
    if (progress.resumedHabits >= 1) {
      eligibleBadges.push('resilient_streak');
    }

    return eligibleBadges;
  }
}

export const badgeService = new BadgeService();