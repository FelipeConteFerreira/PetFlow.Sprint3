import { useRoute, type RouteProp } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect, Field, FormError, Input, PrimaryButton } from '@/components/ui/form';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AsyncBoundary } from '@/components/ui/screen-state';
import { Radius, Spacing } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useEstilos } from '@/hooks/use-estilos';
import { usePetForm, usePetFormData } from '@/hooks/forms/use-pet-form';
import { PORTES, SEXOS, STATUS_EDITAVEIS, STATUS_LABEL_CURTO } from '@/lib/forms/pet';
import { PORTE_LABEL, SEXO_LABEL } from '@/lib/formatters';
import type { RootStackParamList } from '@/navigation/types';
import { useAppNavigation } from '@/navigation/use-app-navigation';
import type { EspecieResponse, PetResponse, RacaResponse } from '@/types/api';

/**
 * Cadastro e edição de pet na mesma tela.
 *
 * Com `petId` na rota é edição; sem ele é cadastro. Um formulário só porque os
 * campos são os mesmos — manter duas telas quase iguais é como elas divergem.
 *
 * A tela está partida em duas: a de fora espera os dados chegarem, a de dentro
 * desenha o formulário já com os valores certos. Nenhuma das duas valida,
 * guarda estado de formulário ou chama mutation — isso é do `usePetForm`.
 */
export function PetFormScreen() {
  const styles = useEstilos(criarEstilos);
  const { params } = useRoute<RouteProp<RootStackParamList, 'PetForm'>>();
  const dados = usePetFormData(params?.petId);

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
        title={dados.editando ? 'Editar pet' : 'Cadastrar pet'}
        subtitle={dados.editando ? dados.pet?.nome : 'Os dados vão direto para a clínica'}
      />

      {estado ?? (
        <FormularioPet
          key={dados.editando ? params?.petId : 'novo'}
          pet={dados.pet}
          especies={dados.especies}
          racas={dados.racas}
        />
      )}
    </SafeAreaView>
  );
}

function FormularioPet({
  pet,
  especies,
  racas,
}: {
  pet?: PetResponse;
  especies: EspecieResponse[];
  racas: RacaResponse[];
}) {
  const styles = useEstilos(criarEstilos);
  const navigation = useAppNavigation();
  const form = usePetForm({ pet, racas, onSaved: navigation.voltar });
  const { values, setValue, errors, isSubmitting } = form;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Field label="Nome" required error={errors.nome}>
          <Input
            value={values.nome}
            onChangeText={(texto) => setValue('nome', texto)}
            placeholder="Bidu"
            autoCapitalize="words"
            invalid={!!errors.nome}
            editable={!isSubmitting}
          />
        </Field>

        <Field label="Espécie" hint="Escolher a espécie filtra as raças abaixo.">
          <ChipSelect
            opcoes={especies.map((e) => ({ valor: e.id, rotulo: e.nome }))}
            valor={values.especieId}
            onChange={form.escolherEspecie}
            scroll
          />
        </Field>

        <Field label="Raça" required error={errors.racaId}>
          {form.opcoesRaca.length === 0 ? (
            <Text style={styles.aviso}>
              Nenhuma raça cadastrada para esta espécie. Escolha outra espécie.
            </Text>
          ) : (
            <ChipSelect
              opcoes={form.opcoesRaca}
              valor={values.racaId}
              onChange={(id) => setValue('racaId', id)}
              scroll
            />
          )}
        </Field>

        <Field label="Nascimento" hint="Opcional. Formato aaaa-mm-dd." error={errors.dtNascimento}>
          <Input
            value={values.dtNascimento}
            onChangeText={(texto) => setValue('dtNascimento', texto)}
            placeholder="2021-03-14"
            keyboardType="numbers-and-punctuation"
            invalid={!!errors.dtNascimento}
            editable={!isSubmitting}
          />
        </Field>

        <Field label="Sexo">
          <ChipSelect
            opcoes={SEXOS.map((s) => ({ valor: s, rotulo: SEXO_LABEL[s] }))}
            valor={values.sexo}
            onChange={(sexo) => setValue('sexo', sexo)}
          />
        </Field>

        <Field label="Porte">
          <ChipSelect
            opcoes={PORTES.map((p) => ({ valor: p, rotulo: PORTE_LABEL[p] }))}
            valor={values.porte}
            onChange={(porte) => setValue('porte', porte)}
          />
        </Field>

        <Field label="Castrado">
          <ChipSelect
            opcoes={[
              { valor: 'sim', rotulo: 'Sim' },
              { valor: 'nao', rotulo: 'Não' },
            ]}
            valor={values.castrado === undefined ? undefined : values.castrado ? 'sim' : 'nao'}
            onChange={(v) => setValue('castrado', v === 'sim')}
          />
        </Field>

        <Field label="Situação">
          <ChipSelect
            opcoes={STATUS_EDITAVEIS.map((s) => ({ valor: s, rotulo: STATUS_LABEL_CURTO[s] }))}
            valor={values.status}
            onChange={(status) => setValue('status', status)}
          />
        </Field>

        <Field label="Pelagem" hint="Opcional.">
          <Input
            value={values.pelagem}
            onChangeText={(texto) => setValue('pelagem', texto)}
            placeholder="Caramelo, tigrado…"
            editable={!isSubmitting}
          />
        </Field>

        <Field label="Microchip" hint="Opcional.">
          <Input
            value={values.microchip}
            onChangeText={(texto) => setValue('microchip', texto)}
            placeholder="Número do chip"
            editable={!isSubmitting}
          />
        </Field>

        <Field label="Observações" hint="O que a clínica precisa saber antes de atender.">
          <Input
            value={values.observacaoGeral}
            onChangeText={(texto) => setValue('observacaoGeral', texto)}
            placeholder="Alergias, medos, comportamento…"
            multiline
            numberOfLines={4}
            style={styles.textarea}
            editable={!isSubmitting}
          />
        </Field>

        <FormError message={form.submitError} />

        <PrimaryButton
          label={form.editando ? 'Salvar alterações' : 'Cadastrar pet'}
          icon={form.editando ? 'checkmark' : 'add'}
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
    textarea: { minHeight: 104, textAlignVertical: 'top', paddingTop: Spacing.md },
    aviso: {
      fontSize: 13,
      color: cores.textSecondary,
      backgroundColor: cores.infoBg,
      borderRadius: Radius.sm,
      padding: Spacing.md,
    },
  });
}
