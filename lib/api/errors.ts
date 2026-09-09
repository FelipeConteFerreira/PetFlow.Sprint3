export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erro inesperado. Tente novamente.';
}

async function readProblemDetail(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as {
      detail?: string;
      title?: string;
      errors?: Record<string, string>;
    };
    if (body.errors) {
      const first = Object.values(body.errors)[0];
      if (first) return first;
    }
    if (body.detail) return body.detail;
    if (body.title) return body.title;
  } catch {
    /* resposta não-JSON */
  }
  if (res.status === 0) {
    return 'Sem conexão com a API. Verifique a internet ou aguarde o servidor acordar (Render).';
  }
  return `Erro ${res.status}`;
}

export async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;
  const message = await readProblemDetail(res);
  throw new ApiError(message, res.status);
}
