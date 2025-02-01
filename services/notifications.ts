import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings, NotificationPermissions, NotificationService } from '../types/notifications';

const NOTIFICATION_SETTINGS_KEY = '@TinyPromise:notificationSettings';

// Configure notifications to show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class ExpoNotificationService implements NotificationService {
  private async getStoredSettings(): Promise<NotificationSettings> {
    const defaultSettings: NotificationSettings = {
      enabled: true,
      dailyReminder: true,
      reminderTime: "09:00", // Default to 9 AM
    };

    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  async requestPermissions(): Promise<NotificationPermissions> {
    const { status } = await Notifications.requestPermissionsAsync();
    const { canAskAgain } = await Notifications.getPermissionsAsync();
    
    return {
      status: status as "granted" | "denied" | "undetermined",
      canAskAgain,
    };
  }

  async scheduleHabitReminder(habitId: string, time: string): Promise<string> {
    const [hours, minutes] = time.split(':').map(Number);
    
    const trigger = new Date();
    trigger.setHours(hours, minutes, 0, 0);
    
    // If the time has passed for today, schedule for tomorrow
    if (trigger <= new Date()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for your habit!",
        body: "Keep your streak going - check in now",
        data: { habitId },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    return identifier;
  }

  async cancelHabitReminder(habitId: string): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.habitId === habitId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async updateReminderTime(habitId: string, newTime: string): Promise<string> {
    await this.cancelHabitReminder(habitId);
    return this.scheduleHabitReminder(habitId, newTime);
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.getStoredSettings();
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    const currentSettings = await this.getStoredSettings();
    const newSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(newSettings)
    );

    // If notifications are disabled, cancel all scheduled notifications
    if (!newSettings.enabled || !newSettings.dailyReminder) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }
}

export const notificationService = new ExpoNotificationService();