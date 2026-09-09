import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetFlowColors } from '@/constants/petflow';
import { getPets } from '@/lib/pets-storage';
import type { Pet } from '@/types/pet';
import { SEX_LABELS, SPECIES_EMOJI, SPECIES_LABELS } from '@/types/pet';

export default function PetsScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);

  useFocusEffect(
    useCallback(() => {
      getPets().then(setPets);
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pets</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/cadastrar-pet')}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </Pressable>
      </View>

      {pets.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
          <Text style={styles.emptySubtitle}>Toque em + para cadastrar seu primeiro pet.</Text>
          <Pressable style={styles.emptyButton} onPress={() => router.push('/cadastrar-pet')}>
            <Text style={styles.emptyButtonText}>Cadastrar Pet</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.petCard}>
              <Text style={styles.petEmoji}>{SPECIES_EMOJI[item.species]}</Text>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petDetail}>
                  {item.breed} · {SPECIES_LABELS[item.species]} · {SEX_LABELS[item.sex]}
                </Text>
                <Text style={styles.petMeta}>
                  {item.age} {item.age === '1' ? 'ano' : 'anos'}
                  {item.weight ? ` · ${item.weight} kg` : ''}
                </Text>
              </View>
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
    backgroundColor: PetFlowColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: PetFlowColors.text },
  emptySubtitle: {
    fontSize: 14,
    color: PetFlowColors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: PetFlowColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 20, gap: 12 },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: PetFlowColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    marginBottom: 12,
  },
  petEmoji: { fontSize: 40 },
  petInfo: { flex: 1 },
  petName: { fontSize: 18, fontWeight: '700', color: PetFlowColors.primary },
  petDetail: { fontSize: 13, color: PetFlowColors.textSecondary, marginTop: 4 },
  petMeta: { fontSize: 12, color: PetFlowColors.textMuted, marginTop: 4 },
});
