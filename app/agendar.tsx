import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect, Field, FormError, Input, PrimaryButton } from '@/components/ui/form';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AsyncBoundary, EmptyState } from '@/components/ui/screen-state';
import { PetFlowColors, Radius, Spacing } from '@/constants/petflow';
import {
  useAgendamento,
  useCreateAgendamento,
  useUpdateAgendamento,
} from '@/hooks/use-agendamentos';
import { useVeterinarios } from '@/hooks/use-catalogo';
import { usePets } from '@/hooks/use-pets';
import { getErrorMessage } from '@/lib/api/errors';
import { hojeISO } from '@/lib/formatters';
import type {
  AgendamentoRequest,
  AgendamentoResponse,
  PetResponse,
  VeterinarioResponse,
} from '@/types/api';

/**
 * Marcar e remarcar consulta, na mesma tela.
 *
 * Com `?id=` é remarcação (PUT); sem id é uma consulta nova (POST).
 *
 * A lista de pets é a do próprio tutor — `GET /api/tutor/pets`. Mandar o pet
 * de outra pessoa não adianta: a API confere o dono e responde 404.
 *
 * Como no cadastro de pet, a tela espera os dados antes de montar o formulário,
 * para que o `useState` já nasça com o valor certo em vez de ser corrigido
 * depois por um efeito.
 */
export default function AgendarScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const agendamentoId = id ? Number(id) : undefined;
  const remarcando =
    typeof agendamentoId === 'number' && Number.isFinite(agendamentoId) && agendamentoId > 0;

  const pets = usePets();
  const veterinarios = useVeterinarios();
  const existente = useAgendamento(remarcando ? agendamentoId : 0);

  const carregando =
    pets.isPending || veterinarios.isPending || (remarcando && existente.isPending);
  const erro = pets.error ?? veterinarios.error ?? (remarcando ? existente.error : null);

  const estado = AsyncBoundary({
    isLoading: carregando,
    error: erro,
    onRetry: () => {
      void pets.refetch();
      void veterinarios.refetch();
      if (remarcando) void existente.refetch();
    },
    isRetrying: pets.isFetching || veterinarios.isFetching,
    loadingLabel: 'Preparando o formulário…',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={remarcando ? 'Remarcar consulta' : 'Marcar consulta'}
        subtitle={remarcando ? existente.data?.petNome : undefined}
      />

      {estado ?? (
        <FormularioAgendamento
          key={remarcando ? agendamentoId : 'novo'}
          agendamento={remarcando ? existente.data : undefined}
          pets={pets.data ?? []}
          veterinarios={veterinarios.data ?? []}
        />
      )}
    </SafeAreaView>
  );
}

