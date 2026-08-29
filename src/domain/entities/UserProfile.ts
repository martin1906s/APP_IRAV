export type DocumentType = 'CEDULA' | 'PASSPORT';
export type UserRole = 'USER' | 'ADMIN';

export type UserProfile = {
  id?: string;
  documentType: DocumentType;
  documentId: string;
  name: string;
  birthDate: string;
  phone: string;
  country: string;
  role?: UserRole;
  preferredVersionId: string;
  notificationsEnabled: boolean;
  voiceEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

export const DEFAULT_PROFILE: Omit<
  UserProfile,
  'name' | 'birthDate' | 'phone' | 'country' | 'documentType' | 'documentId'
> = {
  preferredVersionId: 'NVI',
  notificationsEnabled: true,
  voiceEnabled: true,
  reminderHour: 8,
  reminderMinute: 0,
};

export function preferredVersionByBirthDate(birthDate: string): string {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  if (age <= 13) return 'PDT';
  if (age <= 17) return 'NTV';
  if (age <= 25) return 'NVI';
  return 'RV1960';
}
