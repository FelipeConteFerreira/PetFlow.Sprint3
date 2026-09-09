import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Reminder } from '@/types/reminder';

const STORAGE_KEY = '@petflow/reminders';

export async function getReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Reminder[];
  } catch {
    return [];
  }
}

export async function saveReminder(reminder: Reminder): Promise<void> {
  const reminders = await getReminders();
  reminders.push(reminder);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export async function deleteReminder(id: string): Promise<void> {
  const reminders = await getReminders();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(reminders.filter((r) => r.id !== id))
  );
}
