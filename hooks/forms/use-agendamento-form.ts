import { useAgendamento, useCreateAgendamento, useUpdateAgendamento } from '@/hooks/use-agendamentos';
import { useVeterinarios } from '@/hooks/use-catalogo';
import { usePets } from '@/hooks/use-pets';
import { getErrorMessage } from '@/lib/api/errors';
import {
  paraAgendamentoRequest,
  validarAgendamento,
  valoresIniciaisAgendamento,
  type AgendamentoFormValues,
} from '@/lib/forms/agendamento';
import { temErros } from '@/lib/forms/validators';
import type { AgendamentoResponse, PetResponse } from '@/types/api';

import { useForm } from './use-form';

/**
 * Dados que a tela de agendamento precisa antes de desenhar o formulário.
 *
 * A lista de pets é a do próprio tutor — `GET /api/tutor/pets`. Mandar o pet
 * de outra pessoa não adianta: a API confere o dono e responde 404.
 */
export function useAgendamentoFormData(agendamentoId?: number) {
  const remarcando =
    typeof agendamentoId === 'number' && Number.isFinite(agendamentoId) && agendamentoId > 0;

  const pets = usePets();
  const veterinarios = useVeterinarios();
  const existente = useAgendamento(remarcando ? agendamentoId : 0);

  return {
    remarcando,
    agendamento: remarcando ? existente.data : undefined,
    pets: pets.data ?? [],
    veterinarios: veterinarios.data ?? [],
    carregando: pets.isPending || veterinarios.isPending || (remarcando && existente.isPending),
    erro: pets.error ?? veterinarios.error ?? (remarcando ? existente.error : null),
    recarregando: pets.isFetching || veterinarios.isFetching,
    recarregar: () => {
      void pets.refetch();
      void veterinarios.refetch();
      if (remarcando) void existente.refetch();
    },
  };
}

/**
 * Estado, validação e envio do formulário de agendamento.
 *
 * Com `agendamento` é remarcação (PUT); sem ele é uma consulta nova (POST).
 */
export function useAgendamentoForm({
  agendamento,
  pets,
  onSaved,
}: {
  agendamento?: AgendamentoResponse;
  pets: PetResponse[];
  onSaved: () => void;
}) {
  const remarcando = !!agendamento;

  const { values, setValue, errors, setErrors } = useForm<AgendamentoFormValues>(
    valoresIniciaisAgendamento(agendamento, pets.length === 1 ? pets[0].id : undefined)
  );

  const criar = useCreateAgendamento();
  const atualizar = useUpdateAgendamento(agendamento?.id ?? 0);
  const envio = remarcando ? atualizar : criar;

  function submit() {
    envio.reset();
    const novosErros = validarAgendamento(values);
    setErrors(novosErros);
    if (temErros(novosErros)) return;
    envio.mutate(paraAgendamentoRequest(values, agendamento), { onSuccess: onSaved });
  }

  return {
    remarcando,
    values,
    setValue,
    errors,
    submit,
    isSubmitting: envio.isPending,
    submitError: envio.error ? getErrorMessage(envio.error) : null,
  };
}
