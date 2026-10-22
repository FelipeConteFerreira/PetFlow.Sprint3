import { api } from '@/lib/api/http';
import type {
  ClinicaPublicaResponse,
  EspecieResponse,
  RacaResponse,
  SpringPage,
  VeterinarioResponse,
} from '@/types/api';

/**
 * As listas que alimentam os selects dos formulários.
 *
 * Espécie, raça e veterinário são catálogo clínico: o CRUD deles é da equipe
 * da clínica e responde 403 para um token de tutor. O que o aplicativo alcança
 * é `/api/tutor/catalogo/**`, somente leitura — escolher dentro do catálogo
 * não é o mesmo que editá-lo.
 *
 * Nada aqui é lista fixa no código: raça nova cadastrada pela clínica aparece
 * no formulário sem versão nova do aplicativo.
 */

const TAMANHO_CATALOGO = 200;

export async function listEspecies(): Promise<EspecieResponse[]> {
  const { data } = await api.get<SpringPage<EspecieResponse>>('/tutor/catalogo/especies', {
    params: { size: TAMANHO_CATALOGO },
  });
  return data.content ?? [];
}

export async function listRacas(especieId?: number): Promise<RacaResponse[]> {
  const { data } = await api.get<SpringPage<RacaResponse>>('/tutor/catalogo/racas', {
    params: { especieId, size: 500 },
  });
  return data.content ?? [];
}

/** Os veterinários da clínica do próprio tutor — a clínica sai do token. */
export async function listVeterinarios(): Promise<VeterinarioResponse[]> {
  const { data } = await api.get<SpringPage<VeterinarioResponse>>(
    '/tutor/catalogo/veterinarios',
    { params: { size: TAMANHO_CATALOGO } }
  );
  return data.content ?? [];
}

/**
 * A única leitura da API que não pede token.
 *
 * `POST /api/tutores` exige `clinicaId` e quem está se cadastrando ainda não
 * tem token para descobrir esse número. A projeção é reduzida de propósito:
 * id, nome e cidade, sem CNPJ nem contato.
 */
export async function listClinicasPublicas(): Promise<ClinicaPublicaResponse[]> {
  const { data } = await api.get<SpringPage<ClinicaPublicaResponse>>('/clinicas/publicas', {
    params: { size: TAMANHO_CATALOGO },
    skipAuth: true,
  });
  return data.content ?? [];
}
