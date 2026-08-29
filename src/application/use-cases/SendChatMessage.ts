import type { AiChatPort, AiInput } from '../../domain/ports/AiChatPort';
import type { BibleReference, ChatMessage } from '../../domain/entities/ChatMessage';
import { BIBLE_BOOKS } from '../../infrastructure/adapters/bible/BibleBooksCatalog';
import { BIBLE_VERSIONS } from '../../shared/constants/bibleVersions';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Alias frecuentes que el modelo usa en lugar del nombre canónico. */
const BOOK_ALIASES: Record<string, string> = {
  salmo: 'Salmos',
  salmos: 'Salmos',
  cantar: 'Cantares',
  cantares: 'Cantares',
  'canto de los cantares': 'Cantares',
  apocalipsis: 'Apocalipsis',
  revelacion: 'Apocalipsis',
  revelación: 'Apocalipsis',
  hechos: 'Hechos',
  'hechos de los apostoles': 'Hechos',
  'hechos de los apóstoles': 'Hechos',
};

function normalizeKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

function resolveBook(rawName: string) {
  const key = normalizeKey(rawName);
  const aliased = BOOK_ALIASES[key];
  if (aliased) {
    return BIBLE_BOOKS.find((book) => book.name === aliased);
  }
  return BIBLE_BOOKS.find((book) => normalizeKey(book.name) === key);
}

function resolveVersion(rawCode?: string) {
  const fallback =
    BIBLE_VERSIONS.find((item) => item.id === 'NVI') ?? BIBLE_VERSIONS[0];
  if (!rawCode) return fallback;

  const code = rawCode.trim().toUpperCase().replace(/\s+/g, '');
  return (
    BIBLE_VERSIONS.find((item) => item.id.toUpperCase() === code) ||
    BIBLE_VERSIONS.find((item) => item.shortName.toUpperCase() === code) ||
    fallback
  );
}

function findReference(text: string): BibleReference | undefined {
  const names = [
    ...BIBLE_BOOKS.map((book) => book.name),
    ...Object.keys(BOOK_ALIASES).map(
      (alias) => alias.charAt(0).toUpperCase() + alias.slice(1),
    ),
    'Salmo',
    'Cantar',
    'Revelación',
    'Revelacion',
  ]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .filter((value, index, all) => all.indexOf(value) === index)
    .join('|');

  const versionCodes = [
    ...BIBLE_VERSIONS.map((v) => v.id),
    ...BIBLE_VERSIONS.map((v) => v.shortName),
  ]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .filter((value, index, all) => all.indexOf(value) === index)
    .join('|');

  const match = text.match(
    new RegExp(
      `(${names})\\s+(\\d+)\\s*[:：]\\s*(\\d+)(?:\\s*[-–—]\\s*(\\d+))?(?:\\s*[\\(（,]\\s*(${versionCodes})\\s*[\\)）]?)?`,
      'i',
    ),
  );

  if (!match) return undefined;

  const book = resolveBook(match[1]);
  const version = resolveVersion(match[5]);
  if (!book || !version) return undefined;

  const chapter = Number(match[2]);
  const verseStart = Number(match[3]);
  const verseEnd = match[4] ? Number(match[4]) : undefined;
  if (chapter < 1 || chapter > book.chapters || verseStart < 1) return undefined;

  return {
    label: `${book.name} ${chapter}:${verseStart}${verseEnd ? `-${verseEnd}` : ''} (${version.shortName})`,
    versionId: version.id,
    versionName: version.name,
    bookId: book.id,
    bookName: book.name,
    chapters: book.chapters,
    chapter,
    verseStart,
    verseEnd,
  };
}

/** Caso de uso: respuesta de chat (la voz la dispara la UI al recibir el texto). */
export class SendChatMessage {
  constructor(
    private readonly ai: AiChatPort,
    private readonly chat?: { saveMessage: (m: ChatMessage) => Promise<void> },
  ) {}

  async execute(input: AiInput): Promise<ChatMessage> {
    const text = await this.ai.reply(input);

    const message: ChatMessage = {
      id: `${Date.now()}`,
      role: 'assistant',
      text,
      createdAt: Date.now(),
      reference: findReference(text),
    };

    if (this.chat) {
      await this.chat.saveMessage(message).catch(() => undefined);
    }

    return message;
  }
}
