import { useMemo } from 'react';

import { useAgendamentos } from '@/hooks/use-agendamentos';
import { usePets } from '@/hooks/use-pets';
import { useTutorMe } from '@/hooks/use-tutor';
import { getErrorMessage } from '@/lib/api/errors';
import { hojeISO, proximasConsultas } from '@/lib/formatters';

/**
 * Tudo o que a tela Início mostra, já calculado.
 *
 * As três fontes são as mesmas das outras abas (`/tutor/me`, `/tutor/pets`,
 * `/tutor/agendamentos`), então o cache do TanStack Query já as tem quentes
 * quando o usuário chega aqui — e uma escrita em qualquer tela reflete aqui
 * pela invalidação, sem esta tela saber que houve escrita.
 */
export function useHome() {
  const tutor = useTutorMe();
  const pets = usePets();
  const agenda = useAgendamentos();

  const hoje = hojeISO();

  const proximas = useMemo(() => proximasConsultas(agenda.data ?? [], hoje), [agenda.data, hoje]);

  const carregando = tutor.isPending || pets.isPending || agenda.isPending;
  const erro = tutor.error ?? pets.error ?? agenda.error;

  return {
    primeiroNome: tutor.data?.nome?.split(' ')[0],
    pets: pets.data ?? [],
    proximas,
    totalHoje: proximas.filter((a) => a.dtAgendamento === hoje).length,
    carregando,
    atualizando: tutor.isFetching || pets.isFetching || agenda.isFetching,
    // Só o erro fecha a tela inteira; enquanto carrega, aparece nos números.
    erro: erro && !carregando ? getErrorMessage(erro) : null,
    recarregar: () => {
      void tutor.refetch();
      void pets.refetch();
      void agenda.refetch();
    },
  };
}
