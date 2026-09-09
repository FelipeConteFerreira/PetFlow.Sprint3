import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente único do TanStack Query.
 * retry: 1 porque o ACI pode demorar na primeira chamada; mais que isso
 * trava a tela de loading numa demonstração.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Chaves de cache centralizadas — evita string solta espalhada pelas telas. */
export const queryKeys = {
  pets: ['pets'] as const,
  pet: (id: number) => ['pets', id] as const,
  obrigacoes: (status?: string) => ['obrigacoes', status ?? 'todas'] as const,
  tutorMe: ['tutores', 'me'] as const,
};
