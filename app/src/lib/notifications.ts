/**
 * Notificaciones suaves: como máximo 2 al día (mañana y tarde), a la hora
 * que elija el usuario, y se pueden desactivar.
 */
import * as Notifications from 'expo-notifications';

import type { Settings } from './settings';
import { NOTIFICATION_TEXT } from './suggestions';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function scheduleDailyNotifications(s: Settings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!s.morningEnabled && !s.afternoonEnabled) return;
  if (!(await ensurePermission())) return;

  if (s.morningEnabled) {
    await Notifications.scheduleNotificationAsync({
      content: { ...NOTIFICATION_TEXT.manana, data: { url: '/' } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: s.morningHour,
        minute: s.morningMinute,
      },
    });
  }
  if (s.afternoonEnabled) {
    await Notifications.scheduleNotificationAsync({
      content: { ...NOTIFICATION_TEXT.tarde, data: { url: '/' } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: s.afternoonHour,
        minute: s.afternoonMinute,
      },
    });
  }
}
