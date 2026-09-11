import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgendamentoCard } from '@/components/agendamento-card';
import { AsyncBoundary, EmptyState } from '@/components/ui/screen-state';
import { PetFlowColors, Radius, Spacing, shadow } from '@/constants/petflow';
import { useAgendamentos, useCancelarAgendamento } from '@/hooks/use-agendamentos';
import { usePets } from '@/hooks/use-pets';
import { getErrorMessage } from '@/lib/api/errors';
import { hojeISO, porDataHora } from '@/lib/formatters';
import type { AgendamentoResponse } from '@/types/api';

/**
 * A agenda do tutor — `GET /api/tutor/agendamentos`.
 *
 * Esta aba era "Lembretes", guardados em AsyncStorage e sem nenhum equivalente
 * no backend. Virou o que a API realmente tem: as consultas marcadas dos pets
 * do próprio tutor, com marcar, remarcar e cancelar.
 */
export default function AgendamentosScreen() {
  const router = useRouter();
  const { data: agendamentos, isPending, isFetching, error, refetch } = useAgendamentos();
  const pets = usePets();
  const cancelar = useCancelarAgendamento();
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'proximos' | 'todos'>('proximos');

  const hoje = hojeISO();

  const visiveis = useMemo(() => {
    const lista = [...(agendamentos ?? [])].sort(porDataHora);
    if (filtro === 'todos') return lista.reverse();
    return lista.filter((a) => a.dtAgendamento >= hoje && a.status !== 'CANCELADO');
  }, [agendamentos, filtro, hoje]);

  const semPets = !pets.isPending && (pets.data?.length ?? 0) === 0;

  function confirmarCancelamento(agendamento: AgendamentoResponse) {
    Alert.alert(
      'Cancelar agendamento?',
      `A consulta de ${agendamento.petNome ?? 'seu pet'} deixa de valer. A clínica é avisada do cancelamento.`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar consulta',
          style: 'destructive',
          onPress: () => {
            setErroAcao(null);
            cancelar.mutate(agendamento.id, {
              onError: (err) => setErroAcao(getErrorMessage(err)),
            });
          },
        },
      ]
    );
  }

  const estado = AsyncBoundary({
    isLoading: isPending,
    error,
    onRetry: () => refetch(),
    isRetrying: isFetching,
    loadingLabel: 'Carregando sua agenda…',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Agenda</Text>
          <Text style={styles.subtitulo}>Consultas dos seus pets</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.adicionar, shadow(1), pressed && styles.pressionado]}
          accessibilityLabel="Marcar consulta"
          onPress={() => router.push('/agendar')}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.filtros}>
        {(['proximos', 'todos'] as const).map((opcao) => (
          <Pressable
            key={opcao}
            onPress={() => setFiltro(opcao)}
            style={[styles.filtro, filtro === opcao && styles.filtroAtivo]}>
            <Text style={[styles.filtroTexto, filtro === opcao && styles.filtroTextoAtivo]}>
              {opcao === 'proximos' ? 'Próximas' : 'Histórico'}
            </Text>
          </Pressable>
        ))}
      </View>

      {erroAcao ? <Text style={styles.erroAcao}>{erroAcao}</Text> : null}

      {estado ?? (
        <FlatList
          data={visiveis}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={visiveis.length ? styles.lista : styles.listaVazia}
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
            semPets ? (
              <EmptyState
                emoji="🐾"
                title="Cadastre um pet primeiro"
                description="A agenda mostra as consultas dos seus pets. Cadastre um pet para poder marcar a primeira."
                actionLabel="Cadastrar pet"
                onAction={() => router.push('/cadastrar-pet')}
              />
            ) : filtro === 'proximos' ? (
              <EmptyState
                emoji="📅"
                title="Nenhuma consulta marcada"
                description="Você não tem consultas futuras. Toque em marcar consulta para escolher pet, veterinário e horário."
                actionLabel="Marcar consulta"
                onAction={() => router.push('/agendar')}
              />
            ) : (
              <EmptyState
                emoji="🗂️"
                title="Sem histórico ainda"
                description="Assim que a primeira consulta for marcada, ela aparece aqui — inclusive depois de realizada ou cancelada."
              />
            )
          }
          renderItem={({ item }) => (
            <AgendamentoCard
              agendamento={item}
              onPress={() =>
                router.push({ pathname: '/agendar', params: { id: String(item.id) } })
              }
              onCancelar={() => confirmarCancelamento(item)}
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
  filtros: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  filtro: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: PetFlowColors.card,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
  },
  filtroAtivo: { backgroundColor: PetFlowColors.text, borderColor: PetFlowColors.text },
  filtroTexto: { fontSize: 13, fontWeight: '600', color: PetFlowColors.textSecondary },
  filtroTextoAtivo: { color: '#fff' },
  erroAcao: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    fontSize: 13,
    color: PetFlowColors.danger,
  },
  lista: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.md },
  listaVazia: { flexGrow: 1 },
});
