/**
 * Endereço da Clyvo Vet API (Java/Spring).
 * Sobrescreva com EXPO_PUBLIC_API_URL no .env — informe só o host,
 * o prefixo /api é acrescentado aqui.
 */
const DEFAULT_HOST = 'https://clyvo-vet-api-java.onrender.com';

const host = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_HOST).replace(/\/+$/, '');

export const API_BASE_URL = `${host}/api`;

/** O Render desliga a instância ociosa; a primeira chamada acorda a máquina. */
export const API_TIMEOUT_MS = 90_000;
