import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useClinicasPublicas } from '@/hooks/use-catalogo';
import { getErrorMessage } from '@/lib/api/errors';
import {
  CADASTRO_TUTOR_INICIAL,
  paraTutorRequest,
  validarCadastroTutor,
  type CadastroTutorValues,
} from '@/lib/forms/cadastro-tutor';
import { temErros } from '@/lib/forms/validators';

import { useForm } from './use-form';

/**
 * Cadastro do tutor: campos, escolha da clínica, validação e envio.
 *
 * A clínica é obrigatória — `POST /api/tutores` exige `clinicaId`. A lista vem
 * de `GET /api/clinicas/publicas`, a única leitura da API que não pede token.
 */
export function useCadastroTutorForm() {
  const { signUp } = useAuth();
  const clinicas = useClinicasPublicas();
  const { values, setValue, errors, setErrors } =
    useForm<CadastroTutorValues>(CADASTRO_TUTOR_INICIAL);
  const [clinicaEscolhida, setClinicaEscolhida] = useState<number | undefined>();

  /**
   * Uma clínica só na lista já vale como escolhida — derivado, e não copiado
   * para o estado por um efeito: sincronizar estado com dado que veio da API é
   * o que gera renderização em cascata.
   */
  const clinicaId =
    clinicaEscolhida ?? (clinicas.data?.length === 1 ? clinicas.data[0].id : undefined);

  const cadastro = useMutation({
    mutationFn: (v: CadastroTutorValues) => signUp(paraTutorRequest(v, clinicaId as number)),
  });

  function escolherClinica(id: number) {
    setClinicaEscolhida(id);
    setErrors((atual) => {
      const { clinicaId: _removido, ...resto } = atual;
      return resto;
    });
  }

  function submit() {
    cadastro.reset();
    const novosErros = validarCadastroTutor(values, clinicaId);
    setErrors(novosErros);
    if (temErros(novosErros)) return;
    cadastro.mutate(values);
  }

  return {
    values,
    setValue,
    errors,
    clinicas,
    clinicaId,
    escolherClinica,
    submit,
    isSubmitting: cadastro.isPending,
    submitError: cadastro.error ? getErrorMessage(cadastro.error) : null,
  };
}
