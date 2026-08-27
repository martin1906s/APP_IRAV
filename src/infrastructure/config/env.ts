/** Clave pública de Gemini (Expo) */
export const env = {
  geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
  geminiModel: process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-3.5-flash-lite',
};
