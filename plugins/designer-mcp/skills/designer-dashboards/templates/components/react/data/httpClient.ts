/**
 * Production-shaped typed HTTP client with mock/live seam (DATA_MODE=mock|live).
 * Typed HTTP client wrapper without forcing an extra HTTP dependency.
 */

export type DataMode = 'mock' | 'live';

export interface HttpRequestOptions<TBody = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function getDataMode(): DataMode {
  const mode =
    (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_DATA_MODE || process.env.DATA_MODE)) ||
    (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_DATA_MODE) ||
    'mock';
  return mode === 'live' ? 'live' : 'mock';
}

export function getApiBaseUrl(): string {
  return (
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ||
    '/api'
  );
}

let unauthorizedHandler: (() => void) | null = null;
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

export async function apiRequest<TResponse, TBody = unknown>(
  endpoint: string,
  options: HttpRequestOptions<TBody> = {},
): Promise<TResponse> {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${base}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (res.status === 401 || res.status === 419 || res.status === 440) {
    unauthorizedHandler?.();
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new HttpError(res.status, payload?.message || res.statusText || 'Request failed', payload);
  }

  return (await res.json()) as TResponse;
}
