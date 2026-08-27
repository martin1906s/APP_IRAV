export type UserProfile = {
  name: string;
  age: number;
  country: string;
  preferredVersionId: string;
  notificationsEnabled: boolean;
  voiceEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

export const DEFAULT_PROFILE: Omit<UserProfile, 'name' | 'age' | 'country'> = {
  preferredVersionId: 'NVI',
  notificationsEnabled: true,
  voiceEnabled: true,
  reminderHour: 8,
  reminderMinute: 0,
};
