import type { MoodRepository } from '../../domain/ports/MoodRepository';
import type { UserProfilePort } from '../../domain/ports/UserProfilePort';
import type { BibleRepository } from '../../domain/ports/BibleRepository';
import type { MoodType } from '../../domain/entities/MoodLog';
import type { DailyInspiration } from '../../domain/entities/DailyInspiration';
import { DEFAULT_PROFILE } from '../../domain/entities/UserProfile';
import { buildDailyInspiration } from './BuildDailyInspiration';

/** Guarda el ánimo de hoy y genera versículo + frase (versión desde ajustes). */
export class SaveMoodAndInspire {
  constructor(
    private readonly moods: MoodRepository,
    private readonly profiles: UserProfilePort,
    private readonly bible: BibleRepository,
  ) {}

  async execute(mood: MoodType): Promise<DailyInspiration> {
    await this.moods.saveToday(mood);
    const history = await this.moods.listRecent(21);
    const profile = await this.profiles.get();
    const versionId = profile?.preferredVersionId || DEFAULT_PROFILE.preferredVersionId;
    let inspiration = buildDailyInspiration(mood, history, undefined, versionId);

    try {
      const chapter = await this.bible.getChapter(
        inspiration.verse.versionId,
        inspiration.verse.bookId,
        inspiration.verse.chapter,
      );
      const found = chapter.verses.find((v) => v.number === inspiration.verse.verse);
      if (found?.text) {
        inspiration = {
          ...inspiration,
          verse: {
            ...inspiration.verse,
            text: found.text,
            bookName: chapter.bookName || inspiration.verse.bookName,
            reference: `${chapter.bookName || inspiration.verse.bookName} ${inspiration.verse.chapter}:${inspiration.verse.verse}`,
          },
        };
      }
    } catch {
      /* mantiene texto del pool */
    }

    await this.moods.saveInspiration(inspiration);
    return inspiration;
  }
}

export class GetTodayInspiration {
  constructor(private readonly moods: MoodRepository) {}

  async execute(): Promise<{
    mood: MoodType | null;
    inspiration: DailyInspiration | null;
  }> {
    const today = await this.moods.getToday();
    const inspiration = await this.moods.getInspiration();
    return { mood: today?.mood ?? null, inspiration };
  }
}
