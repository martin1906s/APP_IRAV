import type { UserProfile, UserRole } from '../../domain/entities/UserProfile';
import { getStoredUser } from './authStore';

export type RequiredRole = UserRole | 'ANY';

function roleAllowed(user: UserProfile, requiredRole: RequiredRole): boolean {
  if (requiredRole === 'ANY') return true;
  if (requiredRole === 'USER') return user.role === 'USER' || user.role === 'ADMIN';
  return user.role === requiredRole;
}

/** Solo lee la sesión guardada en el login. No llama a la API. */
export async function getLocalSession(requiredRole: RequiredRole): Promise<UserProfile | null> {
  const stored = await getStoredUser();
  if (!stored) return null;
  if (!roleAllowed(stored, requiredRole)) return null;
  return stored;
}
