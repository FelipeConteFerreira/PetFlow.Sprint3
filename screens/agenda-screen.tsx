import { Ionicons } from '@expo/vector-icons';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgendamentoCard } from '@/components/agendamento-card';
import { AsyncBoundary, EmptyState } from '@/components/ui/screen-state';
import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';
import { useAgendaScreen } from '@/hooks/screens/use-agenda-screen';
import { useAppNavigation } from '@/navigation/use-app-navigation';
import type { AgendamentoResponse } from '@/types/api';

/**
 * A agenda do tutor — só desenho. Filtro, lista e cancelamento vêm do
 * `useAgendaScreen`; aqui fica apenas o diálogo de confirmação.
 */
export function AgendaScreen() {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const navigation = useAppNavigation();
  const agenda = useAgendaScreen();

  function confirmarCancelamento(agendamento: AgendamentoResponse) {
    Alert.alert(
      'Cancelar agendamento?',
      `A consulta de ${agendamento.petNome ?? 'seu pet'} deixa de valer. A clínica é avisada do cancelamento.`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar consulta',
          style: 'destructive',
          onPress: () => agenda.cancelar(agendamento.id),
        },
      ]
    );
  }

  const estado = AsyncBoundary({
    isLoading: agenda.carregando,
    error: agenda.erro,
    onRetry: agenda.recarregar,
    isRetrying: agenda.atualizando,
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
          onPress={navigation.marcarConsulta}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.filtros}>
        {(['proximos', 'todos'] as const).map((opcao) => (
          <Pressable
            key={opcao}
            onPress={() => agenda.setFiltro(opcao)}
            style={[styles.filtro, agenda.filtro === opcao && styles.filtroAtivo]}>
            <Text
              style={[styles.filtroTexto, agenda.filtro === opcao && styles.filtroTextoAtivo]}>
              {opcao === 'proximos' ? 'Próximas' : 'Histórico'}
            </Text>
          </Pressable>
        ))}
      </View>

      {agenda.erroAcao ? <Text style={styles.erroAcao}>{agenda.erroAcao}</Text> : null}

      {estado ?? (
        <FlatList
          data={agenda.visiveis}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={agenda.visiveis.length ? styles.lista : styles.listaVazia}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={agenda.atualizando}
              onRefresh={agenda.recarregar}
              tintColor={cores.primary}
              colors={[cores.primary]}
            />
          }
          ListEmptyComponent={
            agenda.semPets ? (
              <EmptyState
                emoji="🐾"
                title="Cadastre um pet primeiro"
                description="A agenda mostra as consultas dos seus pets. Cadastre um pet para poder marcar a primeira."
                actionLabel="Cadastrar pet"
                onAction={navigation.novoPet}
              />
            ) : agenda.filtro === 'proximos' ? (
              <EmptyState
                emoji="📅"
                title="Nenhuma consulta marcada"
                description="Você não tem consultas futuras. Toque em marcar consulta para escolher pet, veterinário e horário."
                actionLabel="Marcar consulta"
                onAction={navigation.marcarConsulta}
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
              onPress={() => navigation.remarcarConsulta(item.id)}
              onCancelar={() => confirmarCancelamento(item)}
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
      backgroundColor: cores.card,
      borderWidth: 1,
      borderColor: cores.border,
    },
    filtroAtivo: { backgroundColor: cores.text, borderColor: cores.text },
    filtroTexto: { fontSize: 13, fontWeight: '600', color: cores.textSecondary },
    filtroTextoAtivo: { color: '#fff' },
    erroAcao: {
      marginHorizontal: Spacing.xl,
      marginBottom: Spacing.md,
      fontSize: 13,
      color: cores.danger,
    },
    lista: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.md },
    listaVazia: { flexGrow: 1 },
  });
}
