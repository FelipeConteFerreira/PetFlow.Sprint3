import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente único do TanStack Query.
 *
 * `retry: 1` porque a instância gratuita do Render dorme: a primeira chamada
 * depois de um tempo ocioso pode falhar enquanto a máquina acorda.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

/**
 * Chaves de cache centralizadas — nada de string solta espalhada pelas telas.
 *
 * Não há mais `tutorId` nas chaves: a superfície do tutor devolve só o que é
 * do token, e o `queryClient.clear()` do logout já separa uma sessão da outra.
 */
export const queryKeys = {
  pets: ['pets'] as const,
  pet: (id: number) => ['pets', 'detalhe', id] as const,
  petFicha: (id: number) => ['pets', 'ficha', id] as const,
  petConsultas: (id: number) => ['pets', 'consultas', id] as const,
  petVacinas: (id: number) => ['pets', 'vacinas', id] as const,

  agendamentos: ['agendamentos'] as const,
  agendamento: (id: number) => ['agendamentos', 'detalhe', id] as const,

  tutorMe: ['tutor', 'me'] as const,

  especies: ['catalogo', 'especies'] as const,
  racas: (especieId?: number) => ['catalogo', 'racas', especieId ?? 'todas'] as const,
  veterinarios: ['catalogo', 'veterinarios'] as const,
  clinicasPublicas: ['catalogo', 'clinicas-publicas'] as const,
};
