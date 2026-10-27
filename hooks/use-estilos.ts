import { useMemo } from 'react';

import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';

/**
 * Estilos que dependem do tema.
 *
 * Cada tela declara, fora do componente, uma fábrica `criarEstilos(cores)` que
 * devolve o `StyleSheet`. Este hook chama a fábrica com a paleta ativa e só a
 * recria quando o tema muda — não a cada render.
 */
export function useEstilos<T>(criarEstilos: (cores: Paleta) => T): T {
  const { cores } = useTema();
  return useMemo(() => criarEstilos(cores), [criarEstilos, cores]);
}
