import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import {
  createPet,
  deletePet,
  getFichaTecnica,
  getPet,
  listConsultasDoPet,
  listPets,
  listVacinasDoPet,
  updatePet,
} from '@/services/pets';
import type { PetDoTutorRequest } from '@/types/api';

/**
 * CRUD de pets — uma das duas funcionalidades completas do aplicativo.
 *
 * Toda mutation invalida a chave da lista, e é isso que atualiza a tela depois
 * de uma escrita. Nenhum `setState` guardando lista do servidor, nenhum
 * `useFocusEffect` recarregando na mão.
 *
 * `usePets` não recebe `tutorId`: a API devolve os pets do token.
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
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function usePetFichaTecnica(id: number) {
  return useQuery({
    queryKey: queryKeys.petFicha(id),
    queryFn: () => getFichaTecnica(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useConsultasDoPet(id: number) {
  return useQuery({
    queryKey: queryKeys.petConsultas(id),
    queryFn: () => listConsultasDoPet(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useVacinasDoPet(id: number) {
  return useQuery({
    queryKey: queryKeys.petVacinas(id),
    queryFn: () => listVacinasDoPet(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreatePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PetDoTutorRequest) => createPet(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pets }),
  });
}

export function useUpdatePet(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PetDoTutorRequest) => updatePet(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pets });
      qc.invalidateQueries({ queryKey: queryKeys.pet(id) });
      qc.invalidateQueries({ queryKey: queryKeys.petFicha(id) });
    },
  });
}

/**
 * Remover um pet também mexe na agenda: os agendamentos dele somem da lista
 * do tutor junto. Sem invalidar as duas chaves, a tela de agendamentos
 * continuaria mostrando consulta de um pet que não está mais lá.
 */
export function useDeletePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePet(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pets });
      qc.invalidateQueries({ queryKey: queryKeys.agendamentos });
    },
  });
}
