import type { Book } from '../../domain/entities/Book';

/** Clave de índice: # para libros que empiezan con número, letra en mayúscula sin acento */
export function getBookIndexKey(name: string): string {
  const first = name.trim()[0];
  if (!first) return '#';
  if (/\d/.test(first)) return '#';
  return first
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Orden alfabético: primero números (1 Samuel…), luego letras A–Z */
export function sortBooksAlphabetically(books: Book[]): Book[] {
  return [...books].sort((a, b) => {
    const aNum = /^\d/.test(a.name);
    const bNum = /^\d/.test(b.name);
    if (aNum && !bNum) return -1;
    if (!aNum && bNum) return 1;
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });
}

const INDEX_ALPHABET = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

/** Letras/números disponibles según los libros filtrados */
export function buildIndexKeys(books: Book[]): string[] {
  const present = new Set(books.map((b) => getBookIndexKey(b.name)));
  return INDEX_ALPHABET.filter((k) => present.has(k));
}
