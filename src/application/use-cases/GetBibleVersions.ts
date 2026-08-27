import type { BibleRepository } from '../../domain/ports/BibleRepository';

export class GetBibleVersions {
  constructor(private readonly bible: BibleRepository) {}
  execute() {
    return this.bible.listVersions();
  }
}
