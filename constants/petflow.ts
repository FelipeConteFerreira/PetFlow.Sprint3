import { Platform, type ViewStyle } from 'react-native';

/**
 * Cores não ficam aqui: dependem do tema claro/escuro e vêm de `useTema()`
 * (paletas em `constants/theme.ts`). Este arquivo guarda só o que não muda
 * com o tema — espaçamento, raios e sombra.
 */

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
