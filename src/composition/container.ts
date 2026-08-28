import { BibleApiAdapter } from '../infrastructure/adapters/bible/BibleApiAdapter';
import { GeminiAdapter } from '../infrastructure/adapters/ai/GeminiAdapter';
import { ExpoSpeechAdapter } from '../infrastructure/adapters/speech/ExpoSpeechAdapter';
import { ExpoAudioAdapter } from '../infrastructure/adapters/speech/ExpoAudioAdapter';
import { SqliteProfileAdapter } from '../infrastructure/adapters/profile/SqliteProfileAdapter';
import { SqliteMoodAdapter } from '../infrastructure/adapters/mood/SqliteMoodAdapter';
import { GetBibleVersions } from '../application/use-cases/GetBibleVersions';
import { GetBooks } from '../application/use-cases/GetBooks';
import { GetChapter } from '../application/use-cases/GetChapter';
import { SendChatMessage } from '../application/use-cases/SendChatMessage';
import { TranscribeAudio } from '../application/use-cases/TranscribeAudio';
import { GetUserProfile, SaveUserProfile } from '../application/use-cases/UserProfileUseCases';
import {
  GetTodayInspiration,
  SaveMoodAndInspire,
} from '../application/use-cases/MoodInspirationUseCases';
import { GetRecentMoods } from '../application/use-cases/GetRecentMoods';

/** Composition root */
const bible = new BibleApiAdapter();
const ai = new GeminiAdapter();
const speech = new ExpoSpeechAdapter();
const audio = new ExpoAudioAdapter();
const profiles = new SqliteProfileAdapter();
const moods = new SqliteMoodAdapter();

export const container = {
  audio,
  speech,
  ai,
  getVersions: new GetBibleVersions(bible),
  getBooks: new GetBooks(bible),
  getChapter: new GetChapter(bible),
  transcribeAudio: new TranscribeAudio(ai),
  sendChat: new SendChatMessage(ai),
  getProfile: new GetUserProfile(profiles),
  saveProfile: new SaveUserProfile(profiles),
  saveMoodAndInspire: new SaveMoodAndInspire(moods, profiles, bible),
  getTodayInspiration: new GetTodayInspiration(moods),
  getRecentMoods: new GetRecentMoods(moods),
};
