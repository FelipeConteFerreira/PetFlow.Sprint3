import { apiRequest, buildQuery } from '@/lib/api/http';
import type {
  AplicacaoVacinaResponse,
  ConsultaResponse,
  PageParams,
  PetDoTutorRequest,
  PetFichaTecnicaResponse,
  PetResponse,
  SpringPage,
} from '@/types/api';

/**
 * Pets na superfície do aplicativo: `/api/tutor/pets`.
 *
 * Nenhuma função daqui recebe `tutorId`. O dono sai do token — era o id na
 * URL de `/api/pets/tutor/{id}` que deixava um tutor ler os animais de outro
 * trocando o número, e é por isso que a superfície do tutor existe.
 *
 * Recurso de outro tutor responde 404, e não 403: quem não é dono não precisa
 * saber a diferença entre "não existe" e "não é seu".
 */

/** Uma página generosa: o tutor típico tem poucos pets, não vale paginar na tela. */
const TAMANHO_PAGINA = 100;

export async function listPets(page: PageParams = {}): Promise<PetResponse[]> {
  const result = await apiRequest<SpringPage<PetResponse>>(
    `/tutor/pets${buildQuery({ page: page.page ?? 0, size: page.size ?? TAMANHO_PAGINA })}`
  );
  return result.content ?? [];
}

export function getPet(id: number): Promise<PetResponse> {
  return apiRequest<PetResponse>(`/tutor/pets/${id}`);
}

export function createPet(data: PetDoTutorRequest): Promise<PetResponse> {
  return apiRequest<PetResponse>('/tutor/pets', { method: 'POST', body: data });
}

export function updatePet(id: number, data: PetDoTutorRequest): Promise<PetResponse> {
  return apiRequest<PetResponse>(`/tutor/pets/${id}`, { method: 'PUT', body: data });
}

/** DELETE aqui é inativação: o pet sai das listas do tutor e o histórico fica. */
export function deletePet(id: number): Promise<void> {
  return apiRequest<void>(`/tutor/pets/${id}`, { method: 'DELETE' });
}

export function getFichaTecnica(id: number): Promise<PetFichaTecnicaResponse> {
  return apiRequest<PetFichaTecnicaResponse>(`/tutor/pets/${id}/ficha-tecnica`);
}

export async function listConsultasDoPet(
  id: number,
  page: PageParams = {}
): Promise<ConsultaResponse[]> {
  const result = await apiRequest<SpringPage<ConsultaResponse>>(
    `/tutor/pets/${id}/consultas${buildQuery({
      page: page.page ?? 0,
      size: page.size ?? TAMANHO_PAGINA,
    })}`
  );
  return result.content ?? [];
}

export async function listVacinasDoPet(
  id: number,
  page: PageParams = {}
): Promise<AplicacaoVacinaResponse[]> {
  const result = await apiRequest<SpringPage<AplicacaoVacinaResponse>>(
    `/tutor/pets/${id}/vacinas${buildQuery({
      page: page.page ?? 0,
      size: page.size ?? TAMANHO_PAGINA,
    })}`
  );
  return result.content ?? [];
}
