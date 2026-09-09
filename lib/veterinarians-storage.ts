import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Veterinarian } from '@/types/veterinarian';

const STORAGE_KEY = '@petflow/veterinarians';

export async function getVeterinarians(): Promise<Veterinarian[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Veterinarian[];
  } catch {
    return [];
  }
}

export async function saveVeterinarian(vet: Veterinarian): Promise<void> {
  const list = await getVeterinarians();
  list.push(vet);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function updateVeterinarian(vet: Veterinarian): Promise<void> {
  const list = await getVeterinarians();
  const index = list.findIndex((v) => v.id === vet.id);
  if (index === -1) {
    await saveVeterinarian(vet);
    return;
  }
  list[index] = vet;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function deleteVeterinarian(id: string): Promise<void> {
  const list = await getVeterinarians();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(list.filter((v) => v.id !== id))
  );
}

export async function getVeterinarianById(id: string): Promise<Veterinarian | null> {
  const list = await getVeterinarians();
  return list.find((v) => v.id === id) ?? null;
}

export async function clearVeterinarians(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
