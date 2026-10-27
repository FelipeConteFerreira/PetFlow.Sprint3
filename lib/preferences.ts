import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PreferenciaDeTema } from '@/constants/theme';

/**
 * Preferências do aparelho — o que é escolha de quem está usando este celular
 * e não existe no servidor.
 *
 * O avatar e o tema ficam aqui: nome, e-mail e
 * telefone do tutor vêm de `/api/tutor/me`, e guardar uma segunda cópia deles
 * em AsyncStorage só criaria duas versões da mesma verdade — com a local
 * envelhecendo em silêncio.
 */

const CHAVE_AVATAR = '@petflow/avatar';

export const AVATARES = ['🐾', '🐕', '🐈', '🦜', '🐇', '🌿', '💚', '😊'];

export async function getAvatar(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(CHAVE_AVATAR)) ?? AVATARES[0];
  } catch {
    return AVATARES[0];
  }
}

export async function setAvatar(emoji: string): Promise<void> {
  await AsyncStorage.setItem(CHAVE_AVATAR, emoji);
}

// ---------- Tema ----------

const CHAVE_TEMA = '@petflow/tema';
const PREFERENCIAS_TEMA: PreferenciaDeTema[] = ['sistema', 'claro', 'escuro'];

export async function getPreferenciaTema(): Promise<PreferenciaDeTema> {
  try {
    const salva = await AsyncStorage.getItem(CHAVE_TEMA);
    return PREFERENCIAS_TEMA.includes(salva as PreferenciaDeTema)
      ? (salva as PreferenciaDeTema)
      : 'sistema';
  } catch {
    return 'sistema';
  }
}

export async function setPreferenciaTema(preferencia: PreferenciaDeTema): Promise<void> {
  await AsyncStorage.setItem(CHAVE_TEMA, preferencia);
}
