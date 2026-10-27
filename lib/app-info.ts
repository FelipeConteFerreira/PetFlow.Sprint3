import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { API_BASE_URL } from '@/constants/api';

/**
 * Identificação desta versão do aplicativo, para a tela "Sobre o App".
 *
 * O hash do commit é gravado no build por `app.config.js` (em `extra.build`).
 * Nada aqui é digitado à mão: se o hash na tela não bater com o repositório,
 * o APK não veio daquele commit.
 */

type InfoDeBuild = { commitHash?: string; geradoEm?: string };

export type InfoDoApp = {
  nome: string;
  versao: string;
  commitHash: string;
  commitCurto: string;
  /** true quando o build saiu de uma árvore com alterações não commitadas. */
  commitModificado: boolean;
  geradoEm: string | null;
  plataforma: string;
  api: string;
};

const SUFIXO_MODIFICADO = '-modificado';

function formatarDataHora(iso?: string): string | null {
  if (!iso) return null;
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return null;
  const dois = (n: number) => String(n).padStart(2, '0');
  return (
    `${dois(data.getDate())}/${dois(data.getMonth() + 1)}/${data.getFullYear()} ` +
    `${dois(data.getHours())}:${dois(data.getMinutes())}`
  );
}

export function lerInfoDoApp(): InfoDoApp {
  const config = Constants.expoConfig;
  const build = (config?.extra?.build ?? {}) as InfoDeBuild;

  const bruto = build.commitHash ?? 'desconhecido';
  const commitModificado = bruto.endsWith(SUFIXO_MODIFICADO);
  const commitHash = commitModificado ? bruto.slice(0, -SUFIXO_MODIFICADO.length) : bruto;

  return {
    nome: config?.name ?? 'PetFlow',
    versao: config?.version ?? '—',
    commitHash,
    commitCurto: /^[0-9a-f]{7,}$/i.test(commitHash) ? commitHash.slice(0, 7) : commitHash,
    commitModificado,
    geradoEm: formatarDataHora(build.geradoEm),
    plataforma: `${Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'} ${String(Platform.Version)}`,
    api: API_BASE_URL,
  };
}
