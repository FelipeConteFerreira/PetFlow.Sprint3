import type { Reminder } from '@/types/reminder';

export function parseDateInput(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const months = [
    'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
    'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.',
  ];
  return `${day} de ${months[month - 1]} de ${year}`;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getReminderDateTime(reminder: Reminder): Date {
  const [year, month, day] = reminder.date.split('-').map(Number);
  const [hours, minutes] = reminder.time.split(':').map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

export function sortRemindersByDate(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort(
    (a, b) => getReminderDateTime(a).getTime() - getReminderDateTime(b).getTime()
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDateBadge(isoDate: string): string {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(isoDate + 'T12:00:00'));
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff === -1) return 'Ontem';
  if (diff > 1 && diff <= 7) return `Em ${diff} dias`;
  if (diff < -1) return 'Atrasado';
  return '';
}

export function isReminderToday(reminder: Reminder): boolean {
  const today = toIsoDate(new Date());
  return reminder.date === today;
}

export function countRemindersToday(reminders: Reminder[]): number {
  return reminders.filter(isReminderToday).length;
}

export function getNextReminder(reminders: Reminder[]): Reminder | null {
  const now = new Date();
  const upcoming = sortRemindersByDate(reminders).filter(
    (r) => getReminderDateTime(r) >= now
  );
  return upcoming[0] ?? sortRemindersByDate(reminders)[0] ?? null;
}

export function maskDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function maskTimeInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
