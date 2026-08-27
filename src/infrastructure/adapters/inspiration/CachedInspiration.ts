import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyInspiration } from '../../../domain/entities/DailyInspiration';
import type { MoodLog } from '../../../domain/entities/MoodLog';

const INSP_KEY = 'irav.inspiration';
const MOOD_KEY = 'irav.mood.logs';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Lectura ligera para widgets (sin SQLite). */
export async function readCachedInspiration(): Promise<DailyInspiration | null> {
  const raw = await AsyncStorage.getItem(INSP_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DailyInspiration;
    return parsed.date === todayKey() ? parsed : null;
  } catch {
    return null;
  }
}

/** ¿Ya hay ánimo registrado hoy? */
export async function hasMoodTodayCached(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(MOOD_KEY);
    if (!raw) return false;
    const logs = JSON.parse(raw) as MoodLog[];
    return logs.some((item) => item.date === todayKey());
  } catch {
    return false;
  }
}
