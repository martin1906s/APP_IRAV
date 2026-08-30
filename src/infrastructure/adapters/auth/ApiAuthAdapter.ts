import type { UserProfile } from '../../../domain/entities/UserProfile';
import { apiRequest } from '../../api/apiClient';
import { saveSession, clearSession } from '../../api/authStore';
import { seedSessionCache } from '../../api/sessionCache';

type AuthResponse = {
  accessToken: string;
  user: UserProfile;
};

export class ApiAuthAdapter {
  async login(documentType: UserProfile['documentType'], documentId: string, password: string) {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { documentType, documentId, password },
      auth: false,
    });

    await saveSession(result.accessToken, result.user);
    seedSessionCache(result.user);
    return result;
  }

  async register(payload: {
    documentType: UserProfile['documentType'];
    documentId: string;
    password: string;
    name: string;
    birthDate: string;
    phone: string;
    country: string;
    preferredVersionId?: string;
  }) {
    const result = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    });

    await saveSession(result.accessToken, result.user);
    seedSessionCache(result.user);
    return result;
  }

  async me(): Promise<UserProfile | null> {
    try {
      return await apiRequest<UserProfile>('/auth/me');
    } catch {
      return null;
    }
  }

  async logout() {
    await clearSession();
  }
}
