import { formatarHora, statusOuPadrao } from '@/lib/formatters';
import type { AgendamentoResponse, AgendamentoStatus } from '@/types/api';

/**
 * O que mudou na agenda entre duas sincronizações com a API.
 *
 * Só a decisão, sem AsyncStorage nem expo-notifications: quem grava o retrato
 * e quem mostra o aviso é `lib/notificacoes.ts`. Assim a regra dá para
 * conferir fora do aparelho.
 *
 * O retrato guarda, por agendamento, o status e o horário da última vez em que
 * o app viu a agenda — ou que o próprio tutor gravou neste aparelho. O que
 * difere do retrato foi feito do lado da clínica.
 */

export type SituacaoConhecida = {
  status: AgendamentoStatus;
  /** Ausentes em retratos gravados antes de o horário ser guardado. */
  data?: string;
  hora?: string;
};

export type AgendaConhecida = Record<string, SituacaoConhecida>;

export type MudancaNaAgenda =
  | { tipo: 'nova'; agendamento: AgendamentoResponse }
  | {
      tipo: 'status';
      agendamento: AgendamentoResponse;
      anterior: AgendamentoStatus;
      atual: AgendamentoStatus;
    }
  | { tipo: 'remarcada'; agendamento: AgendamentoResponse };

export function consultaAtiva(ag: Pick<AgendamentoResponse, 'status'>): boolean {
  const status = statusOuPadrao(ag.status);
  return status === 'SOLICITADO' || status === 'CONFIRMADO';
}

/** `HH:mm:ss` e `HH:mm` são o mesmo horário: compara só `HH:mm`. */
export function situacaoDe(ag: AgendamentoResponse): SituacaoConhecida {
  return {
    status: statusOuPadrao(ag.status),
    data: ag.dtAgendamento,
    hora: formatarHora(ag.hrAgendamento),
  };
}

export function retratoDaAgenda(agenda: AgendamentoResponse[]): AgendaConhecida {
  return Object.fromEntries(agenda.map((ag) => [String(ag.id), situacaoDe(ag)]));
}

/**
 * Lê o retrato salvo. Versões anteriores guardavam só o status (`{ "12":
 * "CONFIRMADO" }`); esses itens viram situação sem horário e não geram aviso
 * de remarcação até a próxima sincronização completá-los.
 */
export function retratoSalvo(
  salvo: Record<string, AgendamentoStatus | SituacaoConhecida>
): AgendaConhecida {
  return Object.fromEntries(
    Object.entries(salvo).map(([id, valor]) => [
      id,
      typeof valor === 'string' ? { status: valor } : valor,
    ])
  );
}

/**
 * Agendamentos não somem da lista do tutor (o DELETE só cancela). Se nenhum
 * id da agenda atual está no retrato, ele é de outra conta — a sessão expirou
 * sem logout e outro tutor entrou — e vale como primeira sincronização.
 */
function retratoDeOutraConta(anterior: AgendaConhecida, agenda: AgendamentoResponse[]): boolean {
  return (
    Object.keys(anterior).length > 0 &&
    agenda.length > 0 &&
    !agenda.some((ag) => String(ag.id) in anterior)
  );
}

/**
 * - Sem retrato (primeira sincronização depois do login ou da instalação):
 *   nada, para não avisar de cada consulta que já existia.
 * - Id que o retrato não tem e consulta ativa: a clínica marcou. O que o tutor
 *   marca neste aparelho entra no retrato antes da sincronização seguinte.
 * - Status diferente: a clínica confirmou, cancelou etc. Ganha da remarcação,
 *   porque o aviso de status já traz o horário novo.
 * - Mesmo status, data ou hora diferente, consulta ativa: a clínica remarcou.
 */
export function mudancasNaAgenda(
  anterior: AgendaConhecida | null,
  agenda: AgendamentoResponse[]
): MudancaNaAgenda[] {
  if (!anterior || retratoDeOutraConta(anterior, agenda)) return [];

  return agenda.flatMap((ag): MudancaNaAgenda[] => {
    const antes = anterior[String(ag.id)];
    const agora = situacaoDe(ag);

    if (!antes) return consultaAtiva(ag) ? [{ tipo: 'nova', agendamento: ag }] : [];

    if (antes.status !== agora.status) {
      return [{ tipo: 'status', agendamento: ag, anterior: antes.status, atual: agora.status }];
    }

    const mudouHorario =
      antes.data !== undefined && (antes.data !== agora.data || antes.hora !== agora.hora);
    return mudouHorario && consultaAtiva(ag) ? [{ tipo: 'remarcada', agendamento: ag }] : [];
  });
}
