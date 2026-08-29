import type { MoodLog, MoodType } from '../../../domain/entities/MoodLog';
import type { DailyInspiration } from '../../../domain/entities/DailyInspiration';
import type { MoodRepository } from '../../../domain/ports/MoodRepository';
import { apiRequest } from '../../api/apiClient';

type ApiInspirationRow = {
  date: string;
  mood: string;
  phrase: string;
  verseJson: DailyInspiration['verse'];
};

function mapInspiration(row: ApiInspirationRow): DailyInspiration {
  return {
    date: row.date,
    mood: row.mood as MoodType,
    phrase: row.phrase,
    verse: row.verseJson,
  };
}

export class ApiMoodAdapter implements MoodRepository {
  async saveToday(mood: MoodType): Promise<MoodLog> {
    const row = await apiRequest<MoodLog>('/moods/today', {
      method: 'POST',
      body: { mood },
    });
    return {
      ...row,
      createdAt:
        typeof row.createdAt === 'string' ? Date.parse(row.createdAt) : row.createdAt,
    };
  }

  async getToday(): Promise<MoodLog | null> {
    try {
      const row = await apiRequest<MoodLog>('/moods/today');
      return {
        ...row,
        createdAt:
          typeof row.createdAt === 'string' ? Date.parse(row.createdAt) : row.createdAt,
      };
    } catch {
      return null;
    }
  }

  async listRecent(limit = 14): Promise<MoodLog[]> {
    const rows = await apiRequest<MoodLog[]>(`/moods/recent?limit=${limit}`);
    return rows.map((row) => ({
      ...row,
      createdAt:
        typeof row.createdAt === 'string' ? Date.parse(row.createdAt) : row.createdAt,
    }));
  }

  async saveInspiration(inspiration: DailyInspiration): Promise<void> {
    await apiRequest('/moods/today/inspiration', {
      method: 'POST',
      body: {
        mood: inspiration.mood,
        phrase: inspiration.phrase,
        verseJson: inspiration.verse,
      },
    });
  }

  async getInspiration(date?: string): Promise<DailyInspiration | null> {
    try {
      const q = date ? `?date=${date}` : '';
      const row = await apiRequest<ApiInspirationRow>(`/moods/today/inspiration${q}`);
      return mapInspiration(row);
    } catch {
      return null;
    }
  }
}
