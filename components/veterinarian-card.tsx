import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PetFlowColors } from '@/constants/petflow';
import type { Veterinarian } from '@/types/veterinarian';
import { SPECIALTY_LABELS } from '@/types/veterinarian';

type Props = {
  vet: Veterinarian;
  onPress?: () => void;
  onCall?: () => void;
};

export function VeterinarianCard({ vet, onPress, onCall }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={[styles.avatar, !vet.active && styles.avatarInactive]}>
        <MaterialCommunityIcons
          name="stethoscope"
          size={24}
          color={vet.active ? PetFlowColors.blue : PetFlowColors.textMuted}
        />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{vet.name}</Text>
          {!vet.active ? (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Inativo</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.meta}>
          {SPECIALTY_LABELS[vet.specialty]}
          {vet.crmv ? ` · CRMV ${vet.crmv}` : ''}
        </Text>
        {vet.phone ? <Text style={styles.phone}>{vet.phone}</Text> : null}
      </View>
      {onCall && vet.phone ? (
        <Pressable style={styles.callButton} onPress={onCall} hitSlop={8}>
          <Feather name="phone" size={18} color={PetFlowColors.blue} />
        </Pressable>
      ) : onPress ? (
        <Feather name="chevron-right" size={20} color={PetFlowColors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: PetFlowColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
  },
  pressed: { opacity: 0.85 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EBF4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInactive: {
    backgroundColor: PetFlowColors.infoBg,
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: PetFlowColors.text,
  },
  inactiveBadge: {
    backgroundColor: PetFlowColors.infoBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveText: {
    fontSize: 11,
    fontWeight: '600',
    color: PetFlowColors.textMuted,
  },
  meta: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    marginTop: 2,
  },
  phone: {
    fontSize: 13,
    color: PetFlowColors.blue,
    marginTop: 4,
    fontWeight: '500',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
