import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PetFlowColors, Radius, Spacing } from '@/constants/petflow';

/** Cabeçalho das telas empilhadas: voltar, título e uma ação opcional. */
export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void };
}) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
        style={({ pressed }) => [styles.icone, pressed && styles.pressionado]}
        accessibilityLabel="Voltar"
        hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={PetFlowColors.text} />
      </Pressable>

      <View style={styles.textos}>
        <Text style={styles.titulo} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitulo} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action ? (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [styles.icone, pressed && styles.pressionado]}
          accessibilityLabel={action.label}
          hitSlop={12}>
          <Ionicons name={action.icon} size={22} color={PetFlowColors.text} />
        </Pressable>
      ) : (
        <View style={styles.icone} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: PetFlowColors.background,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: 0.6 },
  textos: { flex: 1, alignItems: 'center' },
  titulo: { fontSize: 17, fontWeight: '700', color: PetFlowColors.text },
  subtitulo: { fontSize: 12, color: PetFlowColors.textSecondary, marginTop: 2 },
});
