import { apiRequest } from '@/lib/api/http';
import type { TutorRequest, TutorResponse } from '@/types/api';

export function registerTutor(data: TutorRequest): Promise<TutorResponse> {
  return apiRequest<TutorResponse>('/tutores', { method: 'POST', body: data, auth: false });
}

export function getTutor(id: number): Promise<TutorResponse> {
  return apiRequest<TutorResponse>(`/tutores/${id}`);
}

export function updateTutor(id: number, data: TutorRequest): Promise<TutorResponse> {
  return apiRequest<TutorResponse>(`/tutores/${id}`, { method: 'PUT', body: data });
}

export function deleteTutor(id: number): Promise<void> {
  return apiRequest<void>(`/tutores/${id}`, { method: 'DELETE' });
}
