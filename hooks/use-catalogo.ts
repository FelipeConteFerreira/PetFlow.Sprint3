import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import {
  listClinicasPublicas,
  listEspecies,
  listRacas,
  listVeterinarios,
} from '@/services/catalogo';

/**
 * Listas de apoio dos formulários — todas vindas da API, nada fixo no código.
 *
 * `staleTime` alto: catálogo clínico muda com pouca frequência e não vale uma
 * chamada nova a cada vez que o formulário abre.
 */

const CINCO_MINUTOS = 5 * 60_000;

export function useEspecies() {
  return useQuery({
    queryKey: queryKeys.especies,
    queryFn: listEspecies,
    staleTime: CINCO_MINUTOS,
  });
}

export function useRacas(especieId?: number) {
  return useQuery({
    queryKey: queryKeys.racas(especieId),
    queryFn: () => listRacas(especieId),
    staleTime: CINCO_MINUTOS,
  });
}

export function useVeterinarios() {
  return useQuery({
    queryKey: queryKeys.veterinarios,
    queryFn: listVeterinarios,
    staleTime: CINCO_MINUTOS,
  });
}

/** Usada na tela de cadastro, antes de existir sessão. */
export function useClinicasPublicas() {
  return useQuery({
    queryKey: queryKeys.clinicasPublicas,
    queryFn: listClinicasPublicas,
    staleTime: CINCO_MINUTOS,
  });
}
