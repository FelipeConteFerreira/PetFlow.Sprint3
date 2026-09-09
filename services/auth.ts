import { apiRequest } from '@/lib/api/http';
import type { LoginRequest, LoginResponse } from '@/types/api';

/** HTTP puro. Sem React, sem estado, sem AsyncStorage. */
export function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    });
  } catch {
    /* o logout local acontece de qualquer forma */
  }
}
