export type VetSpecialty =
  | 'clinico_geral'
  | 'cirurgia'
  | 'dermatologia'
  | 'cardiologia'
  | 'ortopedia'
  | 'odontologia'
  | 'outro';

export type Veterinarian = {
  id: string;
  name: string;
  crmv: string;
  specialty: VetSpecialty;
  phone: string;
  email: string;
  active: boolean;
  createdAt: string;
};

export const SPECIALTY_LABELS: Record<VetSpecialty, string> = {
  clinico_geral: 'Clínico geral',
  cirurgia: 'Cirurgia',
  dermatologia: 'Dermatologia',
  cardiologia: 'Cardiologia',
  ortopedia: 'Ortopedia',
  odontologia: 'Odontologia',
  outro: 'Outro',
};

export const SPECIALTY_OPTIONS: VetSpecialty[] = [
  'clinico_geral',
  'cirurgia',
  'dermatologia',
  'cardiologia',
  'ortopedia',
  'odontologia',
  'outro',
];
