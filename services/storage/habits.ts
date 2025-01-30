import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitProgress } from '../../types/habit';

const HABITS_STORAGE_KEY = '@habits';
const HABITS_SYNC_META_KEY = '@habits_sync_meta';

interface SyncMetadata {
  lastSynced: number;
  version: number;
  status: 'synced' | 'pending' | 'conflict';
}

interface StoredHabit extends Habit {
  _sync?: SyncMetadata;
}

export const habitStorage = {
  /**
   * Get all habits from storage
   */
  async getHabits(userId: string): Promise<StoredHabit[]> {
    try {
      const key = `${HABITS_STORAGE_KEY}:${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[HabitStorage] Error getting habits:', error);
      return [];
    }
  },

  /**
   * Save all habits to storage
   */
  async saveHabits(userId: string, habits: StoredHabit[]): Promise<void> {
    try {
      const key = `${HABITS_STORAGE_KEY}:${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(habits));
    } catch (error) {
      console.error('[HabitStorage] Error saving habits:', error);
      throw error;
    }
  },

  /**
   * Update a single habit
   */
  async updateHabit(userId: string, habit: StoredHabit): Promise<void> {
    try {
      const habits = await this.getHabits(userId);
      const index = habits.findIndex(h => h.id === habit.id);
      
      if (index >= 0) {
        habits[index] = {
          ...habit,
          _sync: {
            lastSynced: Date.now(),
            version: (habit._sync?.version || 0) + 1,
            status: 'pending'
          }
        };
        await this.saveHabits(userId, habits);
      }
    } catch (error) {
      console.error('[HabitStorage] Error updating habit:', error);
      throw error;
    }
  },

  /**
   * Add a new habit
   */
  async addHabit(userId: string, habit: StoredHabit): Promise<void> {
    try {
      const habits = await this.getHabits(userId);
      habits.unshift({
        ...habit,
        _sync: {
          lastSynced: Date.now(),
          version: 1,
          status: 'pending'
        }
      });
      await this.saveHabits(userId, habits);
    } catch (error) {
      console.error('[HabitStorage] Error adding habit:', error);
      throw error;
    }
  },

  /**
   * Get sync metadata
   */
  async getSyncMeta(userId: string): Promise<Record<string, SyncMetadata>> {
    try {
      const key = `${HABITS_SYNC_META_KEY}:${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('[HabitStorage] Error getting sync meta:', error);
      return {};
    }
  },

  /**
   * Update sync metadata
   */
  async updateSyncMeta(userId: string, habitId: string, meta: SyncMetadata): Promise<void> {
    try {
      const key = `${HABITS_SYNC_META_KEY}:${userId}`;
      const syncMeta = await this.getSyncMeta(userId);
      syncMeta[habitId] = meta;
      await AsyncStorage.setItem(key, JSON.stringify(syncMeta));
    } catch (error) {
      console.error('[HabitStorage] Error updating sync meta:', error);
      throw error;
    }
  },

  /**
   * Clear all storage (for logout)
   */
  async clearStorage(userId: string): Promise<void> {
    try {
      const keys = [
        `${HABITS_STORAGE_KEY}:${userId}`,
        `${HABITS_SYNC_META_KEY}:${userId}`
      ];
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('[HabitStorage] Error clearing storage:', error);
      throw error;
    }
  }
};
