import axios from 'axios';

import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants/api';
import type { LoginResponse } from '@/types/api';

import { getAccessToken, getAuthSession, saveAuthSession } from './auth-storage';
import { ApiError, toApiError } from './errors';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Rota pública: não envia o token e não tenta renová-lo num 401. */
    skipAuth?: boolean;
    /** Uso interno: marca a requisição já repetida após renovar o token. */
    _retry?: boolean;
  }
}

const configBase = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
};

/**
 * Instância única do Axios — todo o tráfego HTTP do app passa por ela.
 *
 * O token entra num interceptor de requisição e a renovação do token num
 * interceptor de resposta, então nenhum service nem tela sabe que isso existe.
 */
export const api = axios.create(configBase);

/**
 * Cliente sem interceptors, só para `/auth/refresh`. Se a renovação passasse
 * por `api`, um 401 dela mesma dispararia outra renovação, em looping.
 */
const refreshClient = axios.create(configBase);

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
    const { data } = await refreshClient.post<LoginResponse>('/auth/refresh', {
      refreshToken: session.refreshToken,
    });
    await saveAuthSession(data);
    return data.accessToken;
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

api.interceptors.request.use(async (config) => {
  if (!config.skipAuth) {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error;

    const { config } = error;
    const expirou = error.response?.status === 401 && config && !config.skipAuth;

    if (expirou) {
      // Token expirado: renova uma vez e repete a requisição original.
      if (!config._retry) {
        const novoToken = await ensureRefresh();
        if (novoToken) {
          config._retry = true;
          return api.request(config);
        }
      }
      onUnauthorized?.();
      throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
    }

    throw toApiError(error);
  }
);
