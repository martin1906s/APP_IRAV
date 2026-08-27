import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../../../domain/entities/UserProfile';
import { DEFAULT_PROFILE } from '../../../domain/entities/UserProfile';
import type { UserProfilePort } from '../../../domain/ports/UserProfilePort';
import { openIravDb } from '../../db/IravDatabase';

const KEY = 'irav.profile';

type ProfileRow = {
  name: string;
  age: number;
  country: string;
  preferred_version: string | null;
  notifications_enabled: number | null;
  voice_enabled: number | null;
  reminder_hour: number | null;
  reminder_minute: number | null;
};

function mapRow(row: ProfileRow): UserProfile {
  return {
    name: row.name,
    age: row.age,
    country: row.country,
    preferredVersionId: row.preferred_version || DEFAULT_PROFILE.preferredVersionId,
    notificationsEnabled: (row.notifications_enabled ?? 1) === 1,
    voiceEnabled: (row.voice_enabled ?? 1) === 1,
    reminderHour: row.reminder_hour ?? DEFAULT_PROFILE.reminderHour,
    reminderMinute: row.reminder_minute ?? DEFAULT_PROFILE.reminderMinute,
  };
}

function normalize(profile: UserProfile): UserProfile {
  return {
    name: profile.name.trim(),
    age: profile.age,
    country: profile.country.trim(),
    preferredVersionId: profile.preferredVersionId || DEFAULT_PROFILE.preferredVersionId,
    notificationsEnabled: !!profile.notificationsEnabled,
    voiceEnabled: !!profile.voiceEnabled,
    reminderHour: Math.min(23, Math.max(0, profile.reminderHour ?? 8)),
    reminderMinute: Math.min(59, Math.max(0, profile.reminderMinute ?? 0)),
  };
}

/** Adaptador: perfil y ajustes en SQLite */
export class SqliteProfileAdapter implements UserProfilePort {
  async get(): Promise<UserProfile | null> {
    try {
      const db = await openIravDb();
      if (!db) {
        const raw = await AsyncStorage.getItem(KEY);
        return raw ? normalize(JSON.parse(raw) as UserProfile) : null;
      }
      const row = await db.getFirstAsync<ProfileRow>(
        `SELECT name, age, country, preferred_version, notifications_enabled,
                voice_enabled, reminder_hour, reminder_minute
         FROM profile WHERE id = 1`,
      );
      return row ? mapRow(row) : null;
    } catch {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? normalize(JSON.parse(raw) as UserProfile) : null;
    }
  }

  async save(profile: UserProfile): Promise<void> {
    const clean = normalize(profile);
    try {
      const db = await openIravDb();
      if (!db) {
        await AsyncStorage.setItem(KEY, JSON.stringify(clean));
        return;
      }
      await db.runAsync(
        `INSERT OR REPLACE INTO profile (
          id, name, age, country, preferred_version,
          notifications_enabled, voice_enabled, reminder_hour, reminder_minute
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
        clean.name,
        clean.age,
        clean.country,
        clean.preferredVersionId,
        clean.notificationsEnabled ? 1 : 0,
        clean.voiceEnabled ? 1 : 0,
        clean.reminderHour,
        clean.reminderMinute,
      );
      await AsyncStorage.setItem(KEY, JSON.stringify(clean));
    } catch {
      await AsyncStorage.setItem(KEY, JSON.stringify(clean));
    }
  }
}
