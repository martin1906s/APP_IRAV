import type { UserProfile } from '../../domain/entities/UserProfile';

let cachedUser: UserProfile | null = null;

export function invalidateSessionCache() {
  cachedUser = null;
}

export function peekCachedUser(): UserProfile | null {
  return cachedUser;
}

export function seedSessionCache(user: UserProfile) {
  cachedUser = user;
}
