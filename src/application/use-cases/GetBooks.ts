import type { BibleRepository } from '../../domain/ports/BibleRepository';

export class GetBooks {
  constructor(private readonly bible: BibleRepository) {}
  execute() {
    return this.bible.listBooks();
  }
}
