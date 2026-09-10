import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect, Field, FormError, Input, PrimaryButton } from '@/components/ui/form';
import { ScreenHeader } from '@/components/ui/screen-header';
import { PetFlowColors, Radius, Spacing } from '@/constants/petflow';
import { useAuth } from '@/contexts/auth-context';
import { useClinicasPublicas } from '@/hooks/use-catalogo';
import { getErrorMessage } from '@/lib/api/errors';

/**
 * Cadastro do tutor.
 *
 * A clínica é obrigatória: `POST /api/tutores` exige `clinicaId` e o tutor se
 * cadastra *em uma clínica*, que é quem vai atendê-lo. A lista vem de
 * `GET /api/clinicas/publicas`, a única leitura da API que não pede token —
 * sem ela esta tela não teria como descobrir o número e o cadastro falhava
 * com 422.
 */
export default function CadastroTutorScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const clinicas = useClinicasPublicas();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [clinicaEscolhida, setClinicaEscolhida] = useState<number | undefined>();

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  /**
   * Uma clínica só na lista já vale como escolhida — derivado, e não copiado
   * para o estado por um efeito: sincronizar estado com dado que veio da API é
   * o que gera renderização em cascata.
   */
  const clinicaId =
    clinicaEscolhida ?? (clinicas.data?.length === 1 ? clinicas.data[0].id : undefined);

  function validar(): boolean {
    const novos: Record<string, string> = {};
    if (!nome.trim()) novos.nome = 'Diga como podemos te chamar.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) novos.email = 'Informe um e-mail válido.';
    if (senha.length < 6) novos.senha = 'A senha precisa de pelo menos 6 caracteres.';
    if (senha !== confirmacao) novos.confirmacao = 'A confirmação não bate com a senha.';
    if (!clinicaId) novos.clinicaId = 'Escolha a clínica que atende o seu pet.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function cadastrar() {
    setErroEnvio(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      // signUp cadastra e já faz login: o guarda de rota leva para as abas.
      await signUp({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        clinicaId: clinicaId as number,
        telefone: telefone.replace(/\D/g, '') || undefined,
        canalPreferencial: 'APP',
      });
      router.replace('/(tabs)');
    } catch (err) {
      setErroEnvio(getErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Criar conta" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroIcone}>
              <MaterialCommunityIcons name="paw" size={30} color={PetFlowColors.primary} />
            </View>
            <Text style={styles.heroTitulo}>Bem-vindo ao PetFlow</Text>
            <Text style={styles.heroTexto}>
              Acompanhe vacinas, consultas e a rotina de cuidado dos seus pets em um lugar só.
            </Text>
          </View>

          <Field label="Seu nome" required error={erros.nome}>
            <Input
              value={nome}
              onChangeText={setNome}
              placeholder="Maria Silva"
              autoCapitalize="words"
              invalid={!!erros.nome}
              editable={!enviando}
            />
          </Field>

          <Field label="E-mail" required error={erros.email}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              invalid={!!erros.email}
              editable={!enviando}
            />
          </Field>

          <Field label="Telefone" hint="Opcional. A clínica usa para falar com você.">
            <Input
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(11) 99999-0000"
              keyboardType="phone-pad"
              editable={!enviando}
            />
          </Field>

          <Field
            label="Sua clínica"
            required
            error={erros.clinicaId}
            hint="É ela que atende os seus pets e mantém o seu cadastro.">
            {clinicas.isPending ? (
              <Text style={styles.aviso}>Carregando clínicas…</Text>
            ) : clinicas.error ? (
              <Text style={styles.avisoErro}>
                Não foi possível carregar as clínicas. Verifique a conexão e volte a esta tela.
              </Text>
            ) : clinicas.data?.length ? (
              <ChipSelect
                opcoes={clinicas.data.map((c) => ({
                  valor: c.id,
                  rotulo: c.nome,
                  detalhe: [c.cidade, c.estado].filter(Boolean).join(' · '),
                }))}
                valor={clinicaId}
                onChange={setClinicaEscolhida}
                scroll
              />
            ) : (
              <Text style={styles.aviso}>
                Nenhuma clínica disponível no momento. Fale com a sua clínica para que ela se
                cadastre na plataforma.
              </Text>
            )}
          </Field>

          <Field label="Senha" required error={erros.senha}>
            <Input
              value={senha}
              onChangeText={setSenha}
              placeholder="Pelo menos 6 caracteres"
              secureTextEntry
              invalid={!!erros.senha}
              editable={!enviando}
            />
          </Field>

          <Field label="Confirmar senha" required error={erros.confirmacao}>
            <Input
              value={confirmacao}
              onChangeText={setConfirmacao}
              placeholder="Repita a senha"
              secureTextEntry
              invalid={!!erros.confirmacao}
              editable={!enviando}
            />
          </Field>

          <FormError message={erroEnvio} />

          <PrimaryButton
            label="Criar conta"
            icon="arrow-forward"
            loading={enviando}
            onPress={cadastrar}
          />

          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>Já tem conta? </Text>
            <Text style={styles.rodapeLink} onPress={() => router.replace('/login')}>
              Entrar
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PetFlowColors.background },
  flex: { flex: 1 },
  conteudo: { padding: Spacing.xl, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: Spacing.xxl },
  heroIcone: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: PetFlowColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitulo: {
    fontSize: 21,
    fontWeight: '800',
    color: PetFlowColors.text,
    marginTop: Spacing.md,
  },
  heroTexto: {
    fontSize: 14,
    lineHeight: 20,
    color: PetFlowColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  aviso: {
    fontSize: 13,
    lineHeight: 19,
    color: PetFlowColors.textSecondary,
    backgroundColor: PetFlowColors.infoBg,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  avisoErro: {
    fontSize: 13,
    lineHeight: 19,
    color: PetFlowColors.danger,
    backgroundColor: PetFlowColors.dangerSoft,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  rodapeTexto: { color: PetFlowColors.textSecondary, fontSize: 14 },
  rodapeLink: { color: PetFlowColors.primary, fontSize: 14, fontWeight: '700' },
});
