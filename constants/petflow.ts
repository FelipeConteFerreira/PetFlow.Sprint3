import { Platform, type ViewStyle } from 'react-native';

export const PetFlowColors = {
  primary: '#2E9B5B',
  primaryDark: '#248A4E',
  primarySoft: '#E8F5EC',
  orange: '#F5A623',
  orangeSoft: '#FFF4E3',
  blue: '#4A90D9',
  blueDark: '#3A7FC8',
  blueSoft: '#EAF2FB',
  danger: '#DC2626',
  dangerSoft: '#FEECEC',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  background: '#F8FAF9',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  badge: '#E8915A',
  badgeBg: '#FFF4ED',
  aiBg: '#E8F5EC',
  aiBorder: '#C8E6D0',
  infoBg: '#F3F4F6',
};

/** Escala de espaçamento. Múltiplos de 4: o olho percebe o ritmo. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
};

/**
 * Elevação discreta. iOS e Android descrevem sombra de formas diferentes;
 * `elevation` sozinho não aparece no iOS e `shadowColor` sozinho não aparece
 * no Android, então os dois andam juntos.
 */
export function shadow(nivel: 1 | 2 = 1): ViewStyle {
  const config = {
    1: { opacity: 0.05, radius: 8, offset: 2, elevation: 1 },
    2: { opacity: 0.09, radius: 16, offset: 6, elevation: 4 },
  }[nivel];

  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOpacity: config.opacity,
      shadowRadius: config.radius,
      shadowOffset: { width: 0, height: config.offset },
    },
    android: { elevation: config.elevation },
    default: {},
  }) as ViewStyle;
}
