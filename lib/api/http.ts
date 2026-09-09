import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants/api';

import { getAccessToken } from './auth-storage';
import { ApiError, throwIfNotOk } from './errors';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

/**
 * Handler chamado quando a API responde 401.
 * O AuthContext registra o logout aqui para que a expiração do JWT
 * (15 min, conforme o documento mestre) derrube a sessão em qualquer tela.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (res.status === 401 && auth) {
      onUnauthorized?.();
      throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
    }

    await throwIfNotOk(res);

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('A API demorou para responder. Verifique se o servidor está no ar.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
