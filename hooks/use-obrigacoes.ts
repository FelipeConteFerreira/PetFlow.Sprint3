import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { listObrigacoes } from '@/services/obrigacoes';
import type { ObrigacaoStatus } from '@/types/api';

/** Obrigações geradas pelo motor de protocolos — somente leitura na API. */
export function useObrigacoes(status: ObrigacaoStatus = 'PREVISTA', petId?: number) {
  return useQuery({
    queryKey: queryKeys.obrigacoes(status, petId),
    queryFn: () => listObrigacoes({ status, petId }),
  });
}
