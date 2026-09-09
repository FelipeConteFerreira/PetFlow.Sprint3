import { apiRequest, buildQuery } from '@/lib/api/http';
import type {
  AgendamentoRequest,
  AgendamentoResponse,
  AgendamentoStatus,
  PageParams,
  SpringPage,
} from '@/types/api';

export async function listAgendamentos(page: PageParams = {}): Promise<AgendamentoResponse[]> {
  const result = await apiRequest<SpringPage<AgendamentoResponse>>(
    `/agendamentos${buildQuery({ page: page.page ?? 0, size: page.size ?? 50 })}`
  );
  return result.content ?? [];
}

export function getAgendamento(id: number): Promise<AgendamentoResponse> {
  return apiRequest<AgendamentoResponse>(`/agendamentos/${id}`);
}

export function createAgendamento(data: AgendamentoRequest): Promise<AgendamentoResponse> {
  return apiRequest<AgendamentoResponse>('/agendamentos', { method: 'POST', body: data });
}

export function updateAgendamento(
  id: number,
  data: AgendamentoRequest
): Promise<AgendamentoResponse> {
  return apiRequest<AgendamentoResponse>(`/agendamentos/${id}`, { method: 'PUT', body: data });
}

export function deleteAgendamento(id: number): Promise<void> {
  return apiRequest<void>(`/agendamentos/${id}`, { method: 'DELETE' });
}

export function alterarStatusAgendamento(
  id: number,
  status: AgendamentoStatus,
  motivoCancelamento?: string
): Promise<AgendamentoResponse> {
  return apiRequest<AgendamentoResponse>(`/agendamentos/${id}/status`, {
    method: 'PATCH',
    body: { status, motivoCancelamento },
  });
}
