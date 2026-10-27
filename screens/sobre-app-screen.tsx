import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';
import { useSobreApp } from '@/hooks/screens/use-sobre-app';

/**
 * Sobre o App — só desenho.
 *
 * O destaque é o hash do commit: ele identifica exatamente qual código gerou
 * a versão instalada, e é o que se confere contra o repositório e contra a
 * versão publicada no Firebase App Distribution.
 */
export function SobreAppScreen() {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const { info, equipe, tecnologias } = useSobreApp();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Sobre o App" />
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.marcaBloco}>
          <View style={[styles.marcaIcone, shadow(2)]}>
            <MaterialCommunityIcons name="paw" size={34} color={cores.onPrimary} />
          </View>
          <Text style={styles.marca}>{info.nome}</Text>
          <Text style={styles.marcaTexto}>Aplicativo do tutor · Clyvo Vet</Text>
          <View style={styles.versao}>
            <Text style={styles.versaoTexto}>Versão {info.versao}</Text>
          </View>
        </View>

        <View style={[styles.cartao, styles.commitCartao, shadow(1)]}>
          <View style={styles.commitTopo}>
            <Feather name="git-commit" size={18} color={cores.primaryDark} />
            <Text style={styles.commitRotulo}>Commit desta versão</Text>
          </View>
          <Text style={styles.commitCurto} selectable>
            {info.commitCurto}
          </Text>
          <Text style={styles.commitCompleto} selectable>
            {info.commitHash}
          </Text>
          {info.commitModificado ? (
            <View style={styles.alerta}>
              <Feather name="alert-triangle" size={14} color={cores.warningText} />
              <Text style={styles.alertaTexto}>
                Build gerado com alterações não commitadas — não corresponde exatamente a este
                commit.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.cartao, shadow(1)]}>
          <Linha rotulo="Gerado em" valor={info.geradoEm ?? '—'} />
          <Linha rotulo="Plataforma" valor={info.plataforma} />
          <Linha rotulo="API" valor={info.api} ultima />
        </View>

        <View style={styles.bloco}>
          <Text style={styles.blocoTitulo}>Equipe</Text>
          <View style={[styles.cartao, shadow(1)]}>
            {equipe.map((pessoa, i) => (
              <Linha
                key={pessoa.rm}
                rotulo={pessoa.nome}
                valor={pessoa.rm}
                ultima={i === equipe.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={styles.bloco}>
          <Text style={styles.blocoTitulo}>Feito com</Text>
          <View style={styles.tags}>
            {tecnologias.map((tecnologia) => (
              <View key={tecnologia} style={styles.tag}>
                <Text style={styles.tagTexto}>{tecnologia}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.rodape}>FIAP · Mobile Application Development · Challenge 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Linha({ rotulo, valor, ultima }: { rotulo: string; valor: string; ultima?: boolean }) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={[styles.linha, !ultima && styles.linhaBorda]}>
      <Text style={styles.linhaRotulo} numberOfLines={1}>
        {rotulo}
      </Text>
      <Text style={styles.linhaValor} numberOfLines={1} selectable>
        {valor}
      </Text>
    </View>
  );
}

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

function criarEstilos(cores: Paleta) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: cores.background },
    conteudo: { padding: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: 40, gap: Spacing.xl },
    marcaBloco: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
    marcaIcone: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor: cores.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    marca: { fontSize: 24, fontWeight: '800', color: cores.text },
    marcaTexto: { fontSize: 14, color: cores.textSecondary },
    versao: {
      marginTop: Spacing.sm,
      backgroundColor: cores.primarySoft,
      borderRadius: Radius.pill,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
    },
    versaoTexto: { fontSize: 12, fontWeight: '700', color: cores.primaryDark },
    cartao: {
      backgroundColor: cores.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: cores.border,
      paddingHorizontal: Spacing.lg,
    },
    commitCartao: { paddingVertical: Spacing.lg, gap: Spacing.xs, borderColor: cores.aiBorder },
    commitTopo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    commitRotulo: { fontSize: 13, fontWeight: '700', color: cores.textSecondary },
    commitCurto: {
      fontFamily: MONO,
      fontSize: 30,
      fontWeight: '700',
      letterSpacing: 1,
      color: cores.text,
      marginTop: Spacing.xs,
    },
    commitCompleto: { fontFamily: MONO, fontSize: 12, color: cores.textMuted },
    alerta: {
      flexDirection: 'row',
      gap: Spacing.sm,
      alignItems: 'flex-start',
      backgroundColor: cores.orangeSoft,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      marginTop: Spacing.sm,
    },
    alertaTexto: { flex: 1, fontSize: 12, lineHeight: 17, color: cores.warningText },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.lg,
      paddingVertical: Spacing.md + 1,
    },
    linhaBorda: { borderBottomWidth: 1, borderBottomColor: cores.border },
    linhaRotulo: { fontSize: 14, color: cores.textSecondary, flexShrink: 1 },
    linhaValor: { fontSize: 14, fontWeight: '600', color: cores.text, maxWidth: '62%' },
    bloco: { gap: Spacing.md },
    blocoTitulo: { fontSize: 15, fontWeight: '700', color: cores.text },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    tag: {
      backgroundColor: cores.card,
      borderWidth: 1,
      borderColor: cores.border,
      borderRadius: Radius.pill,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
    },
    tagTexto: { fontSize: 12, fontWeight: '600', color: cores.textSecondary },
    rodape: { textAlign: 'center', fontSize: 12, color: cores.textMuted },
  });
}
