import type { UserProfile, UserRole } from '../../domain/entities/UserProfile';
import { getStoredUser } from './authStore';
import { fetchCurrentUser } from './sessionCache';

export type RequiredRole = UserRole | 'ANY';

function roleAllowed(user: UserProfile, requiredRole: RequiredRole): boolean {
  if (requiredRole === 'ANY') return true;
  if (requiredRole === 'USER') return user.role === 'USER' || user.role === 'ADMIN';
  return user.role === requiredRole;
}

/** Verifica token y rol. Usa caché para evitar /auth/me en cada pantalla. */
export async function verifySession(requiredRole: RequiredRole): Promise<UserProfile | null> {
  const user = await fetchCurrentUser();
  if (!user) return null;
  if (!roleAllowed(user, requiredRole)) return null;
  return user;
}

/** Lectura rápida local para mostrar la UI sin esperar red. */
export async function getLocalSession(requiredRole: RequiredRole): Promise<UserProfile | null> {
  const stored = await getStoredUser();
  if (!stored) return null;
  if (!roleAllowed(stored, requiredRole)) return null;
  return stored;
}
