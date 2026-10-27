import AsyncStorage from '@react-native-async-storage/async-storage';

import { formatarData, formatarHora, statusOuPadrao } from '@/lib/formatters';
import {
  type NovaNotificacao,
  agendarPara,
  cancelar,
  cancelarTodas,
  listarAgendadas,
  mostrarAgora,
  pedirPermissao,
} from '@/services/notificacoes';
import type {
  AgendamentoResponse,
  AgendamentoStatus,
  AplicacaoVacinaResponse,
} from '@/types/api';

/**
 * Regras de notificação do PetFlow — *quando* e *o que* avisar o tutor.
 *
 * Três cenários, todos ligados a um evento real:
 *
 * 1. **Consulta marcada ou remarcada** (ação do tutor): aviso na hora, com a
 *    data, e lembretes agendados para 24 h e 2 h antes.
 * 2. **Consulta confirmada ou cancelada pela clínica** (processamento no
 *    backend): a agenda sincronizada com a API é comparada com o último status
 *    conhecido; o que mudou do lado da clínica vira notificação.
 * 3. **Reforço de vacina** (dado da carteira de vacinação vinda da API):
 *    lembretes 7 dias antes e no dia do `proximoReforco`.
 *
 * Tocar em qualquer uma leva à tela onde o tutor age sobre o aviso.
 */

const ANTECEDENCIAS_CONSULTA = [
  { sufixo: '24h', horas: 24 },
  { sufixo: '2h', horas: 2 },
] as const;

const HORA_DO_LEMBRETE_DE_VACINA = 9;
const PREFIXO_CONSULTA = 'consulta-';
const CHAVE_STATUS_CONHECIDO = '@petflow/agenda-status';

type StatusConhecido = Record<string, AgendamentoStatus>;

// ---------- datas ----------

/** `yyyy-MM-dd` + `HH:mm` no fuso do aparelho. */
function dataHoraLocal(data: string, hora = '00:00'): Date | null {
  const [ano, mes, dia] = data.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia, h || 0, min || 0);
}

function consultaAtiva(ag: AgendamentoResponse): boolean {
  const status = statusOuPadrao(ag.status);
  return status === 'SOLICITADO' || status === 'CONFIRMADO';
}

function nomeDoPet(ag: AgendamentoResponse): string {
  return ag.petNome ?? 'seu pet';
}

function quando(ag: AgendamentoResponse): string {
  return `${formatarData(ag.dtAgendamento)} às ${formatarHora(ag.hrAgendamento)}`;
}

function comQuem(ag: AgendamentoResponse): string {
  return ag.veterinarioNome ? ` com ${ag.veterinarioNome}` : '';
}

// ---------- lembretes de consulta ----------

type LembreteAgendado = { id: string; data: Date; notificacao: NovaNotificacao };

function idsDaConsulta(id: number): string[] {
  return ANTECEDENCIAS_CONSULTA.map((a) => `${PREFIXO_CONSULTA}${id}-${a.sufixo}`);
}

export function lembretesDaConsulta(
  ag: AgendamentoResponse,
  agora = new Date()
): LembreteAgendado[] {
  const inicio = dataHoraLocal(ag.dtAgendamento, ag.hrAgendamento);
  if (!inicio || !consultaAtiva(ag)) return [];

  return ANTECEDENCIAS_CONSULTA.flatMap(({ sufixo, horas }) => {
    const data = new Date(inicio.getTime() - horas * 60 * 60 * 1000);
    if (data <= agora) return [];
    const quandoTexto = horas >= 24 ? 'amanhã' : `daqui a ${horas} horas`;
    return [
      {
        id: `${PREFIXO_CONSULTA}${ag.id}-${sufixo}`,
        data,
        notificacao: {
          titulo: `Consulta de ${nomeDoPet(ag)} ${quandoTexto}`,
          corpo: `${quando(ag)}${comQuem(ag)}. Toque para ver ou remarcar.`,
          destino: { tela: 'AgendamentoForm', agendamentoId: ag.id },
          canal: 'consultas',
        },
      },
    ];
  });
}

async function agendarLembretes(lembretes: LembreteAgendado[]): Promise<void> {
  await Promise.all(lembretes.map((l) => agendarPara(l.id, l.data, l.notificacao)));
}

// ---------- status conhecido (para detectar mudança feita pela clínica) ----------

async function lerStatusConhecido(): Promise<StatusConhecido | null> {
  try {
    const salvo = await AsyncStorage.getItem(CHAVE_STATUS_CONHECIDO);
    return salvo ? (JSON.parse(salvo) as StatusConhecido) : null;
  } catch {
    return null;
  }
}

async function salvarStatusConhecido(status: StatusConhecido): Promise<void> {
  await AsyncStorage.setItem(CHAVE_STATUS_CONHECIDO, JSON.stringify(status));
}

/**
 * Registra uma mudança feita *pelo próprio tutor*, para que a próxima
 * sincronização não a confunda com uma ação da clínica.
 */
async function registrarStatus(id: number, status: AgendamentoStatus): Promise<void> {
  const conhecido = (await lerStatusConhecido()) ?? {};
  conhecido[String(id)] = status;
  await salvarStatusConhecido(conhecido);
}

