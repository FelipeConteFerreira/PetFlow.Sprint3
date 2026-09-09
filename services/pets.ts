import { apiRequest, buildQuery } from '@/lib/api/http';
import type { PageParams, PetRequest, PetResponse, SpringPage } from '@/types/api';

/** Pets do tutor logado — é esta a lista que a tela "Meus pets" mostra. */
export async function listPetsDoTutor(
  tutorId: number,
  page: PageParams = {}
): Promise<PetResponse[]> {
  const result = await apiRequest<SpringPage<PetResponse>>(
    `/pets/tutor/${tutorId}${buildQuery({ page: page.page ?? 0, size: page.size ?? 50 })}`
  );
  return result.content ?? [];
}

export async function listPets(page: PageParams = {}): Promise<PetResponse[]> {
  const result = await apiRequest<SpringPage<PetResponse>>(
    `/pets${buildQuery({ page: page.page ?? 0, size: page.size ?? 50 })}`
  );
  return result.content ?? [];
}

export function getPet(id: number): Promise<PetResponse> {
  return apiRequest<PetResponse>(`/pets/${id}`);
}

export function createPet(data: PetRequest): Promise<PetResponse> {
  return apiRequest<PetResponse>('/pets', { method: 'POST', body: data });
}

export function updatePet(id: number, data: PetRequest): Promise<PetResponse> {
  return apiRequest<PetResponse>(`/pets/${id}`, { method: 'PUT', body: data });
}

export function deletePet(id: number): Promise<void> {
  return apiRequest<void>(`/pets/${id}`, { method: 'DELETE' });
}
