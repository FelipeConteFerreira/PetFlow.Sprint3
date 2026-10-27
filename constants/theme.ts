/**
 * Paletas do PetFlow: uma clara e uma escura, com os mesmos nomes de cor.
 *
 * As telas nunca escolhem um hexadecimal: pedem `cores.text`, `cores.card`…
 * ao `useTema()` e recebem o valor do modo ativo. Trocar de tema é trocar de
 * objeto, e todo `StyleSheet` é recriado a partir dele (ver `useEstilos`).
 */

export type Paleta = {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  /** Cor de texto e ícone sobre `primary`, `blue`, `danger`. */
  onPrimary: string;
  orange: string;
  orangeSoft: string;
  /** Texto sobre `orangeSoft` (status "solicitado", etiquetas de atenção). */
  warningText: string;
  blue: string;
  blueDark: string;
  blueSoft: string;
  danger: string;
  dangerSoft: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  card: string;
  border: string;
  borderStrong: string;
  badge: string;
  badgeBg: string;
  aiBg: string;
  aiBorder: string;
  infoBg: string;
};

export const paletaClara: Paleta = {
  primary: '#2E9B5B',
  primaryDark: '#248A4E',
  primarySoft: '#E8F5EC',
  onPrimary: '#FFFFFF',
  orange: '#F5A623',
  orangeSoft: '#FFF4E3',
  warningText: '#B26A00',
  blue: '#4A90D9',
  blueDark: '#3A7FC8',
  blueSoft: '#EAF2FB',
  danger: '#DC2626',
  dangerSoft: '#FEECEC',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  background: '#F8FAF9',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  badge: '#E8915A',
  badgeBg: '#FFF4ED',
  aiBg: '#E8F5EC',
  aiBorder: '#C8E6D0',
  infoBg: '#F3F4F6',
};

/**
 * Modo escuro: fundo esverdeado bem escuro em vez de preto puro (menos
 * contraste duro em tela OLED), e as cores "Dark", usadas como texto sobre os
 * fundos suaves, ficam *mais claras* — é o que mantém a leitura.
 */
export const paletaEscura: Paleta = {
  primary: '#36AE68',
  primaryDark: '#7BD7A2',
  primarySoft: '#173323',
  onPrimary: '#FFFFFF',
  orange: '#F5A623',
  orangeSoft: '#36290F',
  warningText: '#F4C46A',
  blue: '#5FA3E8',
  blueDark: '#93C3F3',
  blueSoft: '#16283B',
  danger: '#F06464',
  dangerSoft: '#3B1818',
  text: '#EEF3F0',
  textSecondary: '#A6B0AB',
  textMuted: '#707B75',
  background: '#0E1311',
  card: '#171F1B',
  border: '#25302A',
  borderStrong: '#36423C',
  badge: '#F0A374',
  badgeBg: '#36241A',
  aiBg: '#173323',
  aiBorder: '#24563A',
  infoBg: '#212A25',
};

export type EsquemaDeCor = 'claro' | 'escuro';

/** O que o usuário escolheu no Perfil. `sistema` acompanha o celular. */
export type PreferenciaDeTema = 'sistema' | EsquemaDeCor;

export const PREFERENCIA_TEMA_LABEL: Record<PreferenciaDeTema, string> = {
  sistema: 'Sistema',
  claro: 'Claro',
  escuro: 'Escuro',
};
