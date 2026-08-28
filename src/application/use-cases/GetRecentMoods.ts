import type { MoodLog } from '../../domain/entities/MoodLog';
import type { MoodRepository } from '../../domain/ports/MoodRepository';

/** Últimos ánimos registrados */
export class GetRecentMoods {
  constructor(private moods: MoodRepository) {}

  execute(limit = 7): Promise<MoodLog[]> {
    return this.moods.listRecent(limit);
  }
}
