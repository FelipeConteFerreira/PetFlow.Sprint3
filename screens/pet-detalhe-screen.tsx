import { Ionicons } from '@expo/vector-icons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/form';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AsyncBoundary } from '@/components/ui/screen-state';
import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';
import { usePetDetalhe } from '@/hooks/screens/use-pet-detalhe';
import {
  PET_STATUS_LABEL,
  PORTE_LABEL,
  SEXO_LABEL,
  emojiDoPet,
  formatarData,
  idadeDoPet,
} from '@/lib/formatters';
import type { RootStackParamList } from '@/navigation/types';
import { useAppNavigation } from '@/navigation/use-app-navigation';

/**
 * Detalhe do pet, com as duas saídas de escrita: editar e remover.
 *
 * Só desenho — a ficha, o histórico e a remoção vêm do `usePetDetalhe`. Cada
 * lista do histórico diz o que significa estar vazia: pet novo não tem
 * consultas nem vacinas, e isso não é erro.
 */
export function PetDetalheScreen() {
  const styles = useEstilos(criarEstilos);
  const navigation = useAppNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PetDetalhe'>>();
  const petId = params.petId;

  const detalhe = usePetDetalhe(petId, navigation.voltar);
  const { pet, consultas, vacinas } = detalhe;

  /**
   * Confirmação antes do DELETE. A API inativa em vez de apagar, e o texto diz
   * isso — prometer que "não dá para desfazer" seria mentira, e esconder que o
   * histórico fica seria pior.
   */
  function confirmarRemocao() {
    Alert.alert(
      `Remover ${pet?.nome ?? 'o pet'}?`,
      'Ele sai da sua lista e das suas próximas consultas. O histórico clínico continua guardado na clínica.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: detalhe.remover },
      ]
    );
  }

  const estado = AsyncBoundary({
    isLoading: detalhe.carregando,
    error: detalhe.erro,
    onRetry: detalhe.recarregar,
    isRetrying: detalhe.atualizando,
    loadingLabel: 'Carregando a ficha…',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={pet?.nome ?? 'Pet'}
        action={
          pet
            ? {
                icon: 'create-outline',
                label: 'Editar',
                onPress: () => navigation.editarPet(petId),
              }
            : undefined
        }
      />

      {estado ??
        (pet ? (
          <ScrollView
            contentContainerStyle={styles.conteudo}
            showsVerticalScrollIndicator={false}>
            <View style={[styles.hero, shadow(1)]}>
              <View style={styles.avatar}>
                <Text style={styles.emoji}>{emojiDoPet(pet.especieNome)}</Text>
              </View>
              <Text style={styles.nome}>{pet.nome}</Text>
              <Text style={styles.raca}>
                {[pet.racaNome, pet.especieNome].filter(Boolean).join(' · ') || 'Raça não informada'}
              </Text>

              <View style={styles.pilulas}>
                <Pilula
                  icone="calendar-outline"
                  texto={idadeDoPet(pet.dtNascimento) ?? 'Idade não informada'}
                />
                {pet.sexo ? <Pilula icone="male-female-outline" texto={SEXO_LABEL[pet.sexo]} /> : null}
                {pet.porte ? <Pilula icone="resize-outline" texto={PORTE_LABEL[pet.porte]} /> : null}
              </View>
            </View>

            <Secao titulo="Dados do pet">
              <Linha rotulo="Nascimento" valor={formatarData(pet.dtNascimento)} />
              <Linha rotulo="Situação" valor={pet.status ? PET_STATUS_LABEL[pet.status] : '—'} />
              <Linha rotulo="Castrado" valor={pet.castrado == null ? '—' : pet.castrado ? 'Sim' : 'Não'} />
              <Linha rotulo="Pelagem" valor={pet.pelagem || '—'} />
              <Linha rotulo="Microchip" valor={pet.microchip || '—'} />
              <Linha rotulo="RGA" valor={pet.rga || '—'} ultima />
            </Secao>

            {pet.observacaoGeral ? (
              <Secao titulo="Observações">
                <Text style={styles.observacao}>{pet.observacaoGeral}</Text>
              </Secao>
            ) : null}

            <Secao titulo="Vacinas" contagem={vacinas.data?.length}>
              {vacinas.isPending ? (
                <Text style={styles.vazio}>Carregando…</Text>
              ) : vacinas.error ? (
                <Text style={styles.vazio}>Não foi possível carregar a carteira de vacinação.</Text>
              ) : vacinas.data?.length ? (
                vacinas.data.map((v, i) => (
                  <Linha
                    key={v.id}
                    rotulo={v.tipoVacinaNome ?? 'Vacina'}
                    valor={formatarData(v.dtAplicacao)}
                    ultima={i === vacinas.data.length - 1}
                  />
                ))
              ) : (
                <Text style={styles.vazio}>
                  Nenhuma vacina registrada. A clínica preenche a carteira a cada aplicação.
                </Text>
              )}
            </Secao>

            <Secao titulo="Consultas" contagem={consultas.data?.length}>
              {consultas.isPending ? (
                <Text style={styles.vazio}>Carregando…</Text>
              ) : consultas.error ? (
                <Text style={styles.vazio}>Não foi possível carregar o histórico de consultas.</Text>
              ) : consultas.data?.length ? (
                consultas.data.map((c, i) => (
                  <Linha
                    key={c.id}
                    rotulo={c.motivo || 'Consulta'}
                    valor={formatarData(c.dtConsulta)}
                    ultima={i === consultas.data.length - 1}
                  />
                ))
              ) : (
                <Text style={styles.vazio}>
                  Nenhuma consulta registrada ainda para {pet.nome}.
                </Text>
              )}
            </Secao>

            {detalhe.erroRemocao ? (
              <Text style={styles.erroRemocao}>{detalhe.erroRemocao}</Text>
            ) : null}

            <View style={styles.acoes}>
              <PrimaryButton
                label="Editar dados"
                icon="create-outline"
                tone="neutro"
                onPress={() => navigation.editarPet(petId)}
              />
              <PrimaryButton
                label="Remover pet"
                icon="trash-outline"
                tone="danger"
                loading={detalhe.removendo}
                onPress={confirmarRemocao}
              />
            </View>
          </ScrollView>
        ) : null)}
    </SafeAreaView>
  );
}

