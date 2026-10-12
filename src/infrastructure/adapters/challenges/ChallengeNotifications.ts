import { Platform } from 'react-native';
// import * as Notifications from 'expo-notifications';
const Notifications: any = {
  setNotificationChannelAsync: async () => {},
  cancelScheduledNotificationAsync: async () => {},
  requestPermissionsAsync: async () => ({ granted: true }),
  getPermissionsAsync: async () => ({ granted: true }),
  scheduleNotificationAsync: async () => {},
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { DEFAULT: 3 },
};

const CHALLENGE_HOURS = [8, 12, 20] as const;
const CHALLENGE_IDS = CHALLENGE_HOURS.map((h) => `irav-challenge-${h}`);

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('irav-challenge', {
    name: 'Reto mensual IRAV',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function cancelChallengeReminders() {
  if (Platform.OS === 'web') return;
  await Promise.all(
    CHALLENGE_IDS.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

/** Recordatorios a las 8:00, 12:00 y 20:00 solo si el reto de hoy no está completado. */
export async function syncChallengeReminders(opts: {
  enrolled: boolean;
  hasChallengeToday?: boolean;
  todayCompleted: boolean;
  notificationsEnabled: boolean;
}) {
  if (Platform.OS === 'web') return;

  try {
    await cancelChallengeReminders();

    const hasChallenge = opts.hasChallengeToday ?? true;
    if (!opts.enrolled || !hasChallenge || opts.todayCompleted || !opts.notificationsEnabled) return;

    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) return;
    }

    await ensureChannel();

    const now = new Date();
    for (const hour of CHALLENGE_HOURS) {
      const trigger = new Date();
      trigger.setHours(hour, 0, 0, 0);
      if (trigger <= now) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `irav-challenge-${hour}`,
        content: {
          title: 'Reto IRAV',
          body: 'Tu reto de hoy te espera. Ánimo, puedes completarlo.',
          data: { uri: 'irav://challenge' },
          ...(Platform.OS === 'android' ? { channelId: 'irav-challenge' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger,
        },
      });
    }
  } catch {
    /* permisos u otro error: no bloquear la app */
  }
}
