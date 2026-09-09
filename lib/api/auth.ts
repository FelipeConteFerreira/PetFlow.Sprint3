import type { LoginRequest, LoginResponse } from '@/types/api';

import { saveAuthSession } from './auth-storage';
import { apiRequest } from './client';

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: request,
    auth: false,
  });
  await saveAuthSession(response);
  return response;
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    });
  } catch {
    /* ignora falha de rede no logout */
  }
}
