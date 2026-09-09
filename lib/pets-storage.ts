import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Pet } from '@/types/pet';

const STORAGE_KEY = '@petflow/pets';

export async function getPets(): Promise<Pet[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Pet[];
  } catch {
    return [];
  }
}

export async function savePet(pet: Pet): Promise<void> {
  const pets = await getPets();
  pets.push(pet);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
}

export async function clearPets(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
