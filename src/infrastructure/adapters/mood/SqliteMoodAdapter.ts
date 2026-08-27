import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MoodLog, MoodType } from '../../../domain/entities/MoodLog';
import type { DailyInspiration } from '../../../domain/entities/DailyInspiration';
import type { MoodRepository } from '../../../domain/ports/MoodRepository';
import { openIravDb } from '../../db/IravDatabase';

const MOOD_KEY = 'irav.mood.logs';
const INSP_KEY = 'irav.inspiration';

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Persistencia de ánimo + inspiración (SQLite + AsyncStorage para widgets). */
export class SqliteMoodAdapter implements MoodRepository {
  async saveToday(mood: MoodType): Promise<MoodLog> {
    const log: MoodLog = { date: todayKey(), mood, createdAt: Date.now() };
    const db = await openIravDb();
    if (db) {
      await db.runAsync(
        `INSERT OR REPLACE INTO mood_logs (date, mood, created_at) VALUES (?, ?, ?)`,
        log.date,
        log.mood,
        log.createdAt,
      );
    }
    const all = await this.readStorageLogs();
    const next = [log, ...all.filter((item) => item.date !== log.date)].slice(0, 90);
    await AsyncStorage.setItem(MOOD_KEY, JSON.stringify(next));
    return log;
  }

  async getToday(): Promise<MoodLog | null> {
    const date = todayKey();
    const db = await openIravDb();
    if (db) {
      const row = await db.getFirstAsync<{ date: string; mood: MoodType; created_at: number }>(
        `SELECT date, mood, created_at FROM mood_logs WHERE date = ?`,
        date,
      );
      if (row) return { date: row.date, mood: row.mood, createdAt: row.created_at };
    }
    return (await this.readStorageLogs()).find((item) => item.date === date) ?? null;
  }

  async listRecent(limit = 14): Promise<MoodLog[]> {
    const db = await openIravDb();
    if (db) {
      const rows = await db.getAllAsync<{ date: string; mood: MoodType; created_at: number }>(
        `SELECT date, mood, created_at FROM mood_logs ORDER BY date DESC LIMIT ?`,
        limit,
      );
      if (rows.length) {
        return rows.map((row) => ({
          date: row.date,
          mood: row.mood,
          createdAt: row.created_at,
        }));
      }
    }
    return (await this.readStorageLogs()).slice(0, limit);
  }

  async saveInspiration(inspiration: DailyInspiration): Promise<void> {
    const db = await openIravDb();
    if (db) {
      await db.runAsync(
        `INSERT OR REPLACE INTO daily_inspiration (date, mood, phrase, verse_json) VALUES (?, ?, ?, ?)`,
        inspiration.date,
        inspiration.mood,
        inspiration.phrase,
        JSON.stringify(inspiration.verse),
      );
    }
    await AsyncStorage.setItem(INSP_KEY, JSON.stringify(inspiration));
  }

  async getInspiration(date = todayKey()): Promise<DailyInspiration | null> {
    const db = await openIravDb();
    if (db) {
      const row = await db.getFirstAsync<{
        date: string;
        mood: MoodType;
        phrase: string;
        verse_json: string;
      }>(`SELECT date, mood, phrase, verse_json FROM daily_inspiration WHERE date = ?`, date);
      if (row) {
        return {
          date: row.date,
          mood: row.mood,
          phrase: row.phrase,
          verse: JSON.parse(row.verse_json),
        };
      }
    }
    const raw = await AsyncStorage.getItem(INSP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyInspiration;
    return parsed.date === date ? parsed : null;
  }

  private async readStorageLogs(): Promise<MoodLog[]> {
    const raw = await AsyncStorage.getItem(MOOD_KEY);
    return raw ? (JSON.parse(raw) as MoodLog[]) : [];
  }
}
