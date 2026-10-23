import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/contexts/auth-context';
import { getErrorMessage } from '@/lib/api/errors';
import { LOGIN_INICIAL, validarLogin, type LoginValues } from '@/lib/forms/login';
import { temErros } from '@/lib/forms/validators';

import { useForm } from './use-form';

/**
 * Tudo da tela de login que não é desenho: campos, validação e o envio.
 *
 * Quando o login dá certo, `signIn` guarda a sessão e o navegador troca o
 * conjunto de telas sozinho — por isso não há navegação aqui.
 */
export function useLoginForm() {
  const { signIn } = useAuth();
  const { values, setValue, errors, setErrors } = useForm<LoginValues>(LOGIN_INICIAL);

  const login = useMutation({
    mutationFn: (v: LoginValues) => signIn(v.email.trim().toLowerCase(), v.senha),
  });

  function submit() {
    login.reset();
    const novosErros = validarLogin(values);
    setErrors(novosErros);
    if (temErros(novosErros)) return;
    login.mutate(values);
  }

  return {
    values,
    setValue,
    errors,
    submit,
    isSubmitting: login.isPending,
    submitError: login.error ? getErrorMessage(login.error) : null,
  };
}
