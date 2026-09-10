import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect, Field, FormError, Input, PrimaryButton } from '@/components/ui/form';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AsyncBoundary } from '@/components/ui/screen-state';
import { PetFlowColors, Radius, Spacing } from '@/constants/petflow';
import { useEspecies, useRacas } from '@/hooks/use-catalogo';
import { useCreatePet, usePet, useUpdatePet } from '@/hooks/use-pets';
import { getErrorMessage } from '@/lib/api/errors';
import { PORTE_LABEL, SEXO_LABEL } from '@/lib/formatters';
import type {
  EspecieResponse,
  PetDoTutorRequest,
  PetPorte,
  PetResponse,
  PetSexo,
  PetStatus,
  RacaResponse,
} from '@/types/api';

/**
 * Cadastro e edição de pet na mesma tela.
 *
 * Com `?id=` na rota é edição: PUT sobre o pet carregado. Sem id é cadastro e
 * chama POST. Um formulário só porque os campos são os mesmos — manter duas
 * telas quase iguais é como elas passam a divergir.
 *
 * A tela está partida em duas: a de fora espera catálogo e pet chegarem, a de
 * dentro nasce já com os valores certos no `useState`. Sem isso o formulário
 * precisaria de um efeito para copiar o pet para o estado quando ele chegasse,
 * e sincronizar estado com dado de API é justamente o que gera renderização em
 * cascata.
 */

const SEXOS: PetSexo[] = ['M', 'F', 'I'];
const PORTES: PetPorte[] = ['MINI', 'PEQUENO', 'MEDIO', 'GRANDE', 'GIGANTE'];
const STATUS_EDITAVEIS: PetStatus[] = ['ATIVO', 'EM_TRATAMENTO', 'PERDIDO'];
const STATUS_LABEL_CURTO: Record<string, string> = {
  ATIVO: 'Saudável',
  EM_TRATAMENTO: 'Em tratamento',
  PERDIDO: 'Perdido',
};

