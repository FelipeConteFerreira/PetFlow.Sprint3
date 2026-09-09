import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VeterinarianCard } from '@/components/veterinarian-card';
import { PetFlowColors } from '@/constants/petflow';
import { deleteVeterinarian, getVeterinarians } from '@/lib/veterinarians-storage';
import type { Veterinarian } from '@/types/veterinarian';

export default function VeterinariansScreen() {
  const router = useRouter();
  const [vets, setVets] = useState<Veterinarian[]>([]);

  const load = useCallback(() => {
    getVeterinarians().then(setVets);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const activeCount = vets.filter((v) => v.active).length;

  const callPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return;
    Linking.openURL(`tel:${digits}`);
  };

  const confirmDelete = (vet: Veterinarian) => {
    Alert.alert(
      'Remover veterinário?',
      `${vet.name} será removido da equipe da clínica.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await deleteVeterinarian(vet.id);
            load();
          },
        },
      ]
    );
  };

  const openActions = (vet: Veterinarian) => {
    Alert.alert(vet.name, 'O que deseja fazer?', [
      {
        text: 'Editar',
        onPress: () => router.push({ pathname: '/cadastrar-veterinario', params: { id: vet.id } }),
      },
      { text: 'Remover', style: 'destructive', onPress: () => confirmDelete(vet) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Equipe</Text>
          <Text style={styles.subtitle}>
            {vets.length === 0
              ? 'Cadastre os veterinários da clínica'
              : `${activeCount} ativo${activeCount !== 1 ? 's' : ''} · ${vets.length} no total`}
          </Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/cadastrar-veterinario')}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </Pressable>
      </View>

      {vets.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="stethoscope"
            size={56}
            color={PetFlowColors.textMuted}
          />
          <Text style={styles.emptyTitle}>Nenhum veterinário</Text>
          <Text style={styles.emptySubtitle}>
            Adicione os profissionais que atendem na sua clínica.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push('/cadastrar-veterinario')}>
            <Text style={styles.emptyButtonText}>Cadastrar veterinário</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <VeterinarianCard
              vet={item}
              onPress={() => openActions(item)}
              onCall={() => callPhone(item.phone)}
            />
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
  subtitle: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    marginTop: 4,
  },
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
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  separator: { height: 10 },
});
