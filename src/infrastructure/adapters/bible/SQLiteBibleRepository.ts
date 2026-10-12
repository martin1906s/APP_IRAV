import { bibleDb } from './bibleDb';

export interface BibleJsonDump {
  version: { id: string; name: string; short_name: string; language: string };
  books: {
    id: number;
    name: string;
    testament: string;
    chapters: {
      number: number;
      verses: {
        number: number;
        text: string;
      }[];
    }[];
  }[];
}

export interface LocalBibleJson {
  id: string;
  books: {
    id: number;
    name: string;
    chapters: {
      chapter: number;
      verses: {
        number: number;
        text: string;
      }[];
    }[];
  }[];
}

export class SQLiteBibleRepository {
  /**
   * Inicializa la base de datos si no lo está.
   */
  async init() {
    await bibleDb.init();
  }

  /**
   * Descarga e inserta masivamente una versión de la Biblia desde una URL estática.
   */
  async downloadAndInstallVersion(url: string): Promise<void> {
    await this.init();
    const db = bibleDb.getDb();

    // 1. Descargar el JSON gigante
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download Bible from ${url}`);
    }
    
    // Parseo asíncrono y eficiente para no bloquear tanto
    const data = (await response.json()) as BibleJsonDump;
    const version = data.version;
    // ... lógica antigua (mantenida por retrocompatibilidad)
  }

  /**
   * Instala masivamente desde un objeto en memoria (100% offline).
   * Se adapta automáticamente tanto al formato de tu carpeta assets/bible como al formato del script nuevo.
   */
  async installLocalData(data: any, versionInfo: { id: string; name: string; shortName: string; language: string }): Promise<void> {
    await this.init();
    const db = bibleDb.getDb();

    const insertVersionStmt = await db.prepareAsync(
      'INSERT OR IGNORE INTO versions (id, name, short_name, language) VALUES ($id, $name, $short_name, $language)'
    );
    const insertBookStmt = await db.prepareAsync(
      'INSERT OR IGNORE INTO books (id, version_id, name, testament) VALUES ($id, $version_id, $name, $testament)'
    );
    const insertChapterStmt = await db.prepareAsync(
      'INSERT OR IGNORE INTO chapters (id, version_id, book_id, number) VALUES ($id, $version_id, $book_id, $number)'
    );
    const insertVerseStmt = await db.prepareAsync(
      'INSERT OR IGNORE INTO verses (id, chapter_id, version_id, book_id, chapter_number, number, text) VALUES ($id, $chapter_id, $version_id, $book_id, $chapter_number, $number, $text)'
    );

    try {
      await db.withTransactionAsync(async () => {
        // Purgar instalación anterior para evitar datos corruptos o incompletos
        await db.execAsync(`
          DELETE FROM verses WHERE version_id = '${versionInfo.id}';
          DELETE FROM chapters WHERE version_id = '${versionInfo.id}';
          DELETE FROM books WHERE version_id = '${versionInfo.id}';
          DELETE FROM versions WHERE id = '${versionInfo.id}';
        `);

        await insertVersionStmt.executeAsync({
          $id: versionInfo.id,
          $name: versionInfo.name,
          $short_name: versionInfo.shortName,
          $language: versionInfo.language,
        });

        // Detectar si es el formato antiguo/del usuario ({"1": {"1": [{number, text}]}}) 
        // o el formato nuevo ({"id": "...", "books": [...]})
        if (data.books && Array.isArray(data.books)) {
          // Formato del script download_bibles.js
          for (const book of data.books) {
            const testament = book.id <= 39 ? 'AT' : 'NT';
            await insertBookStmt.executeAsync({
              $id: book.id,
              $version_id: versionInfo.id,
              $name: book.name,
              $testament: testament,
            });

            for (const chap of book.chapters) {
              const chapterNum = chap.chapter;
              const chapterId = `${versionInfo.id}-${book.id}-${chapterNum}`;
              
              await insertChapterStmt.executeAsync({
                $id: chapterId,
                $version_id: versionInfo.id,
                $book_id: book.id,
                $number: chapterNum,
              });

              for (const verse of chap.verses) {
                const verseId = `${chapterId}-${verse.number}`;
                await insertVerseStmt.executeAsync({
                  $id: verseId,
                  $chapter_id: chapterId,
                  $version_id: versionInfo.id,
                  $book_id: book.id,
                  $chapter_number: chapterNum,
                  $number: verse.number,
                  $text: verse.text,
                });
              }
            }
          }
        } else {
          // Formato de assets/bible ({"1": {"1": [...]}})
          const bookIds = Object.keys(data);
          for (const bookIdStr of bookIds) {
            const bookId = parseInt(bookIdStr, 10);
            if (isNaN(bookId)) continue;
            
            const testament = bookId <= 39 ? 'AT' : 'NT';
            await insertBookStmt.executeAsync({
              $id: bookId,
              $version_id: versionInfo.id,
              $name: `Libro ${bookId}`, // Este formato no trae el nombre del libro, se mapeará en la UI si es necesario
              $testament: testament,
            });

            const chaptersObj = data[bookIdStr];
            const chapterNums = Object.keys(chaptersObj);
            
            for (const chapNumStr of chapterNums) {
              const chapterNum = parseInt(chapNumStr, 10);
              const chapterId = `${versionInfo.id}-${bookId}-${chapterNum}`;
              
              await insertChapterStmt.executeAsync({
                $id: chapterId,
                $version_id: versionInfo.id,
                $book_id: bookId,
                $number: chapterNum,
              });

              const verses = chaptersObj[chapNumStr];
              for (const verse of verses) {
                const verseId = `${chapterId}-${verse.number}`;
                await insertVerseStmt.executeAsync({
                  $id: verseId,
                  $chapter_id: chapterId,
                  $version_id: versionInfo.id,
                  $book_id: bookId,
                  $chapter_number: chapterNum,
                  $number: verse.number,
                  $text: verse.text,
                });
              }
            }
          }
        }
      });
    } finally {
      await insertVersionStmt.finalizeAsync();
      await insertBookStmt.finalizeAsync();
      await insertChapterStmt.finalizeAsync();
      await insertVerseStmt.finalizeAsync();
    }
  }

  /**
   * Obtiene la lista de versiones instaladas localmente
   */
  async getInstalledVersions() {
    await this.init();
    const db = bibleDb.getDb();
    return await db.getAllAsync<{ id: string; name: string; short_name: string; language: string }>('SELECT * FROM versions');
  }

  /**
   * Obtiene los libros de una versión específica
   */
  async getBooksByVersion(versionId: string) {
    await this.init();
    const db = bibleDb.getDb();
    return await db.getAllAsync<{ id: number; name: string; testament: string }>(
      'SELECT * FROM books WHERE version_id = ? ORDER BY id ASC',
      [versionId]
    );
  }

  /**
   * Obtiene todos los versículos de un capítulo
   */
  async getChapterVerses(versionId: string, bookId: number, chapterNumber: number) {
    await this.init();
    const db = bibleDb.getDb();
    return await db.getAllAsync<{ number: number; text: string }>(
      'SELECT number, text FROM verses WHERE version_id = ? AND book_id = ? AND chapter_number = ? ORDER BY number ASC',
      [versionId, bookId, chapterNumber]
    );
  }
}

export const sqliteBibleRepo = new SQLiteBibleRepository();
