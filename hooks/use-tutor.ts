import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { getTutorMe } from '@/services/tutores';

/**
 * O cadastro do tutor autenticado, de `/api/tutor/me`.
 *
 * A tela de perfil lê daqui, e não de uma cópia em AsyncStorage: o que o
 * servidor tem é a verdade, e o token já diz de quem é.
 */
export function useTutorMe() {
  return useQuery({
    queryKey: queryKeys.tutorMe,
    queryFn: getTutorMe,
  });
}
