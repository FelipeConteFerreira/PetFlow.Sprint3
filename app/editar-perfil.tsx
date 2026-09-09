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
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetFlowColors } from '@/constants/petflow';
import { getProfile, saveProfile } from '@/lib/profile-storage';
import { maskTimeInput } from '@/lib/reminder-utils';
import { AVATAR_OPTIONS, DEFAULT_PROFILE, type TutorProfile } from '@/types/profile';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [form, setForm] = useState<TutorProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    getProfile().then(setForm);
  }, []);

  const update = <K extends keyof TutorProfile>(key: K, value: TutorProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await saveProfile(form);
      Alert.alert('Salvo', 'Seu perfil foi atualizado.', [
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
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Avatar</Text>
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

          <Text style={styles.sectionTitle}>Dados pessoais</Text>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.name}
            onChangeText={(t) => update('name', t)}
          />
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.email}
            onChangeText={(t) => update('email', t)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: São Paulo"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.city}
            onChangeText={(t) => update('city', t)}
          />

          <Text style={styles.sectionTitle}>Veterinário</Text>
          <Text style={styles.label}>Nome do veterinário</Text>
          <TextInput
            style={styles.input}
            placeholder="Dr(a). ..."
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.vetName}
            onChangeText={(t) => update('vetName', t)}
          />
          <Text style={styles.label}>Telefone do vet</Text>
          <TextInput
            style={styles.input}
            placeholder="(11) 99999-9999"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.vetPhone}
            onChangeText={(t) => update('vetPhone', t)}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Emergência 24h — nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Clínica / hospital"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.emergencyName}
            onChangeText={(t) => update('emergencyName', t)}
          />
          <Text style={styles.label}>Emergência 24h — telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="(11) 99999-9999"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.emergencyPhone}
            onChangeText={(t) => update('emergencyPhone', t)}
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>Lembretes</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Avisar 1 dia antes</Text>
              <Text style={styles.switchSub}>Lembrete no dia anterior</Text>
            </View>
            <Switch
              value={form.notifyDayBefore}
              onValueChange={(v) => update('notifyDayBefore', v)}
              trackColor={{ false: PetFlowColors.border, true: PetFlowColors.aiBorder }}
              thumbColor={form.notifyDayBefore ? PetFlowColors.primary : '#f4f4f4'}
            />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Avisar 1 semana antes</Text>
              <Text style={styles.switchSub}>Para vacinas e check-ups</Text>
            </View>
            <Switch
              value={form.notifyWeekBefore}
              onValueChange={(v) => update('notifyWeekBefore', v)}
              trackColor={{ false: PetFlowColors.border, true: PetFlowColors.aiBorder }}
              thumbColor={form.notifyWeekBefore ? PetFlowColors.primary : '#f4f4f4'}
            />
          </View>
          <Text style={styles.label}>Horário padrão dos avisos</Text>
          <TextInput
            style={styles.input}
            placeholder="09:00"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.defaultReminderTime}
            onChangeText={(t) => update('defaultReminderTime', maskTimeInput(t))}
            keyboardType="number-pad"
            maxLength={5}
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
    color: PetFlowColors.primary,
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
    borderColor: PetFlowColors.primary,
    backgroundColor: PetFlowColors.aiBg,
  },
  avatarEmoji: { fontSize: 26 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: PetFlowColors.text,
    marginBottom: 8,
  },
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PetFlowColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
  },
  switchText: { flex: 1, paddingRight: 12 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: PetFlowColors.text },
  switchSub: { fontSize: 12, color: PetFlowColors.textSecondary, marginTop: 2 },
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
    backgroundColor: PetFlowColors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
