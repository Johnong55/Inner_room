import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Letter } from '@/types';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export async function requestGentleNotifications() {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  return permission.granted;
}

export async function scheduleGentleReminder() {
  if (!(await requestGentleNotifications())) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'InnerRoom', body: 'Nếu hôm nay có điều gì muốn giữ lại, InnerRoom vẫn ở đây.', sound: false, data: { route: '/journal/editor' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 30 },
  });
  return true;
}

export async function disableNotifications() {
  if (Platform.OS !== 'web') await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleLetterNotification(letter: Letter) {
  if (Platform.OS === 'web' || new Date(letter.deliverAt) <= new Date()) return;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Có một lá thư dành cho bạn', body: 'Một lá thư từ chính bạn của những ngày trước.', sound: false, data: { route: '/letters', letterId: letter.id } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(letter.deliverAt) },
  });
}
