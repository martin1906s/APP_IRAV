import type { UserProfilePort } from '../../domain/ports/UserProfilePort';
import type { UserProfile } from '../../domain/entities/UserProfile';

export class GetUserProfile {
  constructor(private readonly profiles: UserProfilePort) {}
  execute() {
    return this.profiles.get();
  }
}

export class SaveUserProfile {
  constructor(private readonly profiles: UserProfilePort) {}
  execute(profile: UserProfile) {
    return this.profiles.save(profile);
  }
}
