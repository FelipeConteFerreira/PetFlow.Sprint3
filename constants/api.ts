/**
 * Endereço da Clyvo Vet API (Java/Spring).
 *
 * Informe só o host em `EXPO_PUBLIC_API_URL`; o prefixo `/api` é acrescentado
 * aqui, para que nenhuma chamada precise repeti-lo.
 *
 * ATENÇÃO ao rodar contra um backend local: emulador e aparelho físico não
 * enxergam o `localhost` da máquina de desenvolvimento. Veja o README —
 * é preciso o IP da rede local (`http://192.168.x.x:8080`), o
 * `http://10.0.2.2:8080` do emulador do Android, ou um túnel.
 */
const HOST_PADRAO = 'https://clyvo-vet-api-java.onrender.com';

const host = (process.env.EXPO_PUBLIC_API_URL ?? HOST_PADRAO).replace(/\/+$/, '');

export const API_BASE_URL = `${host}/api`;

/**
 * Quanto esperar por uma resposta antes de desistir.
 *
 * O padrão é alto porque a instância gratuita do Render dorme depois de 15
 * minutos ociosa, e a chamada que a acorda paga o build do contêiner inteiro —
 * medimos mais de dois minutos numa máquina fria. Não é latência de rede: é a
 * máquina subindo. As queries do TanStack Query tentam uma segunda vez, e a
 * segunda costuma responder rápido.
 *
 * Contra um backend local ou já quente, 90 segundos são tempo demais para
 * descobrir que a URL está errada. Baixe com `EXPO_PUBLIC_API_TIMEOUT_MS`:
 * 15000 é um valor confortável nesse caso.
 */
const TIMEOUT_PADRAO_MS = 90_000;

const timeoutConfigurado = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS);

export const API_TIMEOUT_MS =
  Number.isFinite(timeoutConfigurado) && timeoutConfigurado > 0
    ? timeoutConfigurado
    : TIMEOUT_PADRAO_MS;
