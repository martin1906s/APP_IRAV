import type { MoodLog, MoodType } from '../../domain/entities/MoodLog';
import type { DailyInspiration } from '../../domain/entities/DailyInspiration';
import { DEFAULT_PROFILE } from '../../domain/entities/UserProfile';
import { INSPIRATION_BY_MOOD } from '../../shared/constants/inspiration/moodPools';
import { BIBLE_VERSIONS } from '../../shared/constants/bibleVersions';

function daySeed(date: string) {
  return date.split('-').reduce((acc, part) => acc + Number(part), 0);
}

function countMood(history: MoodLog[], mood: MoodType) {
  return history.filter((item) => item.mood === mood).length;
}

/**
 * Inspiración del día según ánimo de hoy + historial en SQLite.
 * La versión del versículo sale de los ajustes del usuario (no quemada).
 */
export function buildDailyInspiration(
  mood: MoodType,
  history: MoodLog[],
  date = new Date().toISOString().slice(0, 10),
  preferredVersionId = DEFAULT_PROFILE.preferredVersionId,
): DailyInspiration {
  const previous = history.filter((item) => item.date !== date);
  const recent = previous.slice(0, 7);
  const hardDays =
    countMood(recent, 'Ansiedad') + countMood(recent, 'Tristeza');

  let focus: MoodType = mood;
  if (hardDays >= 4 && (mood === 'Ansiedad' || mood === 'Tristeza' || mood === 'Paz')) {
    focus = mood === 'Paz' ? 'Paz' : mood;
  }

  const pool = INSPIRATION_BY_MOOD[focus];
  const repeats = countMood(previous, focus);
  const comfortBias = hardDays >= 3 ? 1 : 0;
  const index = (daySeed(date) + repeats + comfortBias) % pool.length;
  const pick = pool[index];

  const version =
    BIBLE_VERSIONS.find((v) => v.id === preferredVersionId) ||
    BIBLE_VERSIONS.find((v) => v.id === DEFAULT_PROFILE.preferredVersionId)!;

  return {
    date,
    mood,
    phrase: pick.phrase,
    verse: {
      ...pick.verse,
      versionId: version.id,
      versionName: version.name,
      reference: `${pick.verse.bookName} ${pick.verse.chapter}:${pick.verse.verse}`,
    },
  };
}
