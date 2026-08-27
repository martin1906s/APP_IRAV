import type { MoodType } from './MoodLog';

export type InspirationVerse = {
  text: string;
  reference: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  chapters: number;
  versionId: string;
  versionName: string;
};

export type DailyInspiration = {
  date: string;
  mood: MoodType;
  phrase: string;
  verse: InspirationVerse;
};
