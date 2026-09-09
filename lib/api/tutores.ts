import type { TutorApi, TutorRegisterRequest } from '@/types/api';

import { apiRequest } from './client';

export async function registerTutor(data: TutorRegisterRequest): Promise<TutorApi> {
  return apiRequest<TutorApi>('/tutores', {
    method: 'POST',
    body: { ...data, canalPreferencial: data.canalPreferencial ?? 'APP' },
    auth: false,
  });
}
