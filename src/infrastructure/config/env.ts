import { resolveApiUrl } from './resolveApiUrl';

/** Variables públicas de Expo */
export const env = {
  geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
  geminiModel: process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-3.5-flash-lite',
  apiUrl: resolveApiUrl(),
};

if (__DEV__) {
  // console.log('[IRAV] API URL →', env.apiUrl);
}
