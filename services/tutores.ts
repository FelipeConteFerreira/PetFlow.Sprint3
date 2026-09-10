import { apiRequest } from '@/lib/api/http';
import type { TutorRequest, TutorResponse } from '@/types/api';

/**
 * O tutor autenticado, e o cadastro de um novo.
 *
 * `GET /api/tutores/{id}`, `PUT` e `DELETE` ficaram de fora: são a API de
 * gestão da clínica e respondem 403 para um token de tutor. O aplicativo lê o
 * próprio cadastro em `/api/tutor/me`, onde não há id a informar.
 */

/** Cadastro público. Exige `clinicaId`: o tutor se cadastra em uma clínica. */
export function registerTutor(data: TutorRequest): Promise<TutorResponse> {
  return apiRequest<TutorResponse>('/tutores', { method: 'POST', body: data, auth: false });
}

export function getTutorMe(): Promise<TutorResponse> {
  return apiRequest<TutorResponse>('/tutor/me');
}
