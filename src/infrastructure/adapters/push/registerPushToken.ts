import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiRequest } from '../../api/apiClient';

function resolveProjectId(): string | null {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    null
  );
}

async function ensureAnnouncementChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('irav-announcements', {
    name: 'Anuncios IRAV',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 180, 80, 180],
    lightColor: '#C9A227',
    sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('default', {
    name: 'IRAV',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

/** Registra este dispositivo para anuncios. Un usuario puede tener varios teléfonos. */
export async function registerPushToken(): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;

  try {
    const current = await Notifications.getPermissionsAsync();
    const permission = current.granted
      ? current
      : await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    await ensureAnnouncementChannels();

    const projectId = resolveProjectId();
    if (!projectId) return;

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    await apiRequest('/users/me/push-token', {
      method: 'POST',
      body: {
        expoPushToken: token.data,
        platform: Platform.OS,
        deviceName: Device.modelName ?? Device.deviceName ?? Platform.OS,
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[IRAV] No se pudo registrar push', error);
    }
  }
}
