import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import {
  alterarStatusAgendamento,
  createAgendamento,
  deleteAgendamento,
  getAgendamento,
  listAgendamentos,
  updateAgendamento,
} from '@/services/agendamentos';
import type { AgendamentoRequest, AgendamentoStatus, PetResponse } from '@/types/api';

/** CRUD de agendamentos — a segunda funcionalidade exigida pela rubrica. */

export function useAgendamentos(petsDoTutor?: PetResponse[]) {
  return useQuery({
    queryKey: queryKeys.agendamentos,
    queryFn: async () => {
      const todos = await listAgendamentos();
      if (!petsDoTutor) return todos;
      // A API não filtra por tutor; mostramos só os agendamentos dos pets dele.
      const meus = new Set(petsDoTutor.map((p) => p.id));
      return todos.filter((a) => meus.has(a.petId));
    },
  });
}

export function useAgendamento(id: number) {
  return useQuery({
    queryKey: queryKeys.agendamento(id),
    queryFn: () => getAgendamento(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AgendamentoRequest) => createAgendamento(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.agendamentos }),
  });
}

export function useUpdateAgendamento(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AgendamentoRequest) => updateAgendamento(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.agendamentos });
      qc.invalidateQueries({ queryKey: queryKeys.agendamento(id) });
    },
  });
}

export function useDeleteAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAgendamento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.agendamentos }),
  });
}

export function useCancelarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      alterarStatusAgendamento(id, 'CANCELADO' as AgendamentoStatus, motivo),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.agendamentos }),
  });
}
