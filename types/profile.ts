
export type UserType = 'tutor' | 'clinica';


export type TutorProfile = {
  name: string;
  email: string;
  city: string;
  avatarEmoji: string;
  notifyDayBefore: boolean;
  notifyWeekBefore: boolean;
  defaultReminderTime: string;
  vetName: string;
  vetPhone: string;
  emergencyName: string;
  emergencyPhone: string;

  clinicPhone?: string;
  clinicAddress?: string;
  password?: string;
  apiUserId?: number;
  apiClinicaId?: number;
  userType?: UserType;
  onboardingCompleted?: boolean;

};

export const DEFAULT_PROFILE: TutorProfile = {
  name: '',
  email: '',
  city: '',
  avatarEmoji: '🐾',
  notifyDayBefore: true,
  notifyWeekBefore: false,
  defaultReminderTime: '09:00',
  vetName: '',
  vetPhone: '',
  emergencyName: '',
  emergencyPhone: '',

  userType: undefined,
  onboardingCompleted: false,

};

export const AVATAR_OPTIONS = ['🐾', '🐕', '🐈', '😊', '🌿', '💚'];
