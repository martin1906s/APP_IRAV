import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { supabase } from '../../supabase/supabaseConfig';
import { getStoredUser, updateStoredUser } from '../../api/authStore';

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function getNotificationsModule() {
  if (isExpoGo || Platform.OS === 'web') return null;
  try {
    return require('expo-notifications');
  } catch (e) {
    if (__DEV__) console.log('[IRAV] expo-notifications no disponible en runtime:', e);
    return null;
  }
}

function resolveProjectId(): string | null {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    null
  );
}

async function ensureAnnouncementChannels(Notifications: any) {
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

/** Registra este dispositivo para anuncios y guarda el token en Supabase. */
export async function registerPushToken(): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;

  // A partir de Expo SDK 53, las notificaciones remotas en Android no están soportadas en Expo Go.
  // Solo se ejecutan en Builds de Desarrollo (Dev Client) o en APK standalone de producción.
  if (isExpoGo) {
    if (__DEV__) {
      console.log(
        '[IRAV] Las notificaciones Push remotas se omiten en Expo Go (SDK 53+). Funcionarán en el APK final.',
      );
    }
    return;
  }

  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  try {
    const current = await Notifications.getPermissionsAsync();
    const permission = current.granted
      ? current
      : await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    await ensureAnnouncementChannels(Notifications);

    const projectId = resolveProjectId();
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    if (!token?.data) return;

    // Guardar en la sesión local
    const localUser = await getStoredUser();
    if (localUser) {
      if (localUser.expoPushToken !== token.data) {
        await updateStoredUser({ ...localUser, expoPushToken: token.data });
      }

      // Actualizar en la base de datos Supabase
      await supabase
        .from('users')
        .update({
          expoPushToken: token.data,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', localUser.id);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[IRAV] No se pudo registrar push token:', error);
    }
  }
}

