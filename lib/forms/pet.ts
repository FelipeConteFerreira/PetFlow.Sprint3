import type { PetDoTutorRequest, PetPorte, PetResponse, PetSexo, PetStatus } from '@/types/api';

import { dataISOValida, type FormErrors } from './validators';

export const SEXOS: PetSexo[] = ['M', 'F', 'I'];
export const PORTES: PetPorte[] = ['MINI', 'PEQUENO', 'MEDIO', 'GRANDE', 'GIGANTE'];
export const STATUS_EDITAVEIS: PetStatus[] = ['ATIVO', 'EM_TRATAMENTO', 'PERDIDO'];
export const STATUS_LABEL_CURTO: Record<string, string> = {
  ATIVO: 'Saudável',
  EM_TRATAMENTO: 'Em tratamento',
  PERDIDO: 'Perdido',
};

export type PetFormValues = {
  especieId: number | undefined;
  nome: string;
  racaId: number | undefined;
  dtNascimento: string;
  sexo: PetSexo | undefined;
  porte: PetPorte | undefined;
  status: PetStatus;
  castrado: boolean | undefined;
  pelagem: string;
  microchip: string;
  observacaoGeral: string;
};

/**
 * Valores de partida: vazios no cadastro, os do pet na edição.
 *
 * O `PetResponse` traz a raça mas não a espécie dela, então a espécie vem de
 * `especieDaRaca` — para que o filtro já apareça marcado ao editar.
 */
export function valoresIniciaisPet(
  pet: PetResponse | undefined,
  especieDaRaca: number | undefined
): PetFormValues {
  return {
    especieId: especieDaRaca,
    nome: pet?.nome ?? '',
    racaId: pet?.racaId,
    dtNascimento: pet?.dtNascimento ?? '',
    sexo: pet?.sexo,
    porte: pet?.porte,
    status: pet?.status ?? 'ATIVO',
    castrado: pet?.castrado ?? undefined,
    pelagem: pet?.pelagem ?? '',
    microchip: pet?.microchip ?? '',
    observacaoGeral: pet?.observacaoGeral ?? '',
  };
}

export function validarPet(valores: PetFormValues): FormErrors {
  const erros: FormErrors = {};
  if (!valores.nome.trim()) erros.nome = 'Diga como o pet se chama.';
  if (!valores.racaId) erros.racaId = 'Escolha a raça — a clínica precisa dela na ficha.';
  if (valores.dtNascimento && !dataISOValida(valores.dtNascimento)) {
    erros.dtNascimento = 'Use o formato aaaa-mm-dd, por exemplo 2021-03-14.';
  }
  return erros;
}

/** Sem `tutorId`: o dono vem do token. */
export function paraPetRequest(valores: PetFormValues): PetDoTutorRequest {
  return {
    nome: valores.nome.trim(),
    racaId: valores.racaId as number,
    dtNascimento: valores.dtNascimento.trim() || undefined,
    sexo: valores.sexo,
    porte: valores.porte,
    status: valores.status,
    castrado: valores.castrado,
    pelagem: valores.pelagem.trim() || undefined,
    microchip: valores.microchip.trim() || undefined,
    observacaoGeral: valores.observacaoGeral.trim() || undefined,
  };
}
