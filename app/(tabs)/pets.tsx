import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetCard } from '@/components/pet-card';
import { AsyncBoundary, EmptyState } from '@/components/ui/screen-state';
import { PetFlowColors, Radius, Spacing, shadow } from '@/constants/petflow';
import { usePets } from '@/hooks/use-pets';

/**
 * Meus pets — lista vinda de `GET /api/tutor/pets`.
 *
 * Não há `useState` guardando a lista nem `useFocusEffect` recarregando na
 * mão: quem traz o dado é o `usePets`, e quem atualiza depois de um cadastro,
 * de uma edição ou de uma remoção é a invalidação de cache das mutations.
 */
export default function PetsScreen() {
  const router = useRouter();
  const { data: pets, isPending, isFetching, error, refetch } = usePets();

  const estado = AsyncBoundary({
    isLoading: isPending,
    error,
    onRetry: () => refetch(),
    isRetrying: isFetching,
    loadingLabel: 'Buscando seus pets…',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Meus pets</Text>
          {pets?.length ? (
            <Text style={styles.subtitulo}>
              {pets.length} {pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={({ pressed }) => [styles.adicionar, shadow(1), pressed && styles.pressionado]}
          accessibilityLabel="Cadastrar pet"
          onPress={() => router.push('/cadastrar-pet')}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {estado ?? (
        <FlatList
          data={pets}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={pets?.length ? styles.lista : styles.listaVazia}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={PetFlowColors.primary}
              colors={[PetFlowColors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Nenhum pet por aqui ainda"
              description="Cadastre seu primeiro pet para acompanhar vacinas, consultas e agendamentos em um lugar só."
              actionLabel="Cadastrar pet"
              onAction={() => router.push('/cadastrar-pet')}
            />
          }
          renderItem={({ item }) => (
            <PetCard
              pet={item}
              onPress={() =>
                router.push({ pathname: '/pet/[id]', params: { id: String(item.id) } })
              }
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  titulo: { fontSize: 26, fontWeight: '800', color: PetFlowColors.text, letterSpacing: -0.4 },
  subtitulo: { fontSize: 13, color: PetFlowColors.textSecondary, marginTop: 2 },
  adicionar: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: PetFlowColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: 0.8 },
  lista: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.md },
  listaVazia: { flexGrow: 1 },
});
