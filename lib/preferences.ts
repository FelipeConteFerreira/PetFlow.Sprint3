import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Preferências do aparelho — o que é escolha de quem está usando este celular
 * e não existe no servidor.
 *
 * O que sobrou aqui depois da integração é só o avatar: nome, e-mail e
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
