import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3000;

function hostFromExpo(): string | null {
  const debuggerHost = Constants.expoGoConfig?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') return ip;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') return ip;
  }

  return null;
}

function isLocalPlaceholder(url: string) {
  return /^(https?:\/\/)?(10\.0\.2\.2|localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(url);
}

/** Resuelve la URL del API según el dispositivo */
export function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

  // URL pública explícita (producción, ngrok, servidor desplegado)
  if (configured && configured !== 'auto' && !isLocalPlaceholder(configured)) {
    return configured.replace(/\/$/, '');
  }

  // Expo Go / dev build en teléfono físico: misma IP que Metro (Wi‑Fi local)
  const lanIp = hostFromExpo();
  if (lanIp) {
    const url = `http://${lanIp}:${API_PORT}`;
    if (__DEV__) {
      console.warn(
        `[IRAV] EXPO_PUBLIC_API_URL=auto → backend local ${url}. Para producción usa EXPO_PUBLIC_API_URL=https://back-irav.onrender.com`,
      );
    }
    return url;
  }

  // Emulador Android
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}
