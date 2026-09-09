import { apiRequest } from '@/lib/api/http';
import type { PetApi, PetRequest, SpringPage } from '@/types/api';

/** A API Java devolve Page do Spring nas listagens; a tela só quer o array. */
export async function listPets(page = 0, size = 50): Promise<PetApi[]> {
  const result = await apiRequest<SpringPage<PetApi> | PetApi[]>(`/pets?page=${page}&size=${size}`);
  return Array.isArray(result) ? result : (result.content ?? []);
}

export function getPet(id: number): Promise<PetApi> {
  return apiRequest<PetApi>(`/pets/${id}`);
}

export function createPet(data: PetRequest): Promise<PetApi> {
  return apiRequest<PetApi>('/pets', { method: 'POST', body: data });
}

export function updatePet(id: number, data: PetRequest): Promise<PetApi> {
  return apiRequest<PetApi>(`/pets/${id}`, { method: 'PUT', body: data });
}

export function deletePet(id: number): Promise<void> {
  return apiRequest<void>(`/pets/${id}`, { method: 'DELETE' });
}
