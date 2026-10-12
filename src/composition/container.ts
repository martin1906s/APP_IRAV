import { SQLiteBibleAdapter } from '../infrastructure/adapters/bible/SQLiteBibleAdapter';
import { GeminiAdapter } from '../infrastructure/adapters/ai/GeminiAdapter';
import { ExpoSpeechAdapter } from '../infrastructure/adapters/speech/ExpoSpeechAdapter';
import { ExpoAudioAdapter } from '../infrastructure/adapters/speech/ExpoAudioAdapter';

import {
  SupabaseProfileAdapter,
  SupabaseMoodAdapter,
  SupabaseChatAdapter,
  SupabaseAdminAdapter,
  SupabaseConfigAdapter,
  SupabaseAnnouncementsAdapter,
  SupabaseHighlightAdapter,
  SupabaseChallengeAdapter
} from '../infrastructure/adapters/supabase/SupabaseAdapters';
import { SupabaseAuthAdapter } from '../infrastructure/adapters/supabase/SupabaseAuthAdapter';

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
const bibleAdapter = new SQLiteBibleAdapter();
const ai = new GeminiAdapter();
const speech = new ExpoSpeechAdapter();
const audio = new ExpoAudioAdapter();

// Adaptadores mock de Supabase
const profiles = new SupabaseProfileAdapter();
const moods = new SupabaseMoodAdapter();
const chat = new SupabaseChatAdapter();
const admin = new SupabaseAdminAdapter();
const config = new SupabaseConfigAdapter();
const announcements = new SupabaseAnnouncementsAdapter();
const highlights = new SupabaseHighlightAdapter();
const challenges = new SupabaseChallengeAdapter();

export const container = {
  audio,
  speech,
  ai,
  auth: new SupabaseAuthAdapter(),
  chat,
  admin,
  config,
  announcements,
  highlights,
  challenges,
  // Adapter directo para la UI
  bibleAdapter,
  // Use cases
  getVersions: new GetBibleVersions(bibleAdapter),
  getBooks: new GetBooks(bibleAdapter),
  getChapter: new GetChapter(bibleAdapter),
  transcribeAudio: new TranscribeAudio(ai),
  sendChat: new SendChatMessage(ai, chat as any),
  getProfile: new GetUserProfile(profiles as any),
  saveProfile: new SaveUserProfile(profiles as any),
  saveMoodAndInspire: new SaveMoodAndInspire(moods as any, profiles as any, bibleAdapter),
  getTodayInspiration: new GetTodayInspiration(moods as any),
  getRecentMoods: new GetRecentMoods(moods as any),
};
