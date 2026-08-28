import type { MoodType } from '../../../domain/entities/MoodLog';
import type { InspirationVerse } from '../../../domain/entities/DailyInspiration';

type PoolItem = {
  phrase: string;
  verse: InspirationVerse;
};

const V = (partial: Omit<InspirationVerse, 'versionId' | 'versionName' | 'chapters'> & { chapters?: number }) => ({
  ...partial,
  chapters: partial.chapters ?? 50,
  versionId: 'NVI',
  versionName: 'Nueva Versión Internacional',
});

/** Frases cortas + versículos por ánimo */
export const INSPIRATION_BY_MOOD: Record<MoodType, PoolItem[]> = {
  Paz: [
    {
      phrase: 'Dios sostiene lo que no alcanzas a cargar.',
      verse: V({
        text: 'Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera; porque en ti ha confiado.',
        reference: 'Isaías 26:3',
        bookId: 23,
        bookName: 'Isaías',
        chapter: 26,
        verse: 3,
        chapters: 66,
      }),
    },
    {
      phrase: 'La paz es saber quién camina contigo.',
      verse: V({
        text: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.',
        reference: 'Juan 14:27',
        bookId: 43,
        bookName: 'Juan',
        chapter: 14,
        verse: 27,
        chapters: 21,
      }),
    },
  ],
  Alegría: [
    {
      phrase: 'Tu sonrisa también adora.',
      verse: V({
        text: 'Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.',
        reference: 'Salmos 118:24',
        bookId: 19,
        bookName: 'Salmos',
        chapter: 118,
        verse: 24,
        chapters: 150,
      }),
    },
    {
      phrase: 'Dios se alegra contigo.',
      verse: V({
        text: 'El gozo de Jehová es vuestra fuerza.',
        reference: 'Nehemías 8:10',
        bookId: 16,
        bookName: 'Nehemías',
        chapter: 8,
        verse: 10,
        chapters: 13,
      }),
    },
  ],
  Ansiedad: [
    {
      phrase: 'No resuelvas todo hoy. Da un paso.',
      verse: V({
        text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.',
        reference: 'Filipenses 4:6',
        bookId: 50,
        bookName: 'Filipenses',
        chapter: 4,
        verse: 6,
        chapters: 4,
      }),
    },
    {
      phrase: 'Cuando la mente corre, descansa en Él.',
      verse: V({
        text: 'Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.',
        reference: '1 Pedro 5:7',
        bookId: 60,
        bookName: '1 Pedro',
        chapter: 5,
        verse: 7,
        chapters: 5,
      }),
    },
  ],
  Tristeza: [
    {
      phrase: 'Llorar también es valiente.',
      verse: V({
        text: 'Jehová está cerca de los quebrantados de corazón; y salva a los contritos de espíritu.',
        reference: 'Salmos 34:18',
        bookId: 19,
        bookName: 'Salmos',
        chapter: 34,
        verse: 18,
        chapters: 150,
      }),
    },
    {
      phrase: 'Esta noche no dura para siempre.',
      verse: V({
        text: 'Bienaventurados los que lloran, porque ellos recibirán consolación.',
        reference: 'Mateo 5:4',
        bookId: 40,
        bookName: 'Mateo',
        chapter: 5,
        verse: 4,
        chapters: 28,
      }),
    },
  ],
  Fuerza: [
    {
      phrase: 'Tu fuerza nace de confiar.',
      verse: V({
        text: 'Todo lo puedo en Cristo que me fortalece.',
        reference: 'Filipenses 4:13',
        bookId: 50,
        bookName: 'Filipenses',
        chapter: 4,
        verse: 13,
        chapters: 4,
      }),
    },
    {
      phrase: 'Avanza, aunque sea un paso.',
      verse: V({
        text: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo… porque Jehová tu Dios es el que va contigo.',
        reference: 'Deuteronomio 31:6',
        bookId: 5,
        bookName: 'Deuteronomio',
        chapter: 31,
        verse: 6,
        chapters: 34,
      }),
    },
  ],
  Gratitud: [
    {
      phrase: 'Mirar lo que tienes cambia el peso.',
      verse: V({
        text: 'Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.',
        reference: '1 Tesalonicenses 5:18',
        bookId: 52,
        bookName: '1 Tesalonicenses',
        chapter: 5,
        verse: 18,
        chapters: 5,
      }),
    },
    {
      phrase: 'La gratitud abre la puerta a la paz.',
      verse: V({
        text: 'Bendice, alma mía, a Jehová, y no olvides ninguno de sus beneficios.',
        reference: 'Salmos 103:2',
        bookId: 19,
        bookName: 'Salmos',
        chapter: 103,
        verse: 2,
        chapters: 150,
      }),
    },
  ],
};
