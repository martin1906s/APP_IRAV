export type Verse = {
  number: number;
  text: string;
};

export type Chapter = {
  bookId: number;
  bookName: string;
  chapter: number;
  verses: Verse[];
};
