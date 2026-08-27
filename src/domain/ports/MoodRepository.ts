import type { MoodLog, MoodType } from '../entities/MoodLog';
import type { DailyInspiration } from '../entities/DailyInspiration';

/** Puerto: ánimos diarios e inspiración del día */
export interface MoodRepository {
  saveToday(mood: MoodType): Promise<MoodLog>;
  getToday(): Promise<MoodLog | null>;
  listRecent(limit?: number): Promise<MoodLog[]>;
  saveInspiration(inspiration: DailyInspiration): Promise<void>;
  getInspiration(date?: string): Promise<DailyInspiration | null>;
}
