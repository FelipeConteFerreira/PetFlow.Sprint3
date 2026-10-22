import { api } from '@/lib/api/http';
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
  const { data } = await api.get<SpringPage<PetResponse>>('/tutor/pets', {
    params: { page: page.page ?? 0, size: page.size ?? TAMANHO_PAGINA },
  });
  return data.content ?? [];
}

export async function getPet(id: number): Promise<PetResponse> {
  const { data } = await api.get<PetResponse>(`/tutor/pets/${id}`);
  return data;
}

export async function createPet(payload: PetDoTutorRequest): Promise<PetResponse> {
  const { data } = await api.post<PetResponse>('/tutor/pets', payload);
  return data;
}

export async function updatePet(id: number, payload: PetDoTutorRequest): Promise<PetResponse> {
  const { data } = await api.put<PetResponse>(`/tutor/pets/${id}`, payload);
  return data;
}

/** DELETE aqui é inativação: o pet sai das listas do tutor e o histórico fica. */
export async function deletePet(id: number): Promise<void> {
  await api.delete(`/tutor/pets/${id}`);
}

export async function getFichaTecnica(id: number): Promise<PetFichaTecnicaResponse> {
  const { data } = await api.get<PetFichaTecnicaResponse>(`/tutor/pets/${id}/ficha-tecnica`);
  return data;
}

export async function listConsultasDoPet(
  id: number,
  page: PageParams = {}
): Promise<ConsultaResponse[]> {
  const { data } = await api.get<SpringPage<ConsultaResponse>>(`/tutor/pets/${id}/consultas`, {
    params: { page: page.page ?? 0, size: page.size ?? TAMANHO_PAGINA },
  });
  return data.content ?? [];
}

export async function listVacinasDoPet(
  id: number,
  page: PageParams = {}
): Promise<AplicacaoVacinaResponse[]> {
  const { data } = await api.get<SpringPage<AplicacaoVacinaResponse>>(`/tutor/pets/${id}/vacinas`, {
    params: { page: page.page ?? 0, size: page.size ?? TAMANHO_PAGINA },
  });
  return data.content ?? [];
}
