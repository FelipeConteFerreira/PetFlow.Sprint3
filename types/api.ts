// Tipos do contrato compartilhado (documento mestre §15).
// PROVISÓRIO nos campos de Pet e Obrigacao: confirmar com o Swagger da API Java.

export type ApiUserTipo = 'TUTOR' | 'VETERINARIO' | 'RECEPCIONISTA';

export type LoginRequest = {
  email: string;
  senha: string;
  tipo?: ApiUserTipo;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tipo: ApiUserTipo;
  id: number;
  nome: string;
  email: string;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

// ---------- Tutor ----------

export type TutorRegisterRequest = {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  telefoneEmergencia?: string;
  canalPreferencial?: 'APP' | 'WEB' | 'WHATSAPP';
};

export type TutorUpdateRequest = Omit<TutorRegisterRequest, 'senha'> & { senha?: string };

export type TutorApi = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  telefoneEmergencia?: string;
  canalPreferencial?: string;
  dtCadastro?: string;
};

// ---------- Pet ----------

export type Especie = 'CANINO' | 'FELINO';
export type Porte = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export type PetRequest = {
  nome: string;
  especie: Especie;
  raca?: string;
  porte?: Porte;
  dtNascimento?: string; // ISO yyyy-MM-dd
  idTutor?: number;
};

export type PetApi = PetRequest & {
  id: number;
  idTutor: number;
};

// ---------- Obrigação ----------

export type ObrigacaoStatus =
  | 'PREVISTA'
  | 'NOTIFICADA'
  | 'RESPONDIDA'
  | 'AGENDADA'
  | 'CUMPRIDA'
  | 'PERDIDA';

export type ObrigacaoApi = {
  id: number;
  idPet: number;
  nomePet?: string;
  nomeProtocolo: string;
  tipoProcedimento?: string;
  dtPrevista: string;
  dtJanelaInicio?: string;
  dtJanelaFim?: string;
  status: ObrigacaoStatus;
};
