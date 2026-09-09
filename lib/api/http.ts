import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants/api';
import type { LoginResponse } from '@/types/api';

import { getAuthSession, getAccessToken, saveAuthSession } from './auth-storage';
import { ApiError, throwIfNotOk } from './errors';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  /** uso interno: evita repetir o refresh em looping */
  _retry?: boolean;
};

/**
 * Chamado quando a sessão não pode mais ser renovada.
 * O AuthContext registra aqui o logout, para que a expiração do JWT
 * (15 min) derrube o usuário em qualquer tela.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/** Uma renovação por vez, mesmo que várias telas tomem 401 ao mesmo tempo. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const session = await getAuthSession();
  if (!session?.refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!res.ok) return null;

    const renovada = (await res.json()) as LoginResponse;
    await saveAuthSession(renovada);
    return renovada.accessToken;
  } catch {
    return null;
  }
}

function ensureRefresh(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export function buildQuery(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = true, _retry = false }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // Token expirado: renova uma vez e repete a requisição original.
    if (res.status === 401 && auth && !_retry) {
      const novoToken = await ensureRefresh();
      if (novoToken) {
        clearTimeout(timeout);
        return apiRequest<T>(path, { method, body, auth, _retry: true });
      }
      onUnauthorized?.();
      throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
    }

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
    if (timedOut) {
      throw new Error(
        'A API não respondeu a tempo. O servidor pode estar iniciando — tente de novo em alguns segundos.'
      );
    }
    if (err instanceof TypeError) {
      throw new Error('Sem conexão com a API. Verifique a internet ou o endereço do servidor.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
