import type { BibleRepository } from '../../../domain/ports/BibleRepository';
import type { Chapter, Verse } from '../../../domain/entities/Verse';
import { BIBLE_VERSIONS, REMOTE_VERSION_IDS } from '../../../shared/constants/bibleVersions';
import { BIBLE_BOOKS } from './BibleBooksCatalog';

type LocalBible = Record<string, Record<string, Verse[]>>;

const LOCAL_MAP: Record<string, () => any> = {
  RVR: () => require('../../../../assets/bible/RVR.json'),
  KJV: () => require('../../../../assets/bible/KJV.json'),
  BBE: () => require('../../../../assets/bible/BBE.json'),
  RV1960: () => require('../../../../assets/bible/RV1960.json'),
  NVI: () => require('../../../../assets/bible/NVI.json'),
  PDT: () => require('../../../../assets/bible/PDT.json'),
  NTV: () => require('../../../../assets/bible/NTV.json'),
};

const cache: Record<string, LocalBible> = {};

function loadLocal(versionId: string): LocalBible | null {
  if (cache[versionId]) return cache[versionId];
  const loader = LOCAL_MAP[versionId];
  if (!loader) return null;
  try {
    cache[versionId] = loader() as LocalBible;
    return cache[versionId];
  } catch {
    return null;
  }
}

/**
 * Adaptador: JSON local primero, luego bolls.life
 */
export class BibleApiAdapter implements BibleRepository {
  async listVersions() {
    return BIBLE_VERSIONS;
  }

  async listBooks() {
    return BIBLE_BOOKS;
  }

  async getChapter(versionId: string, bookId: number, chapter: number): Promise<Chapter> {
    const book = BIBLE_BOOKS.find((b) => b.id === bookId);
    const bookName = book?.name ?? `Libro ${bookId}`;

    const local = loadLocal(versionId);
    const localVerses = local?.[String(bookId)]?.[String(chapter)];
    if (localVerses && localVerses.length > 0) {
      return { bookId, bookName, chapter, verses: localVerses };
    }

    const remoteId = REMOTE_VERSION_IDS[versionId] ?? versionId;
    try {
      const url = `https://bolls.life/get-text/${remoteId}/${bookId}/${chapter}/`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch');
      const data = (await res.json()) as { verse: number; text: string }[];
      const verses: Verse[] = (data || []).map((v) => ({
        number: v.verse,
        text: String(v.text || '').replace(/<[^>]+>/g, ''),
      }));
      if (!verses.length) throw new Error('empty');
      return { bookId, bookName, chapter, verses };
    } catch {
      return {
        bookId,
        bookName,
        chapter,
        verses: [{ number: 1, text: 'Este capítulo no está disponible ahora.' }],
      };
    }
  }
}
