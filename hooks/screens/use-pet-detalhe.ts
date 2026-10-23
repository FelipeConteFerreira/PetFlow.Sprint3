import { useConsultasDoPet, useDeletePet, usePetFichaTecnica, useVacinasDoPet } from '@/hooks/use-pets';
import { getErrorMessage } from '@/lib/api/errors';

/**
 * Detalhe do pet: a ficha, o histórico e a remoção.
 *
 * A ficha técnica é um endpoint próprio (`/ficha-tecnica`) que já traz a
 * espécie junto. Consultas e vacinas são o histórico que a clínica registrou:
 * pet novo não tem, e isso não é erro.
 */
export function usePetDetalhe(petId: number, onRemovido: () => void) {
  const ficha = usePetFichaTecnica(petId);
  const consultas = useConsultasDoPet(petId);
  const vacinas = useVacinasDoPet(petId);
  const remocao = useDeletePet();

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
