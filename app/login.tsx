import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Field, FormError, Input, PrimaryButton } from '@/components/ui/form';
import { PetFlowColors, Radius, Spacing, shadow } from '@/constants/petflow';
import { useAuth } from '@/contexts/auth-context';
import { getErrorMessage } from '@/lib/api/errors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar(): boolean {
    const novos: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) novos.email = 'Informe um e-mail válido.';
    if (senha.length < 6) novos.senha = 'A senha tem pelo menos 6 caracteres.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function entrar() {
    setErroEnvio(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await signIn(email.trim().toLowerCase(), senha);
      router.replace('/(tabs)');
    } catch (err) {
      setErroEnvio(getErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.marcaBloco}>
            <View style={[styles.marcaIcone, shadow(2)]}>
              <MaterialCommunityIcons name="paw" size={36} color="#fff" />
            </View>
            <Text style={styles.marca}>PetFlow</Text>
            <Text style={styles.marcaTexto}>
              Os cuidados do seu pet, acompanhados de perto.
            </Text>
          </View>

          <View style={[styles.cartao, shadow(1)]}>
            <Field label="E-mail" error={erros.email}>
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

            <Field label="Senha" error={erros.senha}>
              <Input
                value={senha}
                onChangeText={setSenha}
                placeholder="••••••••"
                secureTextEntry
                invalid={!!erros.senha}
                editable={!enviando}
              />
            </Field>

            <FormError message={erroEnvio} />

            <PrimaryButton
              label="Entrar"
              icon="log-in-outline"
              loading={enviando}
              onPress={entrar}
            />
          </View>

          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>Ainda não tem conta? </Text>
            <Text style={styles.rodapeLink} onPress={() => router.push('/cadastro-tutor')}>
              Cadastre-se
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
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  marcaBloco: { alignItems: 'center', marginBottom: Spacing.xxl },
  marcaIcone: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: PetFlowColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marca: {
    fontSize: 30,
    fontWeight: '800',
    color: PetFlowColors.text,
    marginTop: Spacing.lg,
    letterSpacing: -0.6,
  },
  marcaTexto: {
    fontSize: 15,
    color: PetFlowColors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  cartao: {
    backgroundColor: PetFlowColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    padding: Spacing.xl,
  },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  rodapeTexto: { color: PetFlowColors.textSecondary, fontSize: 14 },
  rodapeLink: { color: PetFlowColors.primary, fontSize: 14, fontWeight: '700' },
});
