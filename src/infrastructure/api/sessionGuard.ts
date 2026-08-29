import type { UserProfile, UserRole } from '../../domain/entities/UserProfile';
import { apiRequest } from './apiClient';
import { clearSession, getToken, updateStoredUser } from './authStore';

export type RequiredRole = UserRole | 'ANY';

/** Verifica token, sesión remota y rol. */
export async function verifySession(requiredRole: RequiredRole): Promise<UserProfile | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const user = await apiRequest<UserProfile>('/auth/me');
    if (requiredRole !== 'ANY') {
      const allowed =
        requiredRole === 'USER'
          ? user.role === 'USER' || user.role === 'ADMIN'
          : user.role === requiredRole;
      if (!allowed) {
        await clearSession();
        return null;
      }
    }
    await updateStoredUser(user);
    return user;
  } catch {
    await clearSession();
    return null;
  }
}
