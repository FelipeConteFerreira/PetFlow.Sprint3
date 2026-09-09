export type ApiUserTipo = 'TUTOR' | 'VETERINARIO' | 'COLABORADOR';

export type LoginRequest = {
  email: string;
  senha: string;
  tipo: ApiUserTipo;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tipo: ApiUserTipo;
  id: number;
  nome: string;
  email: string;
};

export type TutorRegisterRequest = {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  telefoneEmergencia?: string;
  canalPreferencial?: 'APP' | 'WEB' | 'WHATSAPP';
};

export type TutorApi = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  telefoneEmergencia?: string;
  canalPreferencial?: string;
  dtCadastro?: string;
};

export type ClinicaRegisterRequest = {
  nome: string;
  cnpj: string;
  logradouro: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
};

export type ClinicaApi = {
  id: number;
  nome: string;
  cnpj: string;
  logradouro: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
};

export type VeterinarioRegisterRequest = {
  nome: string;
  crmv: string;
  especialidade?: string;
  clinicaId: number;
  email: string;
  senha: string;
};

export type VeterinarioApi = {
  id: number;
  nome: string;
  crmv: string;
  especialidade?: string;
  clinicaId: number;
  clinicaNome?: string;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
