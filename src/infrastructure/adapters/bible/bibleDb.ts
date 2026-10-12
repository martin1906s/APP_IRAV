import * as SQLite from 'expo-sqlite';

// Definición de las entidades
export interface BibleVersionRecord {
  id: string;
  name: string;
  short_name: string;
  language: string;
}

export interface BookRecord {
  id: number;
  version_id: string;
  name: string;
  testament: string;
}

export interface ChapterRecord {
  id: string; // Composite: version_id-book_id-chapter_number
  version_id: string;
  book_id: number;
  number: number;
}

export interface VerseRecord {
  id: string; // Composite: version_id-book_id-chapter_number-verse_number
  chapter_id: string;
  version_id: string;
  book_id: number;
  chapter_number: number;
  number: number;
  text: string;
}

class SQLiteBibleDatabase {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (this.db) return;
    this.db = await SQLite.openDatabaseAsync('irav_bible.db');
    await this.setupSchema();
  }

  private async setupSchema() {
    if (!this.db) throw new Error('Database not initialized');

    // Habilitar WAL (Write-Ahead Logging) para mayor rendimiento
    await this.db.execAsync('PRAGMA journal_mode = WAL;');

    // Crear tablas
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS versions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT,
        language TEXT
      );

      CREATE TABLE IF NOT EXISTS books (
        id INTEGER,
        version_id TEXT,
        name TEXT NOT NULL,
        testament TEXT,
        PRIMARY KEY (id, version_id),
        FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        version_id TEXT,
        book_id INTEGER,
        number INTEGER,
        FOREIGN KEY (book_id, version_id) REFERENCES books(id, version_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS verses (
        id TEXT PRIMARY KEY,
        chapter_id TEXT,
        version_id TEXT,
        book_id INTEGER,
        chapter_number INTEGER,
        number INTEGER,
        text TEXT NOT NULL,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_verses_chapter ON verses(version_id, book_id, chapter_number);
    `);
  }

  getDb() {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
    return this.db;
  }
}

export const bibleDb = new SQLiteBibleDatabase();
