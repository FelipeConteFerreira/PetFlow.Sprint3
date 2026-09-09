import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChooseProfileTypeButton } from '@/components/choose-profile-type-button';
import { PetFlowColors } from '@/constants/petflow';
import { getErrorMessage, onlyDigits, signupClinicaAndLogin } from '@/lib/api/register';
import { getProfile, saveProfile } from '@/lib/profile-storage';

export default function CadastroClinicaScreen() {
  const router = useRouter();
  const [clinicName, setClinicName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [crmv, setCrmv] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then((profile) => {
      if (profile.name) setClinicName(profile.name);
      if (profile.email) setEmail(profile.email);
      if (profile.city) setCidade(profile.city);
      if (profile.clinicAddress) setLogradouro(profile.clinicAddress);
    });
  }, []);

  const handleRegister = async () => {
    const nomeClinica = clinicName.trim();
    const mail = email.trim().toLowerCase();
    const cnpjDigits = onlyDigits(cnpj);

    if (!nomeClinica) {
      Alert.alert('Campo obrigatório', 'Digite o nome da clínica.');
      return;
    }
    if (cnpjDigits.length !== 14) {
      Alert.alert('CNPJ inválido', 'Informe um CNPJ com 14 dígitos.');
      return;
    }
    if (!logradouro.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o endereço (logradouro).');
      return;
    }
    if (!cidade.trim()) {
      Alert.alert('Campo obrigatório', 'Informe a cidade.');
      return;
    }
    if (estado.trim().length !== 2) {
      Alert.alert('Estado inválido', 'Use a sigla do estado com 2 letras (ex.: SP).');
      return;
    }
    if (!responsavelNome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do veterinário responsável.');
      return;
    }
    if (!crmv.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o CRMV do responsável.');
      return;
    }
    if (!mail || !mail.includes('@')) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido para login.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Senha inválida', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Senhas diferentes', 'A confirmação deve ser igual à senha.');
      return;
    }

    setLoading(true);
    try {
      const current = await getProfile();
      const { profile } = await signupClinicaAndLogin({
        nomeClinica,
        cnpj: cnpjDigits,
        logradouro: logradouro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        nomeResponsavel: responsavelNome.trim(),
        crmv: crmv.trim(),
        email: mail,
        senha: password,
      });
      await saveProfile({
        ...current,
        ...profile,
        password,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erro', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace('/onboarding')}
            style={styles.backButton}
            hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={PetFlowColors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Cadastro da Clínica</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="hospital-building" size={36} color={PetFlowColors.blue} />
            </View>
            <Text style={styles.heroTitle}>Crie sua conta</Text>
            <Text style={styles.heroSub}>
              Cadastro na API Clyvo Vet: clínica + veterinário responsável.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Dados da clínica</Text>
          <Text style={styles.label}>
            Nome da clínica <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="PetCare Veterinária"
            placeholderTextColor={PetFlowColors.textMuted}
            value={clinicName}
            onChangeText={setClinicName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            CNPJ <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="00000000000000 (14 dígitos)"
            placeholderTextColor={PetFlowColors.textMuted}
            value={cnpj}
            onChangeText={setCnpj}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>
            Logradouro <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Av. Paulista, 1000"
            placeholderTextColor={PetFlowColors.textMuted}
            value={logradouro}
            onChangeText={setLogradouro}
          />

          <Text style={styles.label}>
            Cidade <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="São Paulo"
            placeholderTextColor={PetFlowColors.textMuted}
            value={cidade}
            onChangeText={setCidade}
          />

          <Text style={styles.label}>
            Estado (UF) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="SP"
            placeholderTextColor={PetFlowColors.textMuted}
            value={estado}
            onChangeText={setEstado}
            autoCapitalize="characters"
            maxLength={2}
          />

          <Text style={styles.sectionTitle}>Acesso (veterinário)</Text>
          <Text style={styles.label}>
            Nome do responsável <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Dr(a). Maria Silva"
            placeholderTextColor={PetFlowColors.textMuted}
            value={responsavelNome}
            onChangeText={setResponsavelNome}
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            CRMV <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="SP-12345"
            placeholderTextColor={PetFlowColors.textMuted}
            value={crmv}
            onChangeText={setCrmv}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            E-mail de login <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="contato@clinica.com"
            placeholderTextColor={PetFlowColors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={styles.label}>
            Senha <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Sua senha"
              placeholderTextColor={PetFlowColors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={8}>
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={PetFlowColors.textMuted}
              />
            </Pressable>
          </View>

          <Text style={styles.label}>
            Confirmar senha <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            placeholderTextColor={PetFlowColors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <Text style={styles.hint}>
            A clínica é criada na API e o login usa o perfil VETERINARIO (responsável).
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <ChooseProfileTypeButton variant="outline" accent="blue" />
          <Pressable
            style={[styles.registerButton, loading && styles.registerDisabled]}
            onPress={handleRegister}
            disabled={loading}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.registerText}>
              {loading ? 'Criando conta...' : 'Criar conta da clínica'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PetFlowColors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: PetFlowColors.text,
  },
  headerSpacer: { width: 40 },
  content: { padding: 20, paddingBottom: 32 },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EBF4FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#B5D4F4',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PetFlowColors.text,
  },
  heroSub: {
    fontSize: 14,
    color: PetFlowColors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PetFlowColors.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: PetFlowColors.text,
    marginBottom: 8,
  },
  required: { color: '#DC2626' },
  input: {
    backgroundColor: PetFlowColors.card,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: PetFlowColors.text,
    marginBottom: 16,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PetFlowColors.card,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    borderRadius: 12,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: PetFlowColors.text,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  hint: {
    fontSize: 12,
    color: PetFlowColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PetFlowColors.blue,
    paddingVertical: 16,
    borderRadius: 14,
  },
  registerDisabled: { opacity: 0.7 },
  registerText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
