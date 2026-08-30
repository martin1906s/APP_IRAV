import type { MoodLog } from '../../../domain/entities/MoodLog';
import type { ChatMessage } from '../../../domain/entities/ChatMessage';
import type { UserProfile } from '../../../domain/entities/UserProfile';
import type { Announcement } from '../announcements/ApiAnnouncementsAdapter';
import { apiRequest } from '../../api/apiClient';

export type AdminUserRow = UserProfile & {
  lastMood?: { date: string; mood: string } | null;
};

export type AdminStats = {
  users: number;
  moods: number;
  chats: number;
  highlights: number;
};

export type AdminAnalytics = {
  moodsByType: Array<{ mood: string; count: number }>;
  activityLast7Days: Array<{ date: string; moods: number; chats: number }>;
  newUsersByMonth: Array<{ month: string; count: number }>;
};

export type SystemSettings = {
  id: number;
  chatRetentionDays: number;
  defaultReminderHour: number;
  defaultReminderMinute: number;
  pastoralSummaryMaxWords: number;
  dailyMoodRequired: boolean;
  defaultBibleVersion: string;
  notificationsEnabledByDefault: boolean;
  geminiModelOverride: string | null;
  updatedAt: string;
};

export type UpdateSystemSettingsPayload = Partial<
  Omit<SystemSettings, 'id' | 'updatedAt'>
>;

export type VerseHighlightRow = {
  id: string;
  userId: string;
  versionId: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string | null;
  color: string;
  createdAt: string;
};

export type CreateAdminUserPayload = {
  documentType: UserProfile['documentType'];
  documentId: string;
  password: string;
  name: string;
  birthDate: string;
  phone: string;
  country: string;
  role?: UserProfile['role'];
  preferredVersionId?: string;
};

export type UpdateAdminUserPayload = Partial<CreateAdminUserPayload>;

export type CreateAnnouncementPayload = {
  title: string;
  body: string;
  imageBase64?: string;
  imageMimeType?: string;
  sendNow?: boolean;
};

export type UpdateAnnouncementPayload = {
  title?: string;
  body?: string;
  imageBase64?: string;
  imageMimeType?: string;
  removeImage?: boolean;
};

export type SendAnnouncementResult = {
  recipientsCount: number;
  targetedUsers: number;
  targetedDevices?: number;
  announcement: Announcement;
};

export class ApiAdminAdapter {
  getStats() {
    return apiRequest<AdminStats>('/admin/stats');
  }

  getAnalytics() {
    return apiRequest<AdminAnalytics>('/admin/analytics');
  }

  getSettings() {
    return apiRequest<SystemSettings>('/admin/settings');
  }

  updateSettings(payload: UpdateSystemSettingsPayload) {
    return apiRequest<SystemSettings>('/admin/settings', {
      method: 'PATCH',
      body: payload,
    });
  }

  listUsers() {
    return apiRequest<AdminUserRow[]>('/admin/users');
  }

  getUser(id: string) {
    return apiRequest<AdminUserRow>(`/admin/users/${id}`);
  }

  createUser(payload: CreateAdminUserPayload) {
    return apiRequest<AdminUserRow>('/admin/users', {
      method: 'POST',
      body: payload,
    });
  }

  updateUser(id: string, payload: UpdateAdminUserPayload) {
    return apiRequest<AdminUserRow>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  deleteUser(id: string) {
    return apiRequest<{ deleted: boolean }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  getUserMoods(id: string) {
    return apiRequest<MoodLog[]>(`/admin/users/${id}/moods`);
  }

  deleteMood(userId: string, moodId: string) {
    return apiRequest<{ deleted: boolean }>(`/admin/users/${userId}/moods/${moodId}`, {
      method: 'DELETE',
    });
  }

  getUserChat(id: string) {
    return apiRequest<ChatMessage[]>(`/admin/users/${id}/chat`);
  }

  deleteChatMessage(userId: string, messageId: string) {
    return apiRequest<{ deleted: boolean }>(`/admin/users/${userId}/chat/${messageId}`, {
      method: 'DELETE',
    });
  }

  getUserHighlights(id: string) {
    return apiRequest<VerseHighlightRow[]>(`/admin/users/${id}/highlights`);
  }

  deleteHighlight(highlightId: string) {
    return apiRequest<{ deleted: boolean }>(`/admin/highlights/${highlightId}`, {
      method: 'DELETE',
    });
  }

  generateSummary(id: string) {
    return apiRequest<{ summary: string }>(`/admin/users/${id}/summary`, {
      method: 'POST',
      body: {},
    });
  }

  listAnnouncements() {
    return apiRequest<Announcement[]>('/admin/announcements');
  }

  getAnnouncement(id: string) {
    return apiRequest<Announcement>(`/admin/announcements/${id}`);
  }

  createAnnouncement(payload: CreateAnnouncementPayload) {
    return apiRequest<Announcement | SendAnnouncementResult>('/admin/announcements', {
      method: 'POST',
      body: payload,
    });
  }

  updateAnnouncement(id: string, payload: UpdateAnnouncementPayload) {
    return apiRequest<Announcement>(`/admin/announcements/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  deleteAnnouncement(id: string) {
    return apiRequest<{ deleted: boolean }>(`/admin/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  sendAnnouncement(id: string) {
    return apiRequest<SendAnnouncementResult>(`/admin/announcements/${id}/send`, {
      method: 'POST',
      body: {},
    });
  }
}
