import { PetFlowColors } from '@/constants/petflow';
import type {
  AgendamentoStatus,
  PetPorte,
  PetResponse,
  PetSexo,
  PetStatus,
} from '@/types/api';

/**
 * Tradução dos enums da API para o que aparece na tela.
 *
 * A API fala `M`, `MEDIO`, `SOLICITADO`; a tela fala "Macho", "Médio",
 * "Solicitado". A conversão mora aqui para não se repetir — e para que uma
 * etiqueta nova entre num lugar só.
 */

export const SEXO_LABEL: Record<PetSexo, string> = {
  M: 'Macho',
  F: 'Fêmea',
  I: 'Não informado',
};

export const PORTE_LABEL: Record<PetPorte, string> = {
  MINI: 'Mini',
  PEQUENO: 'Pequeno',
  MEDIO: 'Médio',
  GRANDE: 'Grande',
  GIGANTE: 'Gigante',
};

export const PET_STATUS_LABEL: Record<PetStatus, string> = {
  ATIVO: 'Ativo',
  EM_TRATAMENTO: 'Em tratamento',
  OBITO: 'Óbito',
  PERDIDO: 'Perdido',
  INATIVO: 'Inativo',
};

export const AGENDAMENTO_STATUS_LABEL: Record<AgendamentoStatus, string> = {
  SOLICITADO: 'Solicitado',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  REALIZADO: 'Realizado',
};

/**
 * Status ausente conta como solicitado: a API aceita gravar um agendamento sem
 * status, e a tela precisa mostrar alguma coisa para essas linhas antigas.
 */
export function statusOuPadrao(status?: AgendamentoStatus): AgendamentoStatus {
  return status ?? 'SOLICITADO';
}

export function corDoStatusAgendamento(status?: AgendamentoStatus): {
  fundo: string;
  texto: string;
} {
  switch (statusOuPadrao(status)) {
    case 'CONFIRMADO':
      return { fundo: PetFlowColors.primarySoft, texto: PetFlowColors.primaryDark };
    case 'REALIZADO':
      return { fundo: PetFlowColors.blueSoft, texto: PetFlowColors.blueDark };
    case 'CANCELADO':
      return { fundo: PetFlowColors.dangerSoft, texto: PetFlowColors.danger };
    default:
      return { fundo: PetFlowColors.orangeSoft, texto: '#B26A00' };
  }
}

/**
 * Emoji do pet pela espécie da raça.
 *
 * É enfeite, não dado: quando a espécie não vem junto, cai na pata genérica em
 * vez de inventar que o bicho é cachorro.
 */
export function emojiDoPet(especieNome?: string): string {
  const especie = (especieNome ?? '').toLowerCase();
  if (especie.includes('can') || especie.includes('cão') || especie.includes('cao')) return '🐕';
  if (especie.includes('fel') || especie.includes('gat')) return '🐈';
  if (especie.includes('ave') || especie.includes('pass')) return '🦜';
  if (especie.includes('roedor') || especie.includes('hamster')) return '🐹';
  if (especie.includes('rept') || especie.includes('lagart')) return '🦎';
  if (especie.includes('coelho') || especie.includes('lago')) return '🐇';
  return '🐾';
}

// ---------- datas ----------

/** `yyyy-MM-dd` → `dd/MM/yyyy`. Sem Date: fuso não deve mexer numa data seca. */
export function formatarData(iso?: string): string {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** `HH:mm:ss` ou `HH:mm` → `HH:mm`. */
export function formatarHora(hora?: string): string {
  if (!hora) return '—';
  return hora.slice(0, 5);
}

export function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

/**
 * Idade a partir da data de nascimento, em anos ou meses.
 *
 * Devolve `null` quando não há data — a tela decide o que dizer no lugar, em
 * vez de mostrar "0 anos" para um pet cuja idade ninguém informou.
 */
export function idadeDoPet(dtNascimento?: string): string | null {
  if (!dtNascimento) return null;
  const [ano, mes, dia] = dtNascimento.split('-').map(Number);
  if (!ano || !mes || !dia) return null;

  const hoje = new Date();
  let meses = (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() + 1 - mes);
  if (hoje.getDate() < dia) meses -= 1;
  if (meses < 0) return null;

  if (meses < 1) return 'menos de 1 mês';
  if (meses < 24) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  const anos = Math.floor(meses / 12);
  return `${anos} anos`;
}

/** Linha de apoio dos cartões: raça, sexo e idade, sem separador sobrando. */
export function resumoDoPet(pet: PetResponse): string {
  const idade = idadeDoPet(pet.dtNascimento);
  return [pet.racaNome, pet.sexo ? SEXO_LABEL[pet.sexo] : null, idade]
    .filter(Boolean)
    .join(' · ');
}

/**
 * Ordena agendamentos do mais próximo para o mais distante.
 *
 * `yyyy-MM-dd` e `HH:mm` ordenam corretamente como texto, então não vale
 * construir um Date só para comparar.
 */
export function porDataHora<T extends { dtAgendamento: string; hrAgendamento: string }>(
  a: T,
  b: T
): number {
  return `${a.dtAgendamento}T${a.hrAgendamento}`.localeCompare(
    `${b.dtAgendamento}T${b.hrAgendamento}`
  );
}
