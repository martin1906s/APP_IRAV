import { apiRequest } from '../../api/apiClient';

export type Announcement = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  sentAt: string | null;
  recipientsCount: number;
  createdAt: string;
  updatedAt: string;
};

export class ApiAnnouncementsAdapter {
  list() {
    return apiRequest<Announcement[]>('/announcements');
  }

  get(id: string) {
    return apiRequest<Announcement>(`/announcements/${id}`);
  }
}
