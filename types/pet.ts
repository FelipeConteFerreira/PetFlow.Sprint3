export type PetSpecies = 'cao' | 'gato' | 'outro';
export type PetSex = 'macho' | 'femea';

export type Pet = {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  weight: string;
  sex: PetSex;
  createdAt: string;
};

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  cao: 'Cão',
  gato: 'Gato',
  outro: 'Outro',
};

export const SPECIES_EMOJI: Record<PetSpecies, string> = {
  cao: '🐕',
  gato: '🐈',
  outro: '🐾',
};

export const SEX_LABELS: Record<PetSex, string> = {
  macho: 'Macho',
  femea: 'Fêmea',
};
