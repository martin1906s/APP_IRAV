import type { UserProfile } from '../entities/UserProfile';

/** Puerto: perfil local del joven */
export interface UserProfilePort {
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}
