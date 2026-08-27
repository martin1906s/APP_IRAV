export type ChatRole = 'user' | 'assistant';

export type BibleReference = {
  label: string;
  versionId: string;
  versionName: string;
  bookId: number;
  bookName: string;
  chapters: number;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  reference?: BibleReference;
};
