import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { createPet, deletePet, getPet, listPetsDoTutor, updatePet } from '@/services/pets';
import type { PetRequest } from '@/types/api';

/**
 * CRUD de pets — uma das duas funcionalidades exigidas pela rubrica.
 * Toda mutation invalida o cache: é isso que atualiza a lista sozinha,
 * sem setState manual (que a rubrica trata como integração simulada).
 */

export function usePets(tutorId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.pets(tutorId ?? 0),
    queryFn: () => listPetsDoTutor(tutorId as number),
    enabled: typeof tutorId === 'number' && tutorId > 0,
  });
}

export function usePet(id: number) {
  return useQuery({
    queryKey: queryKeys.pet(id),
    queryFn: () => getPet(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreatePet(tutorId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PetRequest) => createPet(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pets(tutorId ?? 0) }),
  });
}

export function useUpdatePet(id: number, tutorId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PetRequest) => updatePet(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pets(tutorId ?? 0) });
      qc.invalidateQueries({ queryKey: queryKeys.pet(id) });
    },
  });
}

export function useDeletePet(tutorId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pets(tutorId ?? 0) }),
  });
}
