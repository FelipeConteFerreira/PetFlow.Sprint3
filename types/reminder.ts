export type ReminderType = 'vacina' | 'medicamento' | 'checkup' | 'outro';

export type Reminder = {
  id: string;
  petId: string;
  petName: string;
  type: ReminderType;
  title: string;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
};

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  vacina: 'Vacina',
  medicamento: 'Medicamento',
  checkup: 'Check-up',
  outro: 'Outro',
};
