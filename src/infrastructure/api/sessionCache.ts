import type { UserProfile } from '../../domain/entities/UserProfile';
import { apiRequest, ApiError } from './apiClient';
import { clearSession, getStoredUser, updateStoredUser } from './authStore';

const TTL_MS = 2 * 60_000;

let cachedUser: UserProfile | null = null;
let cacheExpiry = 0;
let inflight: Promise<UserProfile | null> | null = null;

export function invalidateSessionCache() {
  cachedUser = null;
  cacheExpiry = 0;
  inflight = null;
}

/** Perfil actual con caché en memoria y deduplicación de peticiones simultáneas. */
export async function fetchCurrentUser(force = false): Promise<UserProfile | null> {
  const now = Date.now();
  if (!force && cachedUser && now < cacheExpiry) {
    return cachedUser;
  }

  if (!force && inflight) {
    return inflight;
  }

  inflight = (async () => {
    const stored = await getStoredUser();
    try {
      const remote = await apiRequest<UserProfile>('/auth/me');
      cachedUser = remote;
      cacheExpiry = Date.now() + TTL_MS;
      await updateStoredUser(remote);
      return remote;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        invalidateSessionCache();
        await clearSession();
        return null;
      }
      if (stored) {
        cachedUser = stored;
        cacheExpiry = Date.now() + TTL_MS;
        return stored;
      }
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function peekCachedUser(): UserProfile | null {
  if (cachedUser && Date.now() < cacheExpiry) return cachedUser;
  return null;
}

export function seedSessionCache(user: UserProfile) {
  cachedUser = user;
  cacheExpiry = Date.now() + TTL_MS;
}
