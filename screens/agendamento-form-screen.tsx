import { useRoute, type RouteProp } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect, Field, FormError, Input, PrimaryButton } from '@/components/ui/form';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AsyncBoundary, EmptyState } from '@/components/ui/screen-state';
import { Radius, Spacing } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useEstilos } from '@/hooks/use-estilos';
import { useAgendamentoForm, useAgendamentoFormData } from '@/hooks/forms/use-agendamento-form';
import { hojeISO } from '@/lib/formatters';
import type { RootStackParamList } from '@/navigation/types';
import { useAppNavigation } from '@/navigation/use-app-navigation';
import type { AgendamentoResponse, PetResponse, VeterinarioResponse } from '@/types/api';

/**
 * Marcar e remarcar consulta, na mesma tela.
 *
 * Com `agendamentoId` na rota é remarcação (PUT); sem ele é uma consulta nova
 * (POST). Como no formulário de pet, a tela de fora espera os dados e a de
 * dentro desenha — estado, validação e envio são do `useAgendamentoForm`.
 */
export function AgendamentoFormScreen() {
  const styles = useEstilos(criarEstilos);
  const { params } = useRoute<RouteProp<RootStackParamList, 'AgendamentoForm'>>();
  const dados = useAgendamentoFormData(params?.agendamentoId);

  const estado = AsyncBoundary({
    isLoading: dados.carregando,
    error: dados.erro,
    onRetry: dados.recarregar,
    isRetrying: dados.recarregando,
    loadingLabel: 'Preparando o formulário…',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={dados.remarcando ? 'Remarcar consulta' : 'Marcar consulta'}
        subtitle={dados.remarcando ? dados.agendamento?.petNome : undefined}
      />

      {estado ?? (
        <FormularioAgendamento
          key={dados.remarcando ? params?.agendamentoId : 'novo'}
          agendamento={dados.agendamento}
          pets={dados.pets}
          veterinarios={dados.veterinarios}
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
  const styles = useEstilos(criarEstilos);
  const navigation = useAppNavigation();
  const form = useAgendamentoForm({ agendamento, pets, onSaved: navigation.voltar });
  const { values, setValue, errors, isSubmitting } = form;

  // Sem pet não há o que agendar, e sem veterinário a API recusaria o POST.
  if (pets.length === 0) {
    return (
      <EmptyState
        emoji="🐾"
        title="Cadastre um pet primeiro"
        description="Uma consulta é sempre para um pet. Cadastre o seu para poder marcar."
        actionLabel="Cadastrar pet"
        onAction={navigation.novoPet}
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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Field label="Pet" required error={errors.petId}>
          <ChipSelect
            opcoes={pets.map((p) => ({ valor: p.id, rotulo: p.nome, detalhe: p.racaNome }))}
            valor={values.petId}
            onChange={(id) => setValue('petId', id)}
            scroll
          />
        </Field>

        <Field label="Veterinário" required error={errors.veterinarioId}>
          <ChipSelect
            opcoes={veterinarios.map((v) => ({
              valor: v.id,
              rotulo: v.nome,
              detalhe: v.especialidade,
            }))}
            valor={values.veterinarioId}
            onChange={(id) => setValue('veterinarioId', id)}
            scroll
          />
        </Field>

        <Field label="Data" required hint="Formato aaaa-mm-dd." error={errors.dtAgendamento}>
          <Input
            value={values.dtAgendamento}
            onChangeText={(texto) => setValue('dtAgendamento', texto)}
            placeholder={hojeISO()}
            keyboardType="numbers-and-punctuation"
            invalid={!!errors.dtAgendamento}
            editable={!isSubmitting}
          />
        </Field>

        <Field label="Horário" required hint="Formato hh:mm." error={errors.hrAgendamento}>
          <Input
            value={values.hrAgendamento}
            onChangeText={(texto) => setValue('hrAgendamento', texto)}
            placeholder="14:30"
            keyboardType="numbers-and-punctuation"
            invalid={!!errors.hrAgendamento}
            editable={!isSubmitting}
          />
        </Field>

        <View style={styles.nota}>
          <Text style={styles.notaTexto}>
            A consulta entra como solicitada. A clínica confirma o horário e você acompanha pela
            agenda.
          </Text>
        </View>

        <FormError message={form.submitError} />

        <PrimaryButton
          label={form.remarcando ? 'Salvar novo horário' : 'Marcar consulta'}
          icon={form.remarcando ? 'checkmark' : 'calendar'}
          loading={isSubmitting}
          onPress={form.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function criarEstilos(cores: Paleta) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: cores.background },
    flex: { flex: 1 },
    conteudo: { padding: Spacing.xl, paddingBottom: 40 },
    nota: {
      backgroundColor: cores.blueSoft,
      borderRadius: Radius.md,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    notaTexto: { fontSize: 13, lineHeight: 19, color: cores.blueDark },
  });
}
