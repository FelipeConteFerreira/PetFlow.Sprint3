import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { PetFlowColors } from '@/constants/petflow';

type Props = {
  variant?: 'outline' | 'text';
  accent?: 'green' | 'blue';
  spacingTop?: boolean;
};

export function ChooseProfileTypeButton({
  variant = 'outline',
  accent = 'green',
  spacingTop = false,
}: Props) {
  const router = useRouter();
  const color = accent === 'blue' ? PetFlowColors.blue : PetFlowColors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        variant === 'outline' ? styles.outline : styles.textBtn,
        variant === 'outline' && { borderColor: color },
        spacingTop && styles.spacingTop,
        pressed && styles.pressed,
      ]}
      onPress={() => router.replace('/onboarding')}
      accessibilityRole="button"
      accessibilityLabel="Voltar para escolher Tutor ou Clínica">
      <MaterialCommunityIcons
        name="swap-horizontal"
        size={18}
        color={variant === 'outline' ? color : PetFlowColors.textSecondary}
      />
      <Text
        style={[
          variant === 'outline' ? styles.outlineLabel : styles.textLabel,
          { color: variant === 'outline' ? color : PetFlowColors.textSecondary },
        ]}>
        Tutor ou Clínica
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: PetFlowColors.card,
  },
  textBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  spacingTop: { marginTop: 16 },
  pressed: { opacity: 0.75 },
  outlineLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  textLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
