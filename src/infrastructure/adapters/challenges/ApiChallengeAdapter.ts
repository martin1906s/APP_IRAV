import type { ChallengeStatus } from '../../../domain/entities/Challenge';
import { apiRequest } from '../../api/apiClient';

export class ApiChallengeAdapter {
  getStatus(): Promise<ChallengeStatus> {
    return apiRequest<ChallengeStatus>('/challenges');
  }

  start(): Promise<ChallengeStatus> {
    return apiRequest<ChallengeStatus>('/challenges/start', { method: 'POST' });
  }

  completeToday(): Promise<ChallengeStatus> {
    return apiRequest<ChallengeStatus>('/challenges/complete', { method: 'POST' });
  }
}
