import { api } from '@/lib/api/http';
import type {
  AgendamentoRequest,
  AgendamentoResponse,
  PageParams,
  SpringPage,
} from '@/types/api';

/**
 * Agendamentos na superfície do aplicativo: `/api/tutor/agendamentos`.
 *
 * A lista já vem filtrada pelos pets do tutor autenticado — não há mais o
 * filtro no cliente que a versão anterior fazia depois de baixar a agenda
 * inteira da clínica.
 *
 * Não existe PATCH de status aqui: cancelar é o DELETE, que a API traduz em
 * mudança de status e não em remoção.
 */

const TAMANHO_PAGINA = 100;

export async function listAgendamentos(page: PageParams = {}): Promise<AgendamentoResponse[]> {
  const { data } = await api.get<SpringPage<AgendamentoResponse>>('/tutor/agendamentos', {
    params: { page: page.page ?? 0, size: page.size ?? TAMANHO_PAGINA },
  });
  return data.content ?? [];
}

export async function getAgendamento(id: number): Promise<AgendamentoResponse> {
  const { data } = await api.get<AgendamentoResponse>(`/tutor/agendamentos/${id}`);
  return data;
}

/** O `petId` é conferido contra os pets do tutor: pet de outro dono dá 404. */
export async function createAgendamento(
  payload: AgendamentoRequest
): Promise<AgendamentoResponse> {
  const { data } = await api.post<AgendamentoResponse>('/tutor/agendamentos', payload);
  return data;
}

/** Remarcação: mesma consulta, nova data e hora. */
export async function updateAgendamento(
  id: number,
  payload: AgendamentoRequest
): Promise<AgendamentoResponse> {
  const { data } = await api.put<AgendamentoResponse>(`/tutor/agendamentos/${id}`, payload);
  return data;
}

/** Cancelamento. A API muda o status para CANCELADO e responde 204. */
export async function cancelarAgendamento(id: number): Promise<void> {
  await api.delete(`/tutor/agendamentos/${id}`);
}
