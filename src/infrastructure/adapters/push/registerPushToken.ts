import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiRequest } from '../../api/apiClient';

async function ensureAnnouncementChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('irav-announcements', {
    name: 'Anuncios IRAV',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 180, 80, 180],
    lightColor: '#C9A227',
  });
}

/** Registra el token Expo Push en el servidor para anuncios remotos. */
export async function registerPushToken(): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;

  try {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    await ensureAnnouncementChannel();

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    await apiRequest('/users/me/push-token', {
      method: 'POST',
      body: { expoPushToken: token.data },
    });
  } catch {
    /* push remoto no disponible en este entorno */
  }
}
