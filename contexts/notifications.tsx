import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationSettings, NotificationPermissions } from '../types/notifications';
import { notificationService } from '../services/notifications';

interface NotificationsContextValue {
  settings: NotificationSettings | null;
  permissions: NotificationPermissions | null;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  requestPermissions: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [permissions, setPermissions] = useState<NotificationPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        // Configure notifications for iOS
        if (Platform.OS === 'ios') {
          await Notifications.setNotificationCategoryAsync('habit-reminder', [
            {
              identifier: 'check-in',
              buttonTitle: 'Check In',
              options: {
                isAuthenticationRequired: false,
                opensAppToForeground: true,
              },
            },
          ]);
        }

        // Get initial settings and permissions
        const [currentSettings, currentPermissions] = await Promise.all([
          notificationService.getNotificationSettings(),
          notificationService.requestPermissions(),
        ]);

        setSettings(currentSettings);
        setPermissions(currentPermissions);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      await notificationService.updateNotificationSettings(newSettings);
      const updatedSettings = await notificationService.getNotificationSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  };

  const requestPermissions = async () => {
    try {
      const newPermissions = await notificationService.requestPermissions();
      setPermissions(newPermissions);
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      throw error;
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        settings,
        permissions,
        isLoading,
        updateSettings,
        requestPermissions,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}