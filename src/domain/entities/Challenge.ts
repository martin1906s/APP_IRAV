export type ChallengeCategory =
  | 'oración'
  | 'alabanza'
  | 'lectura'
  | 'servicio'
  | 'gratitud'
  | 'silencio';

export type ChallengeDayState =
  | 'completed'
  | 'missed'
  | 'today'
  | 'locked'
  | 'unavailable';

export type ChallengeItem = {
  day: number;
  title: string;
  description: string;
  category: ChallengeCategory;
};

export type ChallengeStatus = {
  enrolled: boolean;
  yearMonth: string;
  monthLabel: string;
  currentDay: number;
  calendarDay: number;
  totalDays: number;
  completedDays: number[];
  missedDays: number[];
  dayStates: Record<number, ChallengeDayState>;
  todayCompleted: boolean;
  finished: boolean;
  hasChallengeToday: boolean;
  todayChallenge: ChallengeItem;
  catalog: ChallengeItem[];
};
