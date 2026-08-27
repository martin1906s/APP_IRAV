import type { BibleRepository } from '../../domain/ports/BibleRepository';

export class GetChapter {
  constructor(private readonly bible: BibleRepository) {}
  execute(versionId: string, bookId: number, chapter: number) {
    return this.bible.getChapter(versionId, bookId, chapter);
  }
}
