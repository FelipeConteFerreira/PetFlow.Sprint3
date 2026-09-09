import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PROFILE, type TutorProfile } from '@/types/profile';

const STORAGE_KEY = '@petflow/profile';

export async function getProfile(): Promise<TutorProfile> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_PROFILE };
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(profile: TutorProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function setOnboardingCompleted(userType: 'tutor' | 'clinica'): Promise<void> {
  const profile = await getProfile();
  await saveProfile({ ...profile, userType, onboardingCompleted: true });
}

export async function clearAllAppData(): Promise<void> {
  const keys = [
    STORAGE_KEY,
    '@petflow/auth',
    '@petflow/pets',
    '@petflow/reminders',
    '@petflow/veterinarians',
  ];
  await AsyncStorage.multiRemove(keys);
}
