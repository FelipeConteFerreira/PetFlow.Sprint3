import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetFlowColors } from '@/constants/petflow';
import { useAuth } from '@/contexts/auth-context';
import { getErrorMessage } from '@/lib/api/errors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar(): string | null {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return 'Informe um e-mail válido.';
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    return null;
  }

  async function handleEntrar() {
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }

    setErro(null);
    setEnviando(true);
    try {
      await signIn(email.trim().toLowerCase(), senha);
      router.replace('/(tabs)');
    } catch (err) {
      setErro(getErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.titulo}>PetFlow</Text>
        <Text style={styles.subtitulo}>Entre para acompanhar os cuidados do seu pet</Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="voce@email.com"
          placeholderTextColor="#9CA3AF"
          editable={!enviando}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
          editable={!enviando}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Pressable
          style={[styles.botao, enviando && styles.botaoDesabilitado]}
          onPress={handleEntrar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botaoTexto}>Entrar</Text>
          )}
        </Pressable>

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>Ainda não tem conta? </Text>
          <Link href="/cadastro-tutor" style={styles.rodapeLink}>
            Cadastre-se
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PetFlowColors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 48, textAlign: 'center' },
  titulo: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: PetFlowColors.primary,
    marginTop: 8,
  },
  subtitulo: { fontSize: 15, textAlign: 'center', color: '#6B7280', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    color: '#111827',
  },
  erro: { color: '#DC2626', fontSize: 14, marginBottom: 12 },
  botao: {
    backgroundColor: PetFlowColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  rodapeTexto: { color: '#6B7280', fontSize: 14 },
  rodapeLink: { color: PetFlowColors.primary, fontSize: 14, fontWeight: '700' },
});
