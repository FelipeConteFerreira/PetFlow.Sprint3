import { useMemo, useState } from 'react';

import { useAgendamentos, useCancelarAgendamento } from '@/hooks/use-agendamentos';
import { usePets } from '@/hooks/use-pets';
import { getErrorMessage } from '@/lib/api/errors';
import { hojeISO, porDataHora } from '@/lib/formatters';

export type FiltroAgenda = 'proximos' | 'todos';

/**
 * A agenda do tutor — `GET /api/tutor/agendamentos` — com filtro e cancelamento.
 */
export function useAgendaScreen() {
  const agendamentos = useAgendamentos();
  const pets = usePets();
  const cancelamento = useCancelarAgendamento();
  const [filtro, setFiltro] = useState<FiltroAgenda>('proximos');

  const hoje = hojeISO();

  const visiveis = useMemo(() => {
    const lista = [...(agendamentos.data ?? [])].sort(porDataHora);
    if (filtro === 'todos') return lista.reverse();
    return lista.filter((a) => a.dtAgendamento >= hoje && a.status !== 'CANCELADO');
  }, [agendamentos.data, filtro, hoje]);

  return {
    filtro,
    setFiltro,
    visiveis,
    semPets: !pets.isPending && (pets.data?.length ?? 0) === 0,
    carregando: agendamentos.isPending,
    erro: agendamentos.error,
    atualizando: agendamentos.isFetching,
    recarregar: () => void agendamentos.refetch(),
    cancelar: (id: number) => {
      cancelamento.reset();
      cancelamento.mutate(id);
    },
    erroAcao: cancelamento.error ? getErrorMessage(cancelamento.error) : null,
  };
}
