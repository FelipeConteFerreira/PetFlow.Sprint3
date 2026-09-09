import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReminderCard } from '@/components/reminder-card';
import { PetFlowColors } from '@/constants/petflow';
import { getPets } from '@/lib/pets-storage';
import { sortRemindersByDate } from '@/lib/reminder-utils';
import { deleteReminder, getReminders } from '@/lib/reminders-storage';
import type { Pet } from '@/types/pet';
import type { Reminder } from '@/types/reminder';
import { SPECIES_LABELS } from '@/types/pet';

export default function RemindersScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  const load = useCallback(() => {
    Promise.all([getReminders(), getPets()]).then(([r, p]) => {
      setReminders(sortRemindersByDate(r));
      setPets(p);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const getPetSubtitle = (reminder: Reminder) => {
    const pet = pets.find((p) => p.id === reminder.petId);
    if (!pet) return reminder.petName;
    return `${pet.name} · ${pet.breed} · ${SPECIES_LABELS[pet.species]}`;
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Lembretes</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/cadastrar-lembrete')}>
          <Feather name="plus" size={22} color="#fff" />
        </Pressable>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={48} color={PetFlowColors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum lembrete</Text>
          <Text style={styles.emptySubtitle}>
            Crie lembretes de vacinas, medicamentos e check-ups.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push('/cadastrar-lembrete')}>
            <Text style={styles.emptyButtonText}>Novo Lembrete</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View>
              <ReminderCard reminder={item} petSubtitle={getPetSubtitle(item)} />
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Feather name="trash-2" size={14} color="#DC2626" />
                <Text style={styles.deleteText}>Excluir</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PetFlowColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: PetFlowColors.text },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PetFlowColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PetFlowColors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: PetFlowColors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: PetFlowColors.blue,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
    padding: 4,
  },
  deleteText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
});
