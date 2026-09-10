// Contratos reais da Clyvo Vet API (Java/Spring), conferidos contra o
// OpenAPI publicado em /v3/api-docs da instância que o app consome.
//
// Base: <EXPO_PUBLIC_API_URL>/api
//
// O aplicativo do tutor fala com a superfície /api/tutor/**, onde o dono do
// recurso sai do token. Nenhum tipo daqui carrega tutorId de entrada: mandar
// o dono pelo corpo é exatamente o buraco que essa superfície fechou.

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

/**
 * Cadastro de tutor. `clinicaId` é obrigatório na API: o tutor se cadastra
 * *em uma clínica*, e é a lista de `GET /api/clinicas/publicas` que alimenta
 * esse campo na tela — a única leitura aberta da API.
 */
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

/**
 * `INATIVO` é o estado em que o DELETE do aplicativo deixa o pet: ele sai das
 * listagens do tutor e o histórico clínico continua inteiro para a clínica.
 */
export type PetStatus = 'ATIVO' | 'EM_TRATAMENTO' | 'OBITO' | 'PERDIDO' | 'INATIVO';

/**
 * Corpo de POST e PUT em `/api/tutor/pets`.
 *
 * Sem `tutorId` de propósito — o vínculo vem do token. A API ignora o campo se
 * ele for enviado, e o tipo existe para que ninguém tente.
 */
export type PetDoTutorRequest = {
  nome: string;
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

export type PetFichaTecnicaResponse = PetResponse & {
  tutorEmail?: string;
  tutorTelefone?: string;
  especieId?: number;
  especieNome?: string;
};

// ---------- Agendamento ----------

export type AgendamentoStatus = 'SOLICITADO' | 'CONFIRMADO' | 'CANCELADO' | 'REALIZADO';

export type AgendamentoRequest = {
  dtAgendamento: string; // yyyy-MM-dd
  /** HH:mm — a API valida o formato e recusa HH:mm:ss com 422. */
  hrAgendamento: string;
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
  /** Pode vir nulo: a API aceita POST sem status e guarda assim. */
  status?: AgendamentoStatus;
  canalOrigem?: CanalPreferencial;
  motivoCancelamento?: string;
  petId: number;
  petNome?: string;
  veterinarioId: number;
  veterinarioNome?: string;
  consultaId?: number;
};

// ---------- Histórico do pet (leitura) ----------

export type ConsultaStatus = 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'EM_ATENDIMENTO';

export type ConsultaResponse = {
  id: number;
  dtConsulta: string;
  motivo?: string;
  diagnostico?: string;
  status: ConsultaStatus;
  nrValor?: number;
  petId: number;
  petNome?: string;
  veterinarioId?: number;
  veterinarioNome?: string;
};

export type AplicacaoVacinaResponse = {
  id: number;
  petId: number;
  petNome?: string;
  tipoVacinaId: number;
  tipoVacinaNome?: string;
  veterinarioId?: number;
  veterinarioNome?: string;
  consultaId?: number;
  dtAplicacao: string;
  numeroDose?: number;
  lote?: string;
  proximoReforco?: string;
};

// ---------- Catálogo (alimenta os selects dos formulários) ----------

export type EspecieResponse = { id: number; nome: string; descricao?: string };

export type RacaResponse = {
  id: number;
  nome: string;
  dsGrupoRaca?: string;
  dsPortePadrao?: PetPorte;
  flBraquicefalico?: boolean;
  dsPredisposicoes?: string;
  especieId?: number;
  especieNome?: string;
};

export type VeterinarioResponse = {
  id: number;
  nome: string;
  crmv?: string;
  especialidade?: string;
  clinicaId?: number;
  clinicaNome?: string;
};

/** Projeção reduzida servida sem token, só para a tela de cadastro. */
export type ClinicaPublicaResponse = {
  id: number;
  nome: string;
  cidade?: string;
  estado?: string;
};
