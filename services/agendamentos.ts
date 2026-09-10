import { apiRequest, buildQuery } from '@/lib/api/http';
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
  const result = await apiRequest<SpringPage<AgendamentoResponse>>(
    `/tutor/agendamentos${buildQuery({ page: page.page ?? 0, size: page.size ?? TAMANHO_PAGINA })}`
  );
  return result.content ?? [];
}

export function getAgendamento(id: number): Promise<AgendamentoResponse> {
  return apiRequest<AgendamentoResponse>(`/tutor/agendamentos/${id}`);
}

/** O `petId` é conferido contra os pets do tutor: pet de outro dono dá 404. */
export function createAgendamento(data: AgendamentoRequest): Promise<AgendamentoResponse> {
  return apiRequest<AgendamentoResponse>('/tutor/agendamentos', { method: 'POST', body: data });
}

/** Remarcação: mesma consulta, nova data e hora. */
export function updateAgendamento(
  id: number,
  data: AgendamentoRequest
): Promise<AgendamentoResponse> {
  return apiRequest<AgendamentoResponse>(`/tutor/agendamentos/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/** Cancelamento. A API muda o status para CANCELADO e responde 204. */
export function cancelarAgendamento(id: number): Promise<void> {
  return apiRequest<void>(`/tutor/agendamentos/${id}`, { method: 'DELETE' });
}
