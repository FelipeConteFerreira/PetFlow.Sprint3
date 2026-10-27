import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificarConsultaCancelada, notificarConsultaMarcada } from '@/lib/notificacoes';
import { queryKeys } from '@/lib/query-client';
import {
  cancelarAgendamento,
  createAgendamento,
  getAgendamento,
  listAgendamentos,
  updateAgendamento,
} from '@/services/agendamentos';
import type { AgendamentoRequest } from '@/types/api';

/**
 * CRUD de agendamentos — a segunda funcionalidade completa do aplicativo.
 *
 * `useAgendamentos` não recebe mais a lista de pets para filtrar no cliente:
 * a API devolve só a agenda dos pets do tutor autenticado.
 *
 * As escritas avisam o módulo de notificações *antes* de invalidar o cache:
 * assim a sincronização que vem com o refetch já conhece a mudança feita pelo
 * tutor e não a confunde com uma ação da clínica. Falha de notificação nunca
 * derruba a escrita — a consulta foi marcada do mesmo jeito.
 */

const semFalhar = (tarefa: Promise<void>) => tarefa.catch(() => undefined);

export function useAgendamentos() {
  return useQuery({
    queryKey: queryKeys.agendamentos,
    queryFn: () => listAgendamentos(),
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
    onSuccess: async (agendamento) => {
      await semFalhar(notificarConsultaMarcada(agendamento, false));
      await qc.invalidateQueries({ queryKey: queryKeys.agendamentos });
    },
  });
}

/** Remarcação. */
export function useUpdateAgendamento(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AgendamentoRequest) => updateAgendamento(id, data),
    onSuccess: async (agendamento) => {
      await semFalhar(notificarConsultaMarcada(agendamento, true));
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.agendamentos }),
        qc.invalidateQueries({ queryKey: queryKeys.agendamento(id) }),
      ]);
    },
  });
}

/**
 * Cancelamento. O DELETE da API muda o status para CANCELADO em vez de apagar,
 * então o item continua na lista — com outra cara.
 */
export function useCancelarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarAgendamento(id),
    onSuccess: async (_, id) => {
      await semFalhar(notificarConsultaCancelada(id));
      await qc.invalidateQueries({ queryKey: queryKeys.agendamentos });
    },
  });
}
