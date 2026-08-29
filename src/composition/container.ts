import { BibleApiAdapter } from '../infrastructure/adapters/bible/BibleApiAdapter';
import { GeminiAdapter } from '../infrastructure/adapters/ai/GeminiAdapter';
import { ExpoSpeechAdapter } from '../infrastructure/adapters/speech/ExpoSpeechAdapter';
import { ExpoAudioAdapter } from '../infrastructure/adapters/speech/ExpoAudioAdapter';
import { ApiProfileAdapter } from '../infrastructure/adapters/profile/ApiProfileAdapter';
import { ApiMoodAdapter } from '../infrastructure/adapters/mood/ApiMoodAdapter';
import { ApiChatAdapter } from '../infrastructure/adapters/chat/ApiChatAdapter';
import { ApiAuthAdapter } from '../infrastructure/adapters/auth/ApiAuthAdapter';
import { ApiAdminAdapter } from '../infrastructure/adapters/admin/ApiAdminAdapter';
import { ApiAnnouncementsAdapter } from '../infrastructure/adapters/announcements/ApiAnnouncementsAdapter';
import { ApiConfigAdapter } from '../infrastructure/adapters/config/ApiConfigAdapter';
import { ApiHighlightAdapter } from '../infrastructure/adapters/highlights/ApiHighlightAdapter';
import { ApiChallengeAdapter } from '../infrastructure/adapters/challenges/ApiChallengeAdapter';
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
const profiles = new ApiProfileAdapter();
const moods = new ApiMoodAdapter();
const chat = new ApiChatAdapter();
const auth = new ApiAuthAdapter();
const admin = new ApiAdminAdapter();
const config = new ApiConfigAdapter();
const announcements = new ApiAnnouncementsAdapter();
const highlights = new ApiHighlightAdapter();
const challenges = new ApiChallengeAdapter();

export const container = {
  audio,
  speech,
  ai,
  auth,
  chat,
  admin,
  config,
  announcements,
  highlights,
  challenges,
  getVersions: new GetBibleVersions(bible),
  getBooks: new GetBooks(bible),
  getChapter: new GetChapter(bible),
  transcribeAudio: new TranscribeAudio(ai),
  sendChat: new SendChatMessage(ai, chat),
  getProfile: new GetUserProfile(profiles),
  saveProfile: new SaveUserProfile(profiles),
  saveMoodAndInspire: new SaveMoodAndInspire(moods, profiles, bible),
  getTodayInspiration: new GetTodayInspiration(moods),
  getRecentMoods: new GetRecentMoods(moods),
};
