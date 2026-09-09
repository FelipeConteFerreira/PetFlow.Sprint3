import { apiRequest } from '@/lib/api/http';
import type { ObrigacaoApi, ObrigacaoStatus, SpringPage } from '@/types/api';

export async function listObrigacoes(status?: ObrigacaoStatus): Promise<ObrigacaoApi[]> {
  const query = status ? `?status=${status}` : '';
  const result = await apiRequest<SpringPage<ObrigacaoApi> | ObrigacaoApi[]>(`/obrigacoes${query}`);
  return Array.isArray(result) ? result : (result.content ?? []);
}
