import { apiRequest, buildQuery } from '@/lib/api/http';
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
  const r = await apiRequest<SpringPage<EspecieResponse>>(
    `/tutor/catalogo/especies${buildQuery({ size: TAMANHO_CATALOGO })}`
  );
  return r.content ?? [];
}

export async function listRacas(especieId?: number): Promise<RacaResponse[]> {
  const r = await apiRequest<SpringPage<RacaResponse>>(
    `/tutor/catalogo/racas${buildQuery({ especieId, size: 500 })}`
  );
  return r.content ?? [];
}

/** Os veterinários da clínica do próprio tutor — a clínica sai do token. */
export async function listVeterinarios(): Promise<VeterinarioResponse[]> {
  const r = await apiRequest<SpringPage<VeterinarioResponse>>(
    `/tutor/catalogo/veterinarios${buildQuery({ size: TAMANHO_CATALOGO })}`
  );
  return r.content ?? [];
}

/**
 * A única leitura da API que não pede token.
 *
 * `POST /api/tutores` exige `clinicaId` e quem está se cadastrando ainda não
 * tem token para descobrir esse número. A projeção é reduzida de propósito:
 * id, nome e cidade, sem CNPJ nem contato.
 */
export async function listClinicasPublicas(): Promise<ClinicaPublicaResponse[]> {
  const r = await apiRequest<SpringPage<ClinicaPublicaResponse>>(
    `/clinicas/publicas${buildQuery({ size: TAMANHO_CATALOGO })}`,
    { auth: false }
  );
  return r.content ?? [];
}