function avisoDeMudanca(
  ag: AgendamentoResponse,
  anterior: AgendamentoStatus,
  atual: AgendamentoStatus
): NovaNotificacao | null {
  if (anterior === atual) return null;

  if (atual === 'CONFIRMADO') {
    return {
      titulo: `Consulta de ${nomeDoPet(ag)} confirmada ✅`,
      corpo: `A clínica confirmou ${quando(ag)}${comQuem(ag)}.`,
      destino: { tela: 'Agenda' },
      canal: 'consultas',
    };
  }

  if (atual === 'CANCELADO') {
    const motivo = ag.motivoCancelamento ? ` Motivo: ${ag.motivoCancelamento}.` : '';
    return {
      titulo: `A clínica cancelou a consulta de ${nomeDoPet(ag)}`,
      corpo: `${quando(ag)}.${motivo} Toque para marcar outro horário.`,
      destino: { tela: 'Agenda' },
      canal: 'consultas',
    };
  }

  return null;
}

// ---------- casos de uso ----------

/** Depois de um POST/PUT de agendamento bem-sucedido. */
export async function notificarConsultaMarcada(
  ag: AgendamentoResponse,
  remarcacao: boolean
): Promise<void> {
  await registrarStatus(ag.id, statusOuPadrao(ag.status));
  if ((await pedirPermissao()) !== 'concedida') return;

  const lembretes = lembretesDaConsulta(ag);
  await cancelar(idsDaConsulta(ag.id));
  await agendarLembretes(lembretes);

  await mostrarAgora({
    titulo: remarcacao ? 'Consulta remarcada 📅' : 'Consulta solicitada 📅',
    corpo:
      `${nomeDoPet(ag)}: ${quando(ag)}${comQuem(ag)}. ` +
      (lembretes.length > 0
        ? 'Vamos te lembrar antes do horário.'
        : 'A clínica vai confirmar o horário.'),
    destino: { tela: 'Agenda' },
    canal: 'consultas',
  });
}

/** Depois do DELETE (cancelamento feito pelo tutor). */
export async function notificarConsultaCancelada(id: number): Promise<void> {
  await registrarStatus(id, 'CANCELADO');
  await cancelar(idsDaConsulta(id));
}

/**
 * Chamada sempre que a agenda chega da API.
 *
 * - Lembretes: mantém agendados os de toda consulta ativa e futura, e cancela
 *   os de consultas canceladas, realizadas ou que sumiram.
 * - Mudança de status: compara com o último status conhecido e avisa o que a
 *   clínica mudou. Na primeira sincronização só guarda o retrato, para não
 *   disparar um aviso por consulta antiga.
 */
export async function sincronizarAgenda(agenda: AgendamentoResponse[]): Promise<void> {
  const anterior = await lerStatusConhecido();
  const atual: StatusConhecido = {};
  const avisos: NovaNotificacao[] = [];

  for (const ag of agenda) {
    const status = statusOuPadrao(ag.status);
    atual[String(ag.id)] = status;
    const statusAntes = anterior?.[String(ag.id)];
    const aviso = statusAntes ? avisoDeMudanca(ag, statusAntes, status) : null;
    if (aviso) avisos.push(aviso);
  }
  await salvarStatusConhecido(atual);

  if ((await pedirPermissao()) !== 'concedida') return;

  const desejados = agenda.flatMap((ag) => lembretesDaConsulta(ag));
  const idsDesejados = new Set(desejados.map((l) => l.id));
  const sobrando = (await listarAgendadas()).filter(
    (id) => id.startsWith(PREFIXO_CONSULTA) && !idsDesejados.has(id)
  );

  await cancelar(sobrando);
  await agendarLembretes(desejados);
  await Promise.all(avisos.map(mostrarAgora));
}

/** Reforços de vacina de um pet, a partir da carteira vinda da API. */
export async function sincronizarReforcos(
  petId: number,
  petNome: string,
  vacinas: AplicacaoVacinaResponse[],
  agora = new Date()
): Promise<void> {
  if ((await pedirPermissao()) !== 'concedida') return;

  const prefixo = `vacina-${petId}-`;
  const desejados: LembreteAgendado[] = vacinas.flatMap((v) => {
    if (!v.proximoReforco) return [];
    const dia = dataHoraLocal(v.proximoReforco, `${HORA_DO_LEMBRETE_DE_VACINA}:00`);
    if (!dia) return [];
    const vacina = v.tipoVacinaNome ?? 'vacina';
    const destino = { tela: 'PetDetalhe', petId } as const;

    const semanaAntes = new Date(dia.getTime() - 7 * 24 * 60 * 60 * 1000);
    return [
      {
        id: `${prefixo}${v.id}-7d`,
        data: semanaAntes,
        notificacao: {
          titulo: `Reforço de ${vacina} de ${petNome} em 7 dias`,
          corpo: `Previsto para ${formatarData(v.proximoReforco)}. Que tal já marcar a consulta?`,
          destino,
          canal: 'vacinas' as const,
        },
      },
      {
        id: `${prefixo}${v.id}-dia`,
        data: dia,
        notificacao: {
          titulo: `Hoje é dia do reforço de ${vacina} 💉`,
          corpo: `${petNome} está com o reforço previsto para hoje.`,
          destino,
          canal: 'vacinas' as const,
        },
      },
    ].filter((l) => l.data > agora);
  });

  const idsDesejados = new Set(desejados.map((l) => l.id));
  const sobrando = (await listarAgendadas()).filter(
    (id) => id.startsWith(prefixo) && !idsDesejados.has(id)
  );
  await cancelar(sobrando);
  await agendarLembretes(desejados);
}

/** Logout: nada de lembrete do tutor anterior tocando no aparelho. */
export async function limparNotificacoes(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE_STATUS_CONHECIDO);
  await cancelarTodas();
}
