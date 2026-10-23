import { useCallback, useState } from 'react';

import type { FormErrors } from '@/lib/forms/validators';

/**
 * Valores e erros de um formulário — o que todo formulário do app repete.
 *
 * Mexer num campo apaga o erro dele: a mensagem some quando o usuário começa a
 * corrigir, e não só no próximo envio.
 */
export function useForm<T extends object>(inicial: T) {
  const [values, setValues] = useState<T>(inicial);
  const [errors, setErrors] = useState<FormErrors>({});

  const setValue = useCallback(<K extends keyof T>(campo: K, valor: T[K]) => {
    setValues((atual) => ({ ...atual, [campo]: valor }));
    setErrors((atual) => {
      if (!(campo as string in atual)) return atual;
      const { [campo as string]: _removido, ...resto } = atual;
      return resto;
    });
  }, []);

  return { values, setValue, errors, setErrors };
}
