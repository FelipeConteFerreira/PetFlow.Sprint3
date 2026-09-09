import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PetFlowColors } from '@/constants/petflow';

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
};

export function ProfileMenuRow({ icon, label, subtitle, onPress, danger }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={[styles.iconWrap, danger && styles.iconDanger]}>
        <Feather
          name={icon}
          size={18}
          color={danger ? '#DC2626' : PetFlowColors.primary}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {!danger ? (
        <Feather name="chevron-right" size={20} color={PetFlowColors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PetFlowColors.aiBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDanger: { backgroundColor: '#FEE2E2' },
  textWrap: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600', color: PetFlowColors.text },
  labelDanger: { color: '#DC2626' },
  subtitle: { fontSize: 12, color: PetFlowColors.textSecondary, marginTop: 2 },
});
