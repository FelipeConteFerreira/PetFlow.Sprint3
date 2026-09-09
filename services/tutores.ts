import { apiRequest } from '@/lib/api/http';
import type { TutorApi, TutorRegisterRequest, TutorUpdateRequest } from '@/types/api';

export function registerTutor(data: TutorRegisterRequest): Promise<TutorApi> {
  return apiRequest<TutorApi>('/tutores', { method: 'POST', body: data, auth: false });
}

export function getTutor(id: number): Promise<TutorApi> {
  return apiRequest<TutorApi>(`/tutores/${id}`);
}

export function updateTutor(id: number, data: TutorUpdateRequest): Promise<TutorApi> {
  return apiRequest<TutorApi>(`/tutores/${id}`, { method: 'PUT', body: data });
}

export function deleteTutor(id: number): Promise<void> {
  return apiRequest<void>(`/tutores/${id}`, { method: 'DELETE' });
}
