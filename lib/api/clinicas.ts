import type { ClinicaApi, ClinicaRegisterRequest } from '@/types/api';

import { apiRequest } from './client';

export async function registerClinica(data: ClinicaRegisterRequest): Promise<ClinicaApi> {
  return apiRequest<ClinicaApi>('/clinicas', {
    method: 'POST',
    body: data,
    auth: false,
  });
}
