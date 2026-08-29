import { apiRequest } from '../../api/apiClient';

export type AppConfig = {
  dailyMoodRequired: boolean;
  defaultBibleVersion: string;
};

export class ApiConfigAdapter {
  get() {
    return apiRequest<AppConfig>('/config');
  }
}
