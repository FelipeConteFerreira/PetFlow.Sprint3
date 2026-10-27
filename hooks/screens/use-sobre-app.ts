import { useMemo } from 'react';

import { lerInfoDoApp } from '@/lib/app-info';

/** Integrantes do grupo, exibidos na tela "Sobre o App". */
const EQUIPE = [
  { nome: 'Olavo Porto Neves', rm: 'RM563558' },
  { nome: 'Pedro Henrique Dias França', rm: 'RM561940' },
  { nome: 'Luiz Gustavo Gonçalves', rm: 'RM564495' },
  { nome: 'Altamir Lima', rm: 'RM562906' },
  { nome: 'Felipe Conte', rm: 'RM562248' },
];

const TECNOLOGIAS = [
  'React Native + Expo',
  'React Navigation',
  'TanStack Query',
  'Axios',
  'expo-notifications',
  'TypeScript',
];

/** Dados da tela "Sobre o App": versão, commit do build, equipe e stack. */
export function useSobreApp() {
  const info = useMemo(() => lerInfoDoApp(), []);
  return { info, equipe: EQUIPE, tecnologias: TECNOLOGIAS };
}
