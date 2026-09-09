// Contratos reais da Clyvo Vet API, extraídos do OpenAPI (/v3/api-docs).
// Base: https://clyvo-vet-api-java.onrender.com/api

// ---------- Paginação (Spring Page) ----------

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export type PageParams = { page?: number; size?: number; sort?: string };

// ---------- Autenticação ----------

export type ApiUserTipo = 'TUTOR' | 'VETERINARIO' | 'COLABORADOR';

export type LoginRequest = { email: string; senha: string; tipo: ApiUserTipo };

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tipo: ApiUserTipo;
  id: number;
  nome: string;
  email: string;
};

export type TokenRefreshRequest = { refreshToken: string };

// ---------- Tutor ----------

export type CanalPreferencial = 'APP' | 'WEB' | 'WHATSAPP';

export type TutorRequest = {
  nome: string;
  email: string;
  senha: string;
  clinicaId: number;
  telefone?: string;
  telefoneEmergencia?: string;
  canalPreferencial?: CanalPreferencial;
};

export type TutorResponse = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  telefoneEmergencia?: string;
  canalPreferencial?: CanalPreferencial;
  dtCadastro?: string;
  clinicaId: number;
};

// ---------- Pet ----------

export type PetSexo = 'M' | 'F' | 'I';
export type PetPorte = 'MINI' | 'PEQUENO' | 'MEDIO' | 'GRANDE' | 'GIGANTE';
export type PetStatus = 'ATIVO' | 'EM_TRATAMENTO' | 'OBITO' | 'PERDIDO';

export type PetRequest = {
  nome: string;
  tutorId: number;
  racaId: number;
  dtNascimento?: string; // yyyy-MM-dd
  sexo?: PetSexo;
  microchip?: string;
  rga?: string;
  pelagem?: string;
  porte?: PetPorte;
  castrado?: boolean;
  status?: PetStatus;
  observacaoGeral?: string;
};

export type PetResponse = {
  id: number;
  nome: string;
  dtNascimento?: string;
  sexo?: PetSexo;
  microchip?: string;
  rga?: string;
  pelagem?: string;
  porte?: PetPorte;
  castrado?: boolean;
  status?: PetStatus;
  observacaoGeral?: string;
  tutorId: number;
  tutorNome?: string;
  racaId: number;
  racaNome?: string;
  clinicaId?: number;
};

// ---------- Agendamento ----------

export type AgendamentoStatus = 'SOLICITADO' | 'CONFIRMADO' | 'CANCELADO' | 'REALIZADO';

export type AgendamentoRequest = {
  dtAgendamento: string; // yyyy-MM-dd
  hrAgendamento: string; // HH:mm:ss
  petId: number;
  veterinarioId: number;
  status?: AgendamentoStatus;
  canalOrigem?: CanalPreferencial;
  motivoCancelamento?: string;
  consultaId?: number;
};

export type AgendamentoResponse = {
  id: number;
  dtAgendamento: string;
  hrAgendamento: string;
  status: AgendamentoStatus;
  canalOrigem?: CanalPreferencial;
  motivoCancelamento?: string;
  petId: number;
  petNome?: string;
  veterinarioId: number;
  veterinarioNome?: string;
  consultaId?: number;
};

// ---------- Obrigação (motor de protocolos) ----------

export type ObrigacaoStatus =
  | 'PREVISTA'
  | 'NOTIFICADA'
  | 'RESPONDIDA'
  | 'AGENDADA'
  | 'CUMPRIDA'
  | 'PERDIDA'
  | 'CANCELADA';

export type ProtocoloCategoria =
  | 'VACINA'
  | 'VERMIFUGO'
  | 'CIRURGIA'
  | 'EXAME'
  | 'ODONTO'
  | 'CHECKUP'
  | 'MONITORAMENTO'
  | 'RETORNO';

export type ObrigacaoResponse = {
  id: number;
  petId: number;
  petNome?: string;
  etapaId?: number;
  etapaNome?: string;
  protocoloCodigo?: string;
  protocoloNome?: string;
  protocoloCategoria?: ProtocoloCategoria;
  status: ObrigacaoStatus;
  dtPrevista: string;
  dtJanelaInicio?: string;
  dtJanelaFim?: string;
  grupoControle?: boolean;
  valorEstimado?: number;
  valorRealizado?: number;
};

export type ObrigacaoFiltro = {
  status?: ObrigacaoStatus;
  de?: string;
  ate?: string;
  petId?: number;
};

// ---------- Catálogo (alimenta os formulários) ----------

export type EspecieResponse = { id: number; nome: string };
export type RacaResponse = { id: number; nome: string; especieId?: number; especieNome?: string };
export type ClinicaResponse = { id: number; nome: string };
export type VeterinarioResponse = { id: number; nome: string; crmv?: string; clinicaId?: number };
