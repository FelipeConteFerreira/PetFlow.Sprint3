import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AsyncBoundary } from '@/components/ui/screen-state';
import { PetFlowColors, Radius, Spacing, shadow } from '@/constants/petflow';
import { useAuth } from '@/contexts/auth-context';
import { useAgendamentos } from '@/hooks/use-agendamentos';
import { usePets } from '@/hooks/use-pets';
import { useTutorMe } from '@/hooks/use-tutor';
import { AVATARES, getAvatar, setAvatar } from '@/lib/preferences';
import { formatarData } from '@/lib/formatters';

/**
 * Perfil — os dados vêm de `GET /api/tutor/me`.
 *
 * Não há edição de cadastro aqui: alterar tutor é `PUT /api/tutores/{id}`, que
 * é a API de gestão da clínica e responde 403 para um token de tutor. Em vez
 * de uma tela que falharia ao salvar, o app diz onde a alteração é feita.
 *
 * O avatar é a única coisa que esta tela guarda no aparelho, porque é a única
 * que o servidor não tem.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const tutor = useTutorMe();
  const pets = usePets();
  const agenda = useAgendamentos();

  const [avatar, setAvatarLocal] = useState(AVATARES[0]);
  const [escolhendoAvatar, setEscolhendoAvatar] = useState(false);

  useEffect(() => {
    void getAvatar().then(setAvatarLocal);
  }, []);

  function escolherAvatar(emoji: string) {
    setAvatarLocal(emoji);
    setEscolhendoAvatar(false);
    void setAvatar(emoji);
  }

  function confirmarSaida() {
    Alert.alert('Sair da conta?', 'Você precisará entrar de novo com e-mail e senha.', [
      { text: 'Ficar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => router.replace('/login'));
        },
      },
    ]);
  }

  const estado = AsyncBoundary({
    isLoading: tutor.isPending,
    error: tutor.error,
    onRetry: () => tutor.refetch(),
    isRetrying: tutor.isFetching,
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
              refreshing={tutor.isFetching}
              onRefresh={tutor.refetch}
              tintColor={PetFlowColors.primary}
              colors={[PetFlowColors.primary]}
            />
          }>
          <View style={[styles.cabecalho, shadow(1)]}>
            <Pressable
              onPress={() => setEscolhendoAvatar((v) => !v)}
              style={({ pressed }) => [styles.avatar, pressed && styles.pressionado]}
              accessibilityLabel="Trocar avatar">
              <Text style={styles.avatarEmoji}>{avatar}</Text>
              <View style={styles.avatarLapis}>
                <Feather name="edit-2" size={11} color="#fff" />
              </View>
            </Pressable>

            <Text style={styles.nome}>{tutor.data?.nome}</Text>
            <Text style={styles.email}>{tutor.data?.email}</Text>

            {escolhendoAvatar ? (
              <View style={styles.avatares}>
                {AVATARES.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => escolherAvatar(emoji)}
                    style={[styles.avatarOpcao, emoji === avatar && styles.avatarOpcaoAtiva]}>
                    <Text style={styles.avatarOpcaoEmoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.numeros}>
              <Numero valor={pets.data?.length ?? 0} rotulo="pets" />
              <View style={styles.divisor} />
              <Numero
                valor={
                  agenda.data?.filter((a) => a.status !== 'CANCELADO').length ?? 0
                }
                rotulo="consultas"
              />
            </View>
          </View>

          <Bloco titulo="Seus dados">
            <Linha rotulo="Telefone" valor={tutor.data?.telefone || 'Não informado'} />
            <Linha
              rotulo="Emergência"
              valor={tutor.data?.telefoneEmergencia || 'Não informado'}
            />
            <Linha rotulo="Canal preferido" valor={tutor.data?.canalPreferencial ?? '—'} />
            <Linha rotulo="Cliente desde" valor={formatarData(tutor.data?.dtCadastro)} ultima />
          </Bloco>

          <View style={styles.aviso}>
            <Feather name="info" size={16} color={PetFlowColors.blueDark} />
            <Text style={styles.avisoTexto}>
              Para alterar nome, e-mail ou telefone, fale com a sua clínica — é ela que mantém o
              seu cadastro.
            </Text>
          </View>

          <Bloco titulo="Conta">
            <Pressable
              style={({ pressed }) => [styles.acao, pressed && styles.pressionado]}
              onPress={confirmarSaida}>
              <View style={styles.acaoIcone}>
                <Feather name="log-out" size={17} color={PetFlowColors.danger} />
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
  return (
    <View style={styles.numero}>
      <Text style={styles.numeroValor}>{valor}</Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
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
  return (
    <View style={[styles.linha, !ultima && styles.linhaBorda]}>
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PetFlowColors.background },
  conteudo: { padding: Spacing.xl, paddingBottom: 40, gap: Spacing.xl },
  cabecalho: {
    alignItems: 'center',
    backgroundColor: PetFlowColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    padding: Spacing.xxl,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: PetFlowColors.primarySoft,
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
    backgroundColor: PetFlowColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PetFlowColors.card,
  },
  pressionado: { opacity: 0.75 },
  nome: {
    fontSize: 21,
    fontWeight: '800',
    color: PetFlowColors.text,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  email: { fontSize: 14, color: PetFlowColors.textSecondary, marginTop: 2 },
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
    backgroundColor: PetFlowColors.background,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
  },
  avatarOpcaoAtiva: {
    borderColor: PetFlowColors.primary,
    backgroundColor: PetFlowColors.primarySoft,
  },
  avatarOpcaoEmoji: { fontSize: 22 },
  numeros: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: PetFlowColors.border,
    alignSelf: 'stretch',
  },
  numero: { flex: 1, alignItems: 'center' },
  numeroValor: { fontSize: 20, fontWeight: '800', color: PetFlowColors.primary },
  numeroRotulo: { fontSize: 12, color: PetFlowColors.textSecondary, marginTop: 2 },
  divisor: { width: 1, height: 32, backgroundColor: PetFlowColors.border },
  bloco: { gap: Spacing.md },
  blocoTitulo: { fontSize: 15, fontWeight: '700', color: PetFlowColors.text },
  blocoCartao: {
    backgroundColor: PetFlowColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    paddingHorizontal: Spacing.lg,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingVertical: Spacing.md + 1,
  },
  linhaBorda: { borderBottomWidth: 1, borderBottomColor: PetFlowColors.border },
  linhaRotulo: { fontSize: 14, color: PetFlowColors.textSecondary },
  linhaValor: { fontSize: 14, fontWeight: '600', color: PetFlowColors.text, maxWidth: '58%' },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: PetFlowColors.blueSoft,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  avisoTexto: { flex: 1, fontSize: 13, lineHeight: 19, color: PetFlowColors.blueDark },
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
    backgroundColor: PetFlowColors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acaoTexto: { fontSize: 15, fontWeight: '600', color: PetFlowColors.danger },
  rodape: {
    textAlign: 'center',
    fontSize: 12,
    color: PetFlowColors.textMuted,
    marginTop: Spacing.sm,
  },
});
