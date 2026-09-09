import { apiRequest, buildQuery } from '@/lib/api/http';
import type { ObrigacaoFiltro, ObrigacaoResponse, PageParams, SpringPage } from '@/types/api';

export async function listObrigacoes(
  filtro: ObrigacaoFiltro = {},
  page: PageParams = {}
): Promise<ObrigacaoResponse[]> {
  const result = await apiRequest<SpringPage<ObrigacaoResponse>>(
    `/obrigacoes${buildQuery({ ...filtro, page: page.page ?? 0, size: page.size ?? 50 })}`
  );
  return result.content ?? [];
}

export function getObrigacao(id: number): Promise<ObrigacaoResponse> {
  return apiRequest<ObrigacaoResponse>(`/obrigacoes/${id}`);
}
