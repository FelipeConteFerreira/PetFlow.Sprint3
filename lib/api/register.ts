import type { LoginResponse } from '@/types/api';
import type { TutorProfile } from '@/types/profile';

import { login } from './auth';
import { registerClinica } from './clinicas';
import { getErrorMessage } from './errors';
import { registerTutor } from './tutores';
import { registerVeterinario } from './veterinarios';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export type TutorSignupInput = {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
};

export async function signupTutorAndLogin(
  input: TutorSignupInput
): Promise<{ session: LoginResponse; profile: Partial<TutorProfile> }> {
  const tutor = await registerTutor({
    nome: input.nome,
    email: input.email,
    senha: input.senha,
    telefone: input.telefone,
    canalPreferencial: 'APP',
  });

  const session = await login({
    email: input.email,
    senha: input.senha,
    tipo: 'TUTOR',
  });

  return {
    session,
    profile: {
      name: tutor.nome,
      email: tutor.email,
      userType: 'tutor',
      apiUserId: tutor.id,
      avatarEmoji: '🐾',
      onboardingCompleted: true,
    },
  };
}

export type ClinicaSignupInput = {
  nomeClinica: string;
  cnpj: string;
  logradouro: string;
  cidade: string;
  estado: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  telefoneClinica?: string;
  nomeResponsavel: string;
  crmv: string;
  email: string;
  senha: string;
};

export async function signupClinicaAndLogin(
  input: ClinicaSignupInput
): Promise<{ session: LoginResponse; profile: Partial<TutorProfile> }> {
  const cnpj = onlyDigits(input.cnpj);
  const cep = input.cep ? onlyDigits(input.cep) : undefined;

  const clinica = await registerClinica({
    nome: input.nomeClinica,
    cnpj,
    logradouro: input.logradouro,
    cidade: input.cidade,
    estado: input.estado.toUpperCase().slice(0, 2),
    numero: input.numero,
    bairro: input.bairro,
    cep,
    telefone: input.telefoneClinica,
  });

  await registerVeterinario({
    nome: input.nomeResponsavel,
    crmv: input.crmv.trim(),
    clinicaId: clinica.id,
    email: input.email,
    senha: input.senha,
    especialidade: 'Clínico geral',
  });

  const session = await login({
    email: input.email,
    senha: input.senha,
    tipo: 'VETERINARIO',
  });

  return {
    session,
    profile: {
      name: clinica.nome,
      email: input.email,
      userType: 'clinica',
      apiUserId: session.id,
      apiClinicaId: clinica.id,
      clinicPhone: clinica.telefone ?? input.telefoneClinica,
      clinicAddress: [clinica.logradouro, clinica.numero, clinica.cidade, clinica.estado]
        .filter(Boolean)
        .join(', '),
      avatarEmoji: '🏥',
      onboardingCompleted: true,
    },
  };
}

export { getErrorMessage };
