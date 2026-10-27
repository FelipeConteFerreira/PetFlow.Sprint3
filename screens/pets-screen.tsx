import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetCard } from '@/components/pet-card';
import { AsyncBoundary, EmptyState } from '@/components/ui/screen-state';
import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';
import { usePets } from '@/hooks/use-pets';
import { useAppNavigation } from '@/navigation/use-app-navigation';

/**
 * Meus pets — lista vinda de `GET /api/tutor/pets`.
 *
 * Não há `useState` guardando a lista nem `useFocusEffect` recarregando na
 * mão: quem traz o dado é o `usePets`, e quem atualiza depois de um cadastro,
 * de uma edição ou de uma remoção é a invalidação de cache das mutations.
 */
export function PetsScreen() {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const navigation = useAppNavigation();
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
          onPress={navigation.novoPet}>
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
              tintColor={cores.primary}
              colors={[cores.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Nenhum pet por aqui ainda"
              description="Cadastre seu primeiro pet para acompanhar vacinas, consultas e agendamentos em um lugar só."
              actionLabel="Cadastrar pet"
              onAction={navigation.novoPet}
            />
          }
          renderItem={({ item }) => (
            <PetCard
              pet={item}
              onPress={() => navigation.abrirPet(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function criarEstilos(cores: Paleta) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: cores.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.lg,
    },
    titulo: { fontSize: 26, fontWeight: '800', color: cores.text, letterSpacing: -0.4 },
    subtitulo: { fontSize: 13, color: cores.textSecondary, marginTop: 2 },
    adicionar: {
      width: 46,
      height: 46,
      borderRadius: Radius.md,
      backgroundColor: cores.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressionado: { opacity: 0.8 },
    lista: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.md },
    listaVazia: { flexGrow: 1 },
  });
}
