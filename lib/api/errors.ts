import type { AxiosError } from 'axios';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Erro inesperado. Tente novamente.';
}

/** Corpo de erro no formato RFC 7807 que a API Java devolve. */
type ProblemDetail = {
  detail?: string;
  title?: string;
  errors?: Record<string, string>;
};

function readProblemDetail(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const problem = body as ProblemDetail;

  if (problem.errors) {
    const primeiro = Object.values(problem.errors)[0];
    if (primeiro) return primeiro;
  }
  return problem.detail || problem.title || null;
}

/**
 * Traduz um erro do Axios para uma mensagem que o usuário entende.
 *
 * Três situações diferentes, três textos: a API respondeu com erro (usa o
 * corpo dela), a API não respondeu a tempo (instância do Render acordando) ou
 * a requisição nem chegou lá (sem internet ou URL errada).
 */
export function toApiError(error: AxiosError): ApiError {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError(
      'A API não respondeu a tempo. O servidor pode estar iniciando — tente de novo em alguns segundos.',
      0
    );
  }

  if (!error.response) {
    return new ApiError(
      'Sem conexão com a API. Verifique a internet ou o endereço do servidor.',
      0
    );
  }

  const { status, data } = error.response;
  return new ApiError(readProblemDetail(data) ?? `Erro ${status}`, status);
}
