import { env } from '../config/env';
import { getToken } from './authStore';

const REQUEST_TIMEOUT_MS = 25_000;

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
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

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'El servidor tardó demasiado en responder. Si usas Render gratis, espera unos segundos e intenta de nuevo.',
        0,
      );
    }
    throw new ApiError(
      `No hay conexión con el servidor (${env.apiUrl}). Revisa tu internet o EXPO_PUBLIC_API_URL en .env`,
      0,
    );
  } finally {
    clearTimeout(timer);
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

  const res = await fetchWithTimeout(
    `${env.apiUrl}${path}`,
    {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    },
    options.timeoutMs ?? REQUEST_TIMEOUT_MS,
  );

  const json = await res.json().catch(() => ({}));

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
