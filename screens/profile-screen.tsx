import { Feather } from '@expo/vector-icons';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect } from '@/components/ui/form';
import { AsyncBoundary } from '@/components/ui/screen-state';
import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';
import { usePerfil } from '@/hooks/screens/use-perfil';
import { formatarData } from '@/lib/formatters';
import { AVATARES } from '@/lib/preferences';

/**
 * Perfil — só desenho. Os dados vêm de `GET /api/tutor/me`, via `usePerfil`.
 *
 * Não há edição de cadastro aqui: alterar tutor é `PUT /api/tutores/{id}`, que
 * é a API de gestão da clínica e responde 403 para um token de tutor. Em vez
 * de uma tela que falharia ao salvar, o app diz onde a alteração é feita.
 */
export function ProfileScreen() {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const perfil = usePerfil();
  const { tutor } = perfil;

  function confirmarSaida() {
    Alert.alert('Sair da conta?', 'Você precisará entrar de novo com e-mail e senha.', [
      { text: 'Ficar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: perfil.sair },
    ]);
  }

  const estado = AsyncBoundary({
    isLoading: perfil.carregando,
    error: perfil.erro,
    onRetry: perfil.recarregar,
    isRetrying: perfil.atualizando,
    loadingLabel: 'Carregando seu perfil…',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {estado ?? (
        <ScrollView
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={perfil.atualizando}
              onRefresh={perfil.recarregar}
              tintColor={cores.primary}
              colors={[cores.primary]}
            />
          }>
          <View style={[styles.cabecalho, shadow(1)]}>
            <Pressable
              onPress={perfil.alternarEscolhaAvatar}
              style={({ pressed }) => [styles.avatar, pressed && styles.pressionado]}
              accessibilityLabel="Trocar avatar">
              <Text style={styles.avatarEmoji}>{perfil.avatar}</Text>
              <View style={styles.avatarLapis}>
                <Feather name="edit-2" size={11} color="#fff" />
              </View>
            </Pressable>

            <Text style={styles.nome}>{tutor?.nome}</Text>
            <Text style={styles.email}>{tutor?.email}</Text>

            {perfil.escolhendoAvatar ? (
              <View style={styles.avatares}>
                {AVATARES.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => perfil.escolherAvatar(emoji)}
                    style={[
                      styles.avatarOpcao,
                      emoji === perfil.avatar && styles.avatarOpcaoAtiva,
                    ]}>
                    <Text style={styles.avatarOpcaoEmoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.numeros}>
              <Numero valor={perfil.totalPets} rotulo="pets" />
              <View style={styles.divisor} />
              <Numero valor={perfil.totalConsultas} rotulo="consultas" />
            </View>
          </View>

          <Bloco titulo="Seus dados">
            <Linha rotulo="Telefone" valor={tutor?.telefone || 'Não informado'} />
            <Linha rotulo="Emergência" valor={tutor?.telefoneEmergencia || 'Não informado'} />
            <Linha rotulo="Canal preferido" valor={tutor?.canalPreferencial ?? '—'} />
            <Linha rotulo="Cliente desde" valor={formatarData(tutor?.dtCadastro)} ultima />
          </Bloco>

          <View style={styles.aviso}>
            <Feather name="info" size={16} color={cores.blueDark} />
            <Text style={styles.avisoTexto}>
              Para alterar nome, e-mail ou telefone, fale com a sua clínica — é ela que mantém o
              seu cadastro.
            </Text>
          </View>

          <Bloco titulo="Aparência">
            <View style={styles.aparencia}>
              <ChipSelect
                opcoes={perfil.opcoesDeTema}
                valor={perfil.temaPreferido}
                onChange={perfil.escolherTema}
              />
              <Text style={styles.aparenciaDica}>
                “Sistema” acompanha o modo claro/escuro do seu celular.
              </Text>
            </View>
          </Bloco>

          <Bloco titulo="Notificações">
            <View style={styles.notificacoes}>
              <View style={[styles.acaoIcone, styles.notificacoesIcone]}>
                <Feather
                  name={perfil.notificacoesAtivas ? 'bell' : 'bell-off'}
                  size={17}
                  color={perfil.notificacoesAtivas ? cores.primaryDark : cores.textMuted}
                />
              </View>
              <View style={styles.notificacoesTexto}>
                <Text style={styles.notificacoesTitulo}>
                  {perfil.notificacoesAtivas ? 'Ativadas' : 'Desativadas'}
                </Text>
                <Text style={styles.notificacoesDica}>
                  Confirmação da clínica, lembrete 24 h e 2 h antes da consulta e reforço de
                  vacinas.
                </Text>
              </View>
              {perfil.notificacoesAtivas ? null : (
                <Pressable
                  onPress={perfil.ativarNotificacoes}
                  style={({ pressed }) => [styles.notificacoesBotao, pressed && styles.pressionado]}>
                  <Text style={styles.notificacoesBotaoTexto}>Ativar</Text>
                </Pressable>
              )}
            </View>
          </Bloco>

          <Bloco titulo="Conta">
            <Pressable
              style={({ pressed }) => [styles.acao, pressed && styles.pressionado]}
              onPress={confirmarSaida}>
              <View style={styles.acaoIcone}>
                <Feather name="log-out" size={17} color={cores.danger} />
              </View>
              <Text style={styles.acaoTexto}>Sair da conta</Text>
            </Pressable>
          </Bloco>

          <Text style={styles.rodape}>PetFlow · Clyvo Vet</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Numero({ valor, rotulo }: { valor: number; rotulo: string }) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.numero}>
      <Text style={styles.numeroValor}>{valor}</Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.bloco}>
      <Text style={styles.blocoTitulo}>{titulo}</Text>
      <View style={[styles.blocoCartao, shadow(1)]}>{children}</View>
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
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
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
    cabecalho: {
      alignItems: 'center',
      backgroundColor: cores.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: cores.border,
      padding: Spacing.xxl,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: cores.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarEmoji: { fontSize: 40 },
    avatarLapis: {
      position: 'absolute',
      right: 0,
      bottom: 2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: cores.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: cores.card,
    },
    pressionado: { opacity: 0.75 },
    nome: {
      fontSize: 21,
      fontWeight: '800',
      color: cores.text,
      marginTop: Spacing.md,
      textAlign: 'center',
    },
    email: { fontSize: 14, color: cores.textSecondary, marginTop: 2 },
    avatares: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.lg,
    },
    avatarOpcao: {
      width: 44,
      height: 44,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.background,
      borderWidth: 1,
      borderColor: cores.border,
    },
    avatarOpcaoAtiva: {
      borderColor: cores.primary,
      backgroundColor: cores.primarySoft,
    },
    avatarOpcaoEmoji: { fontSize: 22 },
    numeros: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.xl,
      paddingTop: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: cores.border,
      alignSelf: 'stretch',
    },
    numero: { flex: 1, alignItems: 'center' },
    numeroValor: { fontSize: 20, fontWeight: '800', color: cores.primary },
    numeroRotulo: { fontSize: 12, color: cores.textSecondary, marginTop: 2 },
    divisor: { width: 1, height: 32, backgroundColor: cores.border },
    bloco: { gap: Spacing.md },
    blocoTitulo: { fontSize: 15, fontWeight: '700', color: cores.text },
    blocoCartao: {
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
    linhaRotulo: { fontSize: 14, color: cores.textSecondary },
    linhaValor: { fontSize: 14, fontWeight: '600', color: cores.text, maxWidth: '58%' },
    aviso: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.md,
      backgroundColor: cores.blueSoft,
      borderRadius: Radius.md,
      padding: Spacing.lg,
    },
    avisoTexto: { flex: 1, fontSize: 13, lineHeight: 19, color: cores.blueDark },
    notificacoes: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.lg,
    },
    notificacoesIcone: { backgroundColor: cores.primarySoft },
    notificacoesTexto: { flex: 1, gap: 2 },
    notificacoesTitulo: { fontSize: 15, fontWeight: '600', color: cores.text },
    notificacoesDica: { fontSize: 12, lineHeight: 17, color: cores.textSecondary },
    notificacoesBotao: {
      backgroundColor: cores.primary,
      borderRadius: Radius.pill,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
    },
    notificacoesBotaoTexto: { color: cores.onPrimary, fontWeight: '700', fontSize: 13 },
    aparencia: { paddingVertical: Spacing.lg, gap: Spacing.sm },
    aparenciaDica: { fontSize: 12, color: cores.textMuted },
    acao: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.lg,
    },
    acaoIcone: {
      width: 38,
      height: 38,
      borderRadius: Radius.sm,
      backgroundColor: cores.dangerSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    acaoTexto: { fontSize: 15, fontWeight: '600', color: cores.danger },
    rodape: {
      textAlign: 'center',
      fontSize: 12,
      color: cores.textMuted,
      marginTop: Spacing.sm,
    },
  });
}
