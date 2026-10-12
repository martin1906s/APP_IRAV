import { SQLiteBibleRepository } from './SQLiteBibleRepository';
import { BIBLE_VERSIONS, REMOTE_VERSION_IDS } from '../../../shared/constants/bibleVersions';
import { BIBLE_BOOKS } from './BibleBooksCatalog';
import type { BibleRepository } from '../../../domain/ports/BibleRepository';
import type { Chapter, Verse } from '../../../domain/entities/Verse';

export class SQLiteBibleAdapter implements BibleRepository {
  private repo = new SQLiteBibleRepository();

  async init() {
    await this.repo.init();
  }

  // Interfaz estándar
  async listVersions() {
    return BIBLE_VERSIONS;
  }

  async listBooks(versionId: string) {
    const books = await this.repo.getBooksByVersion(versionId);
    if (books.length > 0) return books;
    return BIBLE_BOOKS; // Fallback
  }

  async getChapter(versionId: string, bookId: number, chapter: number): Promise<Chapter> {
    const book = BIBLE_BOOKS.find((b) => b.id === bookId);
    const bookName = book?.name ?? `Libro ${bookId}`;

    const verses = await this.repo.getChapterVerses(versionId, bookId, chapter);
    if (verses.length > 0) {
      return { bookId, bookName, chapter, verses };
    }

    // Fallback: Si no está en SQLite, devolver un mensaje
    return {
      bookId,
      bookName,
      chapter,
      verses: [{ number: 1, text: 'Versión no descargada. Ve a Versiones y pulsa Descargar.' }],
    };
  }

  // Funciones exclusivas del SQLiteAdapter para la UI
  async getInstalledVersionsIds(): Promise<string[]> {
    const installed = await this.repo.getInstalledVersions();
    return installed.map(v => v.id);
  }

  async downloadVersion(versionId: string, url: string) {
    await this.repo.downloadAndInstallVersion(url);
  }

  async installLocalData(data: any, versionInfo: any) {
    await this.repo.installLocalData(data, versionInfo);
  }
}
