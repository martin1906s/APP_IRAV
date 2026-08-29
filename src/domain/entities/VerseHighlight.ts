export type VerseHighlight = {
  id: string;
  versionId: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  verseText?: string | null;
  color: string;
  createdAt?: string;
};
