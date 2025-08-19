import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const requestNotificationPermissions = async () => {
  if (Platform.OS !== 'web') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions denied.');
    }
  }
};

export const scheduleNotification = async (title, body, seconds) => {
  if (Platform.OS !== 'web') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: { seconds },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  } else {
    console.warn('Notifications are not available on web.');
  }
};

export const cancelAllNotifications = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  } else {
    console.warn('Notifications are not available on web.');
  }
};
