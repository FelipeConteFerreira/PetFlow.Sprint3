import { useMemo } from 'react';

import { useEspecies, useRacas } from '@/hooks/use-catalogo';
import { useCreatePet, usePet, useUpdatePet } from '@/hooks/use-pets';
import { getErrorMessage } from '@/lib/api/errors';
import {
  paraPetRequest,
  validarPet,
  valoresIniciaisPet,
  type PetFormValues,
} from '@/lib/forms/pet';
import { temErros } from '@/lib/forms/validators';
import type { PetResponse, RacaResponse } from '@/types/api';

import { useForm } from './use-form';

/**
 * Dados que a tela de pet precisa ANTES de desenhar o formulário.
 *
 * A tela espera catálogo e pet chegarem para só então montar o formulário, que
 * nasce já com os valores certos no `useState`. Sem essa espera seria preciso
 * um efeito copiando o pet para o estado quando ele chegasse, e sincronizar
 * estado com dado de API é o que gera renderização em cascata.
 */
export function usePetFormData(petId?: number) {
  const editando = typeof petId === 'number' && Number.isFinite(petId) && petId > 0;

  const pet = usePet(editando ? petId : 0);
  const especies = useEspecies();
  // Todas as raças de uma vez: filtrar por espécie em memória evita uma
  // chamada nova a cada troca de ficha, e o catálogo é pequeno.
  const racas = useRacas();

  return {
    editando,
    pet: editando ? pet.data : undefined,
    especies: especies.data ?? [],
    racas: racas.data ?? [],
    carregando: especies.isPending || racas.isPending || (editando && pet.isPending),
    erro: especies.error ?? racas.error ?? (editando ? pet.error : null),
    recarregando: especies.isFetching || racas.isFetching,
    recarregar: () => {
      void especies.refetch();
      void racas.refetch();
      if (editando) void pet.refetch();
    },
  };
}

/**
 * Estado, validação e envio do formulário de pet.
 *
 * Com `pet` é edição (PUT); sem ele é cadastro (POST). `onSaved` é chamado
 * quando a API confirma — quem decide para onde ir é a tela.
 */
export function usePetForm({
  pet,
  racas,
  onSaved,
}: {
  pet?: PetResponse;
  racas: RacaResponse[];
  onSaved: () => void;
}) {
  const editando = !!pet;
  const especieDoPet = pet ? racas.find((r) => r.id === pet.racaId)?.especieId : undefined;

  const { values, setValue, errors, setErrors } = useForm<PetFormValues>(
    valoresIniciaisPet(pet, especieDoPet)
  );

  const criar = useCreatePet();
  const atualizar = useUpdatePet(pet?.id ?? 0);
  const envio = editando ? atualizar : criar;

  const opcoesRaca = useMemo(
    () =>
      racas
        .filter((r) => !values.especieId || r.especieId === values.especieId)
        .map((r) => ({ valor: r.id, rotulo: r.nome })),
    [racas, values.especieId]
  );

  /** Trocar de espécie invalida a raça escolhida: ela pode não ser dessa espécie. */
  function escolherEspecie(especieId: number | undefined) {
    setValue('especieId', especieId);
    setValue('racaId', undefined);
  }

  function submit() {
    envio.reset();
    const novosErros = validarPet(values);
    setErrors(novosErros);
    if (temErros(novosErros)) return;
    envio.mutate(paraPetRequest(values), { onSuccess: onSaved });
  }

  return {
    editando,
    values,
    setValue,
    errors,
    opcoesRaca,
    escolherEspecie,
    submit,
    isSubmitting: envio.isPending,
    submitError: envio.error ? getErrorMessage(envio.error) : null,
  };
}
