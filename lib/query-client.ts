import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente único do TanStack Query.
 * retry 1 porque a API no Render pode estar acordando na primeira chamada.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

/** Chaves de cache centralizadas — nada de string solta espalhada pelas telas. */
export const queryKeys = {
  pets: (tutorId: number) => ['pets', tutorId] as const,
  pet: (id: number) => ['pets', 'detalhe', id] as const,
  agendamentos: ['agendamentos'] as const,
  agendamento: (id: number) => ['agendamentos', id] as const,
  obrigacoes: (status?: string, petId?: number) =>
    ['obrigacoes', status ?? 'todas', petId ?? 'todos'] as const,
  especies: ['catalogo', 'especies'] as const,
  racas: (especieId?: number) => ['catalogo', 'racas', especieId ?? 'todas'] as const,
  clinicas: ['catalogo', 'clinicas'] as const,
  veterinarios: (clinicaId?: number) => ['catalogo', 'veterinarios', clinicaId ?? 'todas'] as const,
  tutor: (id: number) => ['tutores', id] as const,
};
