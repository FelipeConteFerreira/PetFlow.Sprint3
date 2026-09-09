/** URL base da Clyvo Vet API (Java). Sobrescreva com EXPO_PUBLIC_API_URL no .env */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://clyvo-vet-api-java.onrender.com';

export const API_TIMEOUT_MS = 60_000;
