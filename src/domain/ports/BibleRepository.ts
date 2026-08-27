import type { BibleVersion } from '../entities/BibleVersion';
import type { Book } from '../entities/Book';
import type { Chapter } from '../entities/Verse';

/** Puerto: fuente de contenido bíblico */
export interface BibleRepository {
  listVersions(): Promise<BibleVersion[]>;
  listBooks(): Promise<Book[]>;
  getChapter(versionId: string, bookId: number, chapter: number): Promise<Chapter>;
}
