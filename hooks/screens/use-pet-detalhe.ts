import { useEffect } from 'react';

import { useConsultasDoPet, useDeletePet, usePetFichaTecnica, useVacinasDoPet } from '@/hooks/use-pets';
import { getErrorMessage } from '@/lib/api/errors';
import { sincronizarReforcos } from '@/lib/notificacoes';

/**
 * Detalhe do pet: a ficha, o histórico e a remoção.
 *
 * A ficha técnica é um endpoint próprio (`/ficha-tecnica`) que já traz a
 * espécie junto. Consultas e vacinas são o histórico que a clínica registrou:
 * pet novo não tem, e isso não é erro.
 *
 * Quando a carteira de vacinação chega, os reforços previstos viram lembretes
 * agendados no aparelho (7 dias antes e no dia).
 */
export function usePetDetalhe(petId: number, onRemovido: () => void) {
  const ficha = usePetFichaTecnica(petId);
  const consultas = useConsultasDoPet(petId);
  const vacinas = useVacinasDoPet(petId);
  const remocao = useDeletePet();

  const petNome = ficha.data?.nome;
  useEffect(() => {
    if (petNome && vacinas.data) {
      void sincronizarReforcos(petId, petNome, vacinas.data).catch(() => undefined);
    }
  }, [petId, petNome, vacinas.data]);

  return {
    pet: ficha.data,
    carregando: ficha.isPending,
    erro: ficha.error,
    atualizando: ficha.isFetching,
    recarregar: () => void ficha.refetch(),
    consultas,
    vacinas,
    remover: () => {
      remocao.reset();
      remocao.mutate(petId, { onSuccess: onRemovido });
    },
    removendo: remocao.isPending,
    erroRemocao: remocao.error ? getErrorMessage(remocao.error) : null,
  };
}
