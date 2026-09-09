import type { SpringPage, VeterinarioApi, VeterinarioRegisterRequest } from '@/types/api';

import { apiRequest } from './client';

export async function registerVeterinario(
  data: VeterinarioRegisterRequest
): Promise<VeterinarioApi> {
  return apiRequest<VeterinarioApi>('/veterinarios', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export async function listVeterinarios(page = 0, size = 50): Promise<VeterinarioApi[]> {
  const result = await apiRequest<SpringPage<VeterinarioApi>>(
    `/veterinarios?page=${page}&size=${size}`
  );
  return result.content ?? [];
}
