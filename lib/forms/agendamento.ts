import { hojeISO } from '@/lib/formatters';
import type { AgendamentoRequest, AgendamentoResponse } from '@/types/api';

import { dataISOValida, horaValida, type FormErrors } from './validators';

export type AgendamentoFormValues = {
  petId: number | undefined;
  veterinarioId: number | undefined;
  dtAgendamento: string;
  hrAgendamento: string;
};

export function valoresIniciaisAgendamento(
  agendamento: AgendamentoResponse | undefined,
  petUnico: number | undefined
): AgendamentoFormValues {
  return {
    // Um pet só: já vem escolhido, não faz sentido pedir para escolher.
    petId: agendamento?.petId ?? petUnico,
    veterinarioId: agendamento?.veterinarioId,
    dtAgendamento: agendamento?.dtAgendamento ?? '',
    hrAgendamento: agendamento?.hrAgendamento.slice(0, 5) ?? '',
  };
}

export function validarAgendamento(valores: AgendamentoFormValues): FormErrors {
  const erros: FormErrors = {};
  if (!valores.petId) erros.petId = 'Escolha para qual pet é a consulta.';
  if (!valores.veterinarioId) erros.veterinarioId = 'Escolha o veterinário.';

  if (!dataISOValida(valores.dtAgendamento)) {
    erros.dtAgendamento = 'Use o formato aaaa-mm-dd.';
  } else if (valores.dtAgendamento.trim() < hojeISO()) {
    erros.dtAgendamento = 'Escolha uma data de hoje em diante.';
  }

  if (!horaValida(valores.hrAgendamento)) {
    erros.hrAgendamento = 'Use o formato hh:mm, por exemplo 14:30.';
  }
  return erros;
}

export function paraAgendamentoRequest(
  valores: AgendamentoFormValues,
  agendamento: AgendamentoResponse | undefined
): AgendamentoRequest {
  return {
    petId: valores.petId as number,
    veterinarioId: valores.veterinarioId as number,
    dtAgendamento: valores.dtAgendamento.trim(),
    hrAgendamento: valores.hrAgendamento.trim(),
    canalOrigem: 'APP',
    status: agendamento?.status ?? 'SOLICITADO',
  };
}