function Pilula({ icone, texto }: { icone: keyof typeof Ionicons.glyphMap; texto: string }) {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.pilula}>
      <Ionicons name={icone} size={13} color={cores.primaryDark} />
      <Text style={styles.pilulaTexto}>{texto}</Text>
    </View>
  );
}

function Secao({
  titulo,
  contagem,
  children,
}: {
  titulo: string;
  contagem?: number;
  children: React.ReactNode;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.secao}>
      <View style={styles.secaoCabecalho}>
        <Text style={styles.secaoTitulo}>{titulo}</Text>
        {contagem ? <Text style={styles.secaoContagem}>{contagem}</Text> : null}
      </View>
      <View style={[styles.cartao, shadow(1)]}>{children}</View>
    </View>
  );
}

function Linha({
  rotulo,
  valor,
  ultima,
}: {
  rotulo: string;
  valor: string;
  ultima?: boolean;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={[styles.linha, !ultima && styles.linhaBorda]}>
      <Text style={styles.linhaRotulo} numberOfLines={1}>
        {rotulo}
      </Text>
      <Text style={styles.linhaValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

function criarEstilos(cores: Paleta) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: cores.background },
    conteudo: { padding: Spacing.xl, paddingBottom: 40, gap: Spacing.xl },
    hero: {
      alignItems: 'center',
      backgroundColor: cores.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: cores.border,
      padding: Spacing.xxl,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: cores.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emoji: { fontSize: 44 },
    nome: {
      fontSize: 23,
      fontWeight: '800',
      color: cores.text,
      marginTop: Spacing.md,
    },
    raca: { fontSize: 14, color: cores.textSecondary, marginTop: 2 },
    pilulas: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.lg,
    },
    pilula: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: cores.primarySoft,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radius.pill,
    },
    pilulaTexto: { fontSize: 12, fontWeight: '600', color: cores.primaryDark },
    secao: { gap: Spacing.md },
    secaoCabecalho: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    secaoTitulo: { fontSize: 15, fontWeight: '700', color: cores.text },
    secaoContagem: {
      fontSize: 11,
      fontWeight: '700',
      color: cores.textSecondary,
      backgroundColor: cores.infoBg,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: Radius.pill,
      overflow: 'hidden',
    },
    cartao: {
      backgroundColor: cores.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: cores.border,
      paddingHorizontal: Spacing.lg,
    },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.lg,
      paddingVertical: Spacing.md + 1,
    },
    linhaBorda: { borderBottomWidth: 1, borderBottomColor: cores.border },
    linhaRotulo: { flex: 1, fontSize: 14, color: cores.textSecondary },
    linhaValor: { fontSize: 14, fontWeight: '600', color: cores.text, maxWidth: '55%' },
    observacao: {
      fontSize: 14,
      lineHeight: 21,
      color: cores.text,
      paddingVertical: Spacing.lg,
    },
    vazio: {
      fontSize: 13,
      lineHeight: 19,
      color: cores.textSecondary,
      paddingVertical: Spacing.lg,
    },
    erroRemocao: { fontSize: 13, color: cores.danger, textAlign: 'center' },
    acoes: { gap: Spacing.md },
  });
}
