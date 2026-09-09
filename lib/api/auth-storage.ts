import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LoginResponse } from '@/types/api';

const STORAGE_KEY = '@petflow/auth';

export type AuthSession = LoginResponse;

export async function getAuthSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.accessToken ?? null;
}