function FormularioAgendamento({
  agendamento,
  pets,
  veterinarios,
}: {
  agendamento?: AgendamentoResponse;
  pets: PetResponse[];
  veterinarios: VeterinarioResponse[];
}) {
  const router = useRouter();
  const remarcando = !!agendamento;

  // Um pet só: já vem escolhido, não faz sentido pedir para escolher.
  const petInicial = agendamento?.petId ?? (pets.length === 1 ? pets[0].id : undefined);

  const [petId, setPetId] = useState<number | undefined>(petInicial);
  const [veterinarioId, setVeterinarioId] = useState<number | undefined>(
    agendamento?.veterinarioId
  );
  const [dtAgendamento, setDtAgendamento] = useState(agendamento?.dtAgendamento ?? '');
  const [hrAgendamento, setHrAgendamento] = useState(
    agendamento?.hrAgendamento.slice(0, 5) ?? ''
  );
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const criar = useCreateAgendamento();
  const atualizar = useUpdateAgendamento(agendamento?.id ?? 0);
  const salvando = criar.isPending || atualizar.isPending;

  // Sem pet não há o que agendar, e sem veterinário a API recusaria o POST.
  if (pets.length === 0) {
    return (
      <EmptyState
        emoji="🐾"
        title="Cadastre um pet primeiro"
        description="Uma consulta é sempre para um pet. Cadastre o seu para poder marcar."
        actionLabel="Cadastrar pet"
        onAction={() => router.replace('/cadastrar-pet')}
      />
    );
  }

  if (veterinarios.length === 0) {
    return (
      <EmptyState
        emoji="🩺"
        title="Nenhum veterinário disponível"
        description="A sua clínica ainda não cadastrou veterinários atendendo pelo aplicativo. Entre em contato com ela para marcar."
      />
    );
  }

  function validar(): boolean {
    const novos: Record<string, string> = {};
    if (!petId) novos.petId = 'Escolha para qual pet é a consulta.';
    if (!veterinarioId) novos.veterinarioId = 'Escolha o veterinário.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dtAgendamento.trim())) {
      novos.dtAgendamento = 'Use o formato aaaa-mm-dd.';
    } else if (dtAgendamento.trim() < hojeISO()) {
      novos.dtAgendamento = 'Escolha uma data de hoje em diante.';
    }
    // A API valida HH:mm e recusa HH:mm:ss com 422.
    if (!/^\d{2}:\d{2}$/.test(hrAgendamento.trim())) {
      novos.hrAgendamento = 'Use o formato hh:mm, por exemplo 14:30.';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function salvar() {
    setErroEnvio(null);
    if (!validar()) return;

    const corpo: AgendamentoRequest = {
      petId: petId as number,
      veterinarioId: veterinarioId as number,
      dtAgendamento: dtAgendamento.trim(),
      hrAgendamento: hrAgendamento.trim(),
      canalOrigem: 'APP',
      status: agendamento?.status ?? 'SOLICITADO',
    };

    const opcoes = {
      onSuccess: () => router.back(),
      onError: (err: unknown) => setErroEnvio(getErrorMessage(err)),
    };

    if (remarcando) atualizar.mutate(corpo, opcoes);
    else criar.mutate(corpo, opcoes);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Field label="Pet" required error={erros.petId}>
          <ChipSelect
            opcoes={pets.map((p) => ({ valor: p.id, rotulo: p.nome, detalhe: p.racaNome }))}
            valor={petId}
            onChange={setPetId}
            scroll
          />
        </Field>

        <Field label="Veterinário" required error={erros.veterinarioId}>
          <ChipSelect
            opcoes={veterinarios.map((v) => ({
              valor: v.id,
              rotulo: v.nome,
              detalhe: v.especialidade,
            }))}
            valor={veterinarioId}
            onChange={setVeterinarioId}
            scroll
          />
        </Field>

        <Field label="Data" required hint="Formato aaaa-mm-dd." error={erros.dtAgendamento}>
          <Input
            value={dtAgendamento}
            onChangeText={setDtAgendamento}
            placeholder={hojeISO()}
            keyboardType="numbers-and-punctuation"
            invalid={!!erros.dtAgendamento}
            editable={!salvando}
          />
        </Field>

        <Field label="Horário" required hint="Formato hh:mm." error={erros.hrAgendamento}>
          <Input
            value={hrAgendamento}
            onChangeText={setHrAgendamento}
            placeholder="14:30"
            keyboardType="numbers-and-punctuation"
            invalid={!!erros.hrAgendamento}
            editable={!salvando}
          />
        </Field>

        <View style={styles.nota}>
          <Text style={styles.notaTexto}>
            A consulta entra como solicitada. A clínica confirma o horário e você acompanha pela
            agenda.
          </Text>
        </View>

        <FormError message={erroEnvio} />

        <PrimaryButton
          label={remarcando ? 'Salvar novo horário' : 'Marcar consulta'}
          icon={remarcando ? 'checkmark' : 'calendar'}
          loading={salvando}
          onPress={salvar}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PetFlowColors.background },
  flex: { flex: 1 },
  conteudo: { padding: Spacing.xl, paddingBottom: 40 },
  nota: {
    backgroundColor: PetFlowColors.blueSoft,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  notaTexto: { fontSize: 13, lineHeight: 19, color: PetFlowColors.blueDark },
});
