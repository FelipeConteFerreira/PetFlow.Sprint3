import type { TutorRequest } from '@/types/api';

import { emailValido, type FormErrors } from './validators';

export type CadastroTutorValues = {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmacao: string;
};

export const CADASTRO_TUTOR_INICIAL: CadastroTutorValues = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  confirmacao: '',
};

/** A clínica não é um campo digitado: vem de uma lista, então entra à parte. */
export function validarCadastroTutor(
  valores: CadastroTutorValues,
  clinicaId: number | undefined
): FormErrors {
  const erros: FormErrors = {};
  if (!valores.nome.trim()) erros.nome = 'Diga como podemos te chamar.';
  if (!emailValido(valores.email)) erros.email = 'Informe um e-mail válido.';
  if (valores.senha.length < 6) erros.senha = 'A senha precisa de pelo menos 6 caracteres.';
  if (valores.senha !== valores.confirmacao) {
    erros.confirmacao = 'A confirmação não bate com a senha.';
  }
  if (!clinicaId) erros.clinicaId = 'Escolha a clínica que atende o seu pet.';
  return erros;
}

export function paraTutorRequest(valores: CadastroTutorValues, clinicaId: number): TutorRequest {
  return {
    nome: valores.nome.trim(),
    email: valores.email.trim().toLowerCase(),
    senha: valores.senha,
    clinicaId,
    telefone: valores.telefone.replace(/\D/g, '') || undefined,
    canalPreferencial: 'APP',
  };
}