export default function CadastrarPetScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const petId = id ? Number(id) : undefined;
  const editando = typeof petId === 'number' && Number.isFinite(petId) && petId > 0;

  const petExistente = usePet(editando ? petId : 0);
  const especies = useEspecies();
  // Todas as raças de uma vez: filtrar por espécie em memória evita uma
  // chamada nova a cada troca de ficha, e o catálogo é pequeno.
  const racas = useRacas();

  const carregando =
    especies.isPending || racas.isPending || (editando && petExistente.isPending);
  const erro = especies.error ?? racas.error ?? (editando ? petExistente.error : null);

  const estado = (
    <AsyncBoundary
      isLoading={carregando}
      error={erro}
      onRetry={() => {
        void especies.refetch();
        void racas.refetch();
        if (editando) void petExistente.refetch();
      }}
      isRetrying={especies.isFetching || racas.isFetching}
      loadingLabel="Preparando o formulário…"
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={editando ? 'Editar pet' : 'Cadastrar pet'}
        subtitle={editando ? petExistente.data?.nome : 'Os dados vão direto para a clínica'}
      />

      {estado ?? (
        <FormularioPet
          key={editando ? petId : 'novo'}
          pet={editando ? petExistente.data : undefined}
          especies={especies.data ?? []}
          racas={racas.data ?? []}
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
  const router = useRouter();
  const editando = !!pet;

  // O PetResponse traz a raça, mas não a espécie dela: descobrimos pela raça,
  // para que o filtro já apareça marcado na edição.
  const especieDoPet = pet ? racas.find((r) => r.id === pet.racaId)?.especieId : undefined;

  const [especieId, setEspecieId] = useState<number | undefined>(especieDoPet);
  const [nome, setNome] = useState(pet?.nome ?? '');
  const [racaId, setRacaId] = useState<number | undefined>(pet?.racaId);
  const [dtNascimento, setDtNascimento] = useState(pet?.dtNascimento ?? '');
  const [sexo, setSexo] = useState<PetSexo | undefined>(pet?.sexo);
  const [porte, setPorte] = useState<PetPorte | undefined>(pet?.porte);
  const [status, setStatus] = useState<PetStatus>(pet?.status ?? 'ATIVO');
  const [castrado, setCastrado] = useState<boolean | undefined>(pet?.castrado ?? undefined);
  const [pelagem, setPelagem] = useState(pet?.pelagem ?? '');
  const [microchip, setMicrochip] = useState(pet?.microchip ?? '');
  const [observacaoGeral, setObservacaoGeral] = useState(pet?.observacaoGeral ?? '');

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const criar = useCreatePet();
  const atualizar = useUpdatePet(pet?.id ?? 0);
  const salvando = criar.isPending || atualizar.isPending;

  const opcoesRaca = useMemo(
    () =>
      racas
        .filter((r) => !especieId || r.especieId === especieId)
        .map((r) => ({ valor: r.id, rotulo: r.nome })),
    [racas, especieId]
  );

  function validar(): boolean {
    const novos: Record<string, string> = {};
    if (!nome.trim()) novos.nome = 'Diga como o pet se chama.';
    if (!racaId) novos.racaId = 'Escolha a raça — a clínica precisa dela na ficha.';
    if (dtNascimento && !/^\d{4}-\d{2}-\d{2}$/.test(dtNascimento.trim())) {
      novos.dtNascimento = 'Use o formato aaaa-mm-dd, por exemplo 2021-03-14.';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function salvar() {
    setErroEnvio(null);
    if (!validar()) return;

    // Sem tutorId: o dono vem do token.
    const corpo: PetDoTutorRequest = {
      nome: nome.trim(),
      racaId: racaId as number,
      dtNascimento: dtNascimento.trim() || undefined,
      sexo,
      porte,
      status,
      castrado,
      pelagem: pelagem.trim() || undefined,
      microchip: microchip.trim() || undefined,
      observacaoGeral: observacaoGeral.trim() || undefined,
    };

    const opcoes = {
      onSuccess: () => router.back(),
      onError: (err: unknown) => setErroEnvio(getErrorMessage(err)),
    };

    if (editando) atualizar.mutate(corpo, opcoes);
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
        <Field label="Nome" required error={erros.nome}>
          <Input
            value={nome}
            onChangeText={setNome}
            placeholder="Bidu"
            autoCapitalize="words"
            invalid={!!erros.nome}
            editable={!salvando}
          />
        </Field>

        <Field label="Espécie" hint="Escolher a espécie filtra as raças abaixo.">
          <ChipSelect
            opcoes={especies.map((e) => ({ valor: e.id, rotulo: e.nome }))}
            valor={especieId}
            onChange={(v) => {
              setEspecieId(v);
              setRacaId(undefined);
            }}
            scroll
          />
        </Field>

        <Field label="Raça" required error={erros.racaId}>
          {opcoesRaca.length === 0 ? (
            <Text style={styles.aviso}>
              Nenhuma raça cadastrada para esta espécie. Escolha outra espécie.
            </Text>
          ) : (
            <ChipSelect opcoes={opcoesRaca} valor={racaId} onChange={setRacaId} scroll />
          )}
        </Field>

        <Field label="Nascimento" hint="Opcional. Formato aaaa-mm-dd." error={erros.dtNascimento}>
          <Input
            value={dtNascimento}
            onChangeText={setDtNascimento}
            placeholder="2021-03-14"
            keyboardType="numbers-and-punctuation"
            invalid={!!erros.dtNascimento}
            editable={!salvando}
          />
        </Field>

        <Field label="Sexo">
          <ChipSelect
            opcoes={SEXOS.map((s) => ({ valor: s, rotulo: SEXO_LABEL[s] }))}
            valor={sexo}
            onChange={setSexo}
          />
        </Field>

        <Field label="Porte">
          <ChipSelect
            opcoes={PORTES.map((p) => ({ valor: p, rotulo: PORTE_LABEL[p] }))}
            valor={porte}
            onChange={setPorte}
          />
        </Field>

        <Field label="Castrado">
          <ChipSelect
            opcoes={[
              { valor: 'sim', rotulo: 'Sim' },
              { valor: 'nao', rotulo: 'Não' },
            ]}
            valor={castrado === undefined ? undefined : castrado ? 'sim' : 'nao'}
            onChange={(v) => setCastrado(v === 'sim')}
          />
        </Field>

        <Field label="Situação">
          <ChipSelect
            opcoes={STATUS_EDITAVEIS.map((s) => ({ valor: s, rotulo: STATUS_LABEL_CURTO[s] }))}
            valor={status}
            onChange={setStatus}
          />
        </Field>

        <Field label="Pelagem" hint="Opcional.">
          <Input
            value={pelagem}
            onChangeText={setPelagem}
            placeholder="Caramelo, tigrado…"
            editable={!salvando}
          />
        </Field>

        <Field label="Microchip" hint="Opcional.">
          <Input
            value={microchip}
            onChangeText={setMicrochip}
            placeholder="Número do chip"
            editable={!salvando}
          />
        </Field>

        <Field label="Observações" hint="O que a clínica precisa saber antes de atender.">
          <Input
            value={observacaoGeral}
            onChangeText={setObservacaoGeral}
            placeholder="Alergias, medos, comportamento…"
            multiline
            numberOfLines={4}
            style={styles.textarea}
            editable={!salvando}
          />
        </Field>

        <FormError message={erroEnvio} />

        <PrimaryButton
          label={editando ? 'Salvar alterações' : 'Cadastrar pet'}
          icon={editando ? 'checkmark' : 'add'}
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
  textarea: { minHeight: 104, textAlignVertical: 'top', paddingTop: Spacing.md },
  aviso: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    backgroundColor: PetFlowColors.infoBg,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
});
