import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PetFlowColors } from '@/constants/petflow';
import { formatDateBR, getDateBadge } from '@/lib/reminder-utils';
import type { Reminder, ReminderType } from '@/types/reminder';

const TYPE_ICONS: Record<
  ReminderType,
  { set: 'mci' | 'ion'; name: string }
> = {
  vacina: { set: 'mci', name: 'needle' },
  medicamento: { set: 'mci', name: 'pill' },
  checkup: { set: 'ion', name: 'medical-outline' },
  outro: { set: 'ion', name: 'notifications-outline' },
};

type Props = {
  reminder: Reminder;
  petSubtitle?: string;
};

export function ReminderCard({ reminder, petSubtitle }: Props) {
  const badge = getDateBadge(reminder.date);
  const icon = TYPE_ICONS[reminder.type];

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          {icon.set === 'mci' ? (
            <MaterialCommunityIcons
              name={icon.name as 'needle'}
              size={22}
              color={PetFlowColors.primary}
            />
          ) : (
            <Ionicons
              name={icon.name as 'medical-outline'}
              size={22}
              color={PetFlowColors.primary}
            />
          )}
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{reminder.title}</Text>
            {badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </View>
          {petSubtitle ? <Text style={styles.pet}>{petSubtitle}</Text> : (
            <Text style={styles.pet}>{reminder.petName}</Text>
          )}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={PetFlowColors.textMuted} />
            <Text style={styles.date}>
              {formatDateBR(reminder.date)} • {reminder.time}
            </Text>
          </View>
        </View>
      </View>
      {reminder.notes ? (
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={PetFlowColors.textSecondary} />
          <Text style={styles.infoText}>{reminder.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PetFlowColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    marginBottom: 12,
  },
  top: { flexDirection: 'row', gap: 12 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: PetFlowColors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: PetFlowColors.badgeBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: PetFlowColors.badge,
  },
  pet: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  date: { fontSize: 12, color: PetFlowColors.textMuted },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PetFlowColors.infoBg,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  infoText: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    flex: 1,
  },
});
