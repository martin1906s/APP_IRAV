import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { DailyInspiration } from '../../../domain/entities/DailyInspiration';
import type { UserProfile } from '../../../domain/entities/UserProfile';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const MOOD_NOTIFICATION_ID = 'irav-daily-mood';

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('irav-daily', {
    name: 'Recordatorio IRAV',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Una sola notificación diaria (recordatorio de ánimo).
 * No dispara notificación inmediata al guardar el ánimo.
 */
export async function ensureDailyNotification(
  _inspiration: DailyInspiration,
  profile?: UserProfile | null,
) {
  if (Platform.OS === 'web') return;
  await syncReminderFromSettings(
    profile ?? {
      documentType: 'CEDULA',
      documentId: '',
      name: '',
      birthDate: '2000-01-01',
      phone: '',
      country: '',
      preferredVersionId: 'NVI',
      notificationsEnabled: true,
      voiceEnabled: true,
      reminderHour: 8,
      reminderMinute: 0,
    },
  );
}

export async function syncReminderFromSettings(profile: UserProfile) {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(MOOD_NOTIFICATION_ID);

    if (!profile.notificationsEnabled) return;

    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    await ensureChannel();

    await Notifications.scheduleNotificationAsync({
      identifier: MOOD_NOTIFICATION_ID,
      content: {
        title: 'IRAV',
        body: '¿Cómo te sientes hoy? Tu palabra del día te espera.',
        data: { uri: 'irav://mood' },
        ...(Platform.OS === 'android' ? { channelId: 'irav-daily' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: profile.reminderHour ?? 8,
        minute: profile.reminderMinute ?? 0,
      },
    });
  } catch {
    /* permisos denegados u otro error: no bloquear la app */
  }
}
