import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { listClinicas, listEspecies, listRacas, listVeterinarios } from '@/services/catalogo';

/** Listas de apoio dos formulários — todas vindas da API, nada fixo no código. */

export function useEspecies() {
  return useQuery({ queryKey: queryKeys.especies, queryFn: listEspecies, staleTime: 5 * 60_000 });
}

export function useRacas(especieId?: number) {
  return useQuery({
    queryKey: queryKeys.racas(especieId),
    queryFn: () => listRacas(especieId),
    staleTime: 5 * 60_000,
  });
}

export function useClinicas() {
  return useQuery({ queryKey: queryKeys.clinicas, queryFn: listClinicas, staleTime: 5 * 60_000 });
}

export function useVeterinarios(clinicaId?: number) {
  return useQuery({
    queryKey: queryKeys.veterinarios(clinicaId),
    queryFn: () => listVeterinarios(clinicaId),
    staleTime: 5 * 60_000,
  });
}
