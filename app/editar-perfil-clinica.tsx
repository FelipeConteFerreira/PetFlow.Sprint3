import { Feather, Ionicons } from '@expo/vector-icons';
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

import { PetFlowColors } from '@/constants/petflow';
import { getProfile, saveProfile } from '@/lib/profile-storage';
import { AVATAR_OPTIONS, DEFAULT_PROFILE, type TutorProfile } from '@/types/profile';

export default function EditarPerfilClinicaScreen() {
  const router = useRouter();
  const [form, setForm] = useState<TutorProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    getProfile().then(setForm);
  }, []);

  const update = <K extends keyof TutorProfile>(key: K, value: TutorProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      Alert.alert('Campo obrigatório', 'Digite o nome da clínica.');
      return;
    }
    try {
      await saveProfile({ ...form, userType: 'clinica' });
      Alert.alert('Salvo', 'Dados da clínica atualizados.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={PetFlowColors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Dados da Clínica</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Identidade</Text>
          <View style={styles.avatarRow}>
            {AVATAR_OPTIONS.map((emoji) => {
              const selected = form.avatarEmoji === emoji;
              return (
                <Pressable
                  key={emoji}
                  style={[styles.avatarOption, selected && styles.avatarSelected]}
                  onPress={() => update('avatarEmoji', emoji)}>
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>
            Nome da clínica <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="PetCare Veterinária"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.name}
            onChangeText={(t) => update('name', t)}
          />
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="contato@clinica.com"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.email}
            onChangeText={(t) => update('email', t)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Telefone da clínica</Text>
          <TextInput
            style={styles.input}
            placeholder="(11) 3333-4444"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.clinicPhone ?? ''}
            onChangeText={(t) => update('clinicPhone', t)}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: São Paulo"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.city}
            onChangeText={(t) => update('city', t)}
          />
          <Text style={styles.label}>Endereço</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Rua, número, bairro"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.clinicAddress ?? ''}
            onChangeText={(t) => update('clinicAddress', t)}
            multiline
          />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.saveText}>Salvar alterações</Text>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PetFlowColors.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  avatarOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
  avatarSelected: {
    borderColor: PetFlowColors.blue,
    backgroundColor: '#EBF4FC',
  },
  avatarEmoji: { fontSize: 26 },
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PetFlowColors.blue,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
