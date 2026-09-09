import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { listObrigacoes } from '@/services/obrigacoes';
import type { ObrigacaoStatus } from '@/types/api';

export function useObrigacoes(status: ObrigacaoStatus = 'PREVISTA') {
  return useQuery({
    queryKey: queryKeys.obrigacoes(status),
    queryFn: () => listObrigacoes(status),
  });
}
