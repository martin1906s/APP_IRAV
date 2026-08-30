import type { UserProfile } from '../../../domain/entities/UserProfile';
import type { UserProfilePort } from '../../../domain/ports/UserProfilePort';
import { apiRequest } from '../../api/apiClient';
import { getStoredUser, updateStoredUser } from '../../api/authStore';
import { seedSessionCache } from '../../api/sessionCache';

export class ApiProfileAdapter implements UserProfilePort {
  async get(): Promise<UserProfile | null> {
    return getStoredUser();
  }

  async save(profile: UserProfile): Promise<void> {
    const updated = await apiRequest<UserProfile>('/users/me', {
      method: 'PATCH',
      body: {
        name: profile.name,
        birthDate: profile.birthDate,
        phone: profile.phone,
        country: profile.country,
        preferredVersionId: profile.preferredVersionId,
        notificationsEnabled: profile.notificationsEnabled,
        voiceEnabled: profile.voiceEnabled,
        reminderHour: profile.reminderHour,
        reminderMinute: profile.reminderMinute,
      },
    });
    await updateStoredUser(updated);
    seedSessionCache(updated);
  }
}
