import { api } from '@/lib/api/http';
import type { LoginRequest, LoginResponse } from '@/types/api';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload, { skipAuth: true });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await api.post('/auth/logout', { refreshToken }, { skipAuth: true });
  } catch {
    /* o logout local acontece de qualquer forma */
  }
}
