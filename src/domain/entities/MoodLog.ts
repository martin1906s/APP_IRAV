export type MoodType =
  | 'Paz'
  | 'Alegría'
  | 'Ansiedad'
  | 'Tristeza'
  | 'Fuerza'
  | 'Gratitud';

export type MoodLog = {
  id?: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  createdAt: number;
};

export const MOOD_OPTIONS: MoodType[] = [
  'Paz',
  'Alegría',
  'Ansiedad',
  'Tristeza',
  'Fuerza',
  'Gratitud',
];
