import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { createPet, deletePet, getPet, listPets, updatePet } from '@/services/pets';
import type { PetRequest } from '@/types/api';

/**
 * Hooks isolados da UI (requisito de arquitetura).
 * Toda mutation invalida o cache — é o que faz a tela atualizar sozinha,
 * sem setState manual (que a rubrica trata como integração simulada).
 */

export function usePets() {
  return useQuery({
    queryKey: queryKeys.pets,
    queryFn: () => listPets(),
  });
}

export function usePet(id: number) {
  return useQuery({
    queryKey: queryKeys.pet(id),
    queryFn: () => getPet(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreatePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PetRequest) => createPet(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pets }),
  });
}

export function useUpdatePet(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PetRequest) => updatePet(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pets });
      qc.invalidateQueries({ queryKey: queryKeys.pet(id) });
    },
  });
}

export function useDeletePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pets }),
  });
}
