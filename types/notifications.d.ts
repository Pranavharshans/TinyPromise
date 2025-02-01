export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // 24-hour format "HH:mm"
}

export interface NotificationPermissions {
  status: "granted" | "denied" | "undetermined";
  canAskAgain: boolean;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  priority?: "default" | "normal" | "high";
}

export interface NotificationService {
  requestPermissions(): Promise<NotificationPermissions>;
  scheduleHabitReminder(habitId: string, time: string): Promise<string>;
  cancelHabitReminder(habitId: string): Promise<void>;
  updateReminderTime(habitId: string, newTime: string): Promise<string>;
  getNotificationSettings(): Promise<NotificationSettings>;
  updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void>;
}