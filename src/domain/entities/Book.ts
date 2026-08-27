export type Testament = 'AT' | 'NT';

export type Book = {
  id: number;
  name: string;
  chapters: number;
  testament: Testament;
};
