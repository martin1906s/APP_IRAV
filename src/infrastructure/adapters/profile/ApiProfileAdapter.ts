import type { UserProfile } from '../../../domain/entities/UserProfile';
import type { UserProfilePort } from '../../../domain/ports/UserProfilePort';
import { apiRequest } from '../../api/apiClient';
import { getStoredUser, updateStoredUser } from '../../api/authStore';

export class ApiProfileAdapter implements UserProfilePort {
  async get(): Promise<UserProfile | null> {
    const cached = await getStoredUser();
    try {
      const remote = await apiRequest<UserProfile>('/auth/me');
      await updateStoredUser(remote);
      return remote;
    } catch {
      return cached;
    }
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
  }
}
