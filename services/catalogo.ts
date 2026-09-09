import { apiRequest, buildQuery } from '@/lib/api/http';
import type {
  ClinicaResponse,
  EspecieResponse,
  RacaResponse,
  SpringPage,
  VeterinarioResponse,
} from '@/types/api';

/** Listas que alimentam os selects dos formulários. */

export async function listEspecies(): Promise<EspecieResponse[]> {
  const r = await apiRequest<SpringPage<EspecieResponse>>(`/especies${buildQuery({ size: 200 })}`);
  return r.content ?? [];
}

export async function listRacas(especieId?: number): Promise<RacaResponse[]> {
  const path = especieId ? `/racas/especie/${especieId}` : '/racas';
  const r = await apiRequest<SpringPage<RacaResponse>>(`${path}${buildQuery({ size: 500 })}`);
  return r.content ?? [];
}

export async function listClinicas(): Promise<ClinicaResponse[]> {
  const r = await apiRequest<SpringPage<ClinicaResponse>>(`/clinicas${buildQuery({ size: 200 })}`);
  return r.content ?? [];
}

export async function listVeterinarios(clinicaId?: number): Promise<VeterinarioResponse[]> {
  const path = clinicaId ? `/veterinarios/clinica/${clinicaId}` : '/veterinarios';
  const r = await apiRequest<SpringPage<VeterinarioResponse>>(`${path}${buildQuery({ size: 200 })}`);
  return r.content ?? [];
}
