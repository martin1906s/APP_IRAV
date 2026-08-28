import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'irav.lastReading';

export type LastReading = {
  versionId: string;
  versionName: string;
  bookId: number;
  bookName: string;
  chapters: number;
  chapter: number;
  verse?: number;
  updatedAt: number;
};

export async function saveLastReading(reading: Omit<LastReading, 'updatedAt'>): Promise<void> {
  const payload: LastReading = { ...reading, updatedAt: Date.now() };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

export async function getLastReading(): Promise<LastReading | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastReading;
  } catch {
    return null;
  }
}
