import { env } from '../config/env';
import { clearSession, getToken } from './authStore';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth !== false) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${env.apiUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    await clearSession();
  }

  if (!res.ok) {
    const message =
      typeof json.message === 'string'
        ? json.message
        : Array.isArray(json.message)
          ? json.message.join(', ')
          : 'Error de servidor';
    throw new ApiError(message, res.status);
  }

  return json as T;
}
