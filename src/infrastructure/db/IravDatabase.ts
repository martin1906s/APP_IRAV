import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

/** DB única de IRAV (nativo). */
export async function openIravDb() {
  if (Platform.OS === 'web') return null;
  const db = await SQLite.openDatabaseAsync('irav.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      country TEXT NOT NULL,
      preferred_version TEXT NOT NULL DEFAULT 'NVI',
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      voice_enabled INTEGER NOT NULL DEFAULT 1,
      reminder_hour INTEGER NOT NULL DEFAULT 8,
      reminder_minute INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS mood_logs (
      date TEXT PRIMARY KEY NOT NULL,
      mood TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_inspiration (
      date TEXT PRIMARY KEY NOT NULL,
      mood TEXT NOT NULL,
      phrase TEXT NOT NULL,
      verse_json TEXT NOT NULL
    );
  `);

  // Migración suave si la tabla vieja no tenía columnas nuevas
  const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(profile)`);
  const names = new Set(cols.map((c) => c.name));
  const add = async (sql: string) => {
    try {
      await db.execAsync(sql);
    } catch {
      /* ya existe */
    }
  };
  if (!names.has('preferred_version')) await add(`ALTER TABLE profile ADD COLUMN preferred_version TEXT NOT NULL DEFAULT 'NVI'`);
  if (!names.has('notifications_enabled')) await add(`ALTER TABLE profile ADD COLUMN notifications_enabled INTEGER NOT NULL DEFAULT 1`);
  if (!names.has('voice_enabled')) await add(`ALTER TABLE profile ADD COLUMN voice_enabled INTEGER NOT NULL DEFAULT 1`);
  if (!names.has('reminder_hour')) await add(`ALTER TABLE profile ADD COLUMN reminder_hour INTEGER NOT NULL DEFAULT 8`);
  if (!names.has('reminder_minute')) await add(`ALTER TABLE profile ADD COLUMN reminder_minute INTEGER NOT NULL DEFAULT 0`);

  return db;
}
