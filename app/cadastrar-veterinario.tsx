import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import {
  getVeterinarianById,
  saveVeterinarian,
  updateVeterinarian,
} from '@/lib/veterinarians-storage';
import type { VetSpecialty, Veterinarian } from '@/types/veterinarian';
import { SPECIALTY_LABELS, SPECIALTY_OPTIONS } from '@/types/veterinarian';

const EMPTY_FORM = {
  name: '',
  crmv: '',
  specialty: 'clinico_geral' as VetSpecialty,
  phone: '',
  email: '',
  active: true,
};

export default function CadastrarVeterinarioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    getVeterinarianById(id).then((vet) => {
      if (vet) {
        setCreatedAt(vet.createdAt);
        setForm({
          name: vet.name,
          crmv: vet.crmv,
          specialty: vet.specialty,
          phone: vet.phone,
          email: vet.email,
          active: vet.active,
        });
      }
      setLoading(false);
    });
  }, [id]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      Alert.alert('Campo obrigatório', 'Digite o nome do veterinário.');
      return;
    }

    const vet: Veterinarian = {
      id: id ?? Date.now().toString(),
      name,
      crmv: form.crmv.trim(),
      specialty: form.specialty,
      phone: form.phone.trim(),
      email: form.email.trim(),
      active: form.active,
      createdAt: createdAt ?? new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updateVeterinarian(vet);
      } else {
        await saveVeterinarian(vet);
      }
      Alert.alert('Sucesso', isEditing ? 'Veterinário atualizado!' : 'Veterinário cadastrado!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={PetFlowColors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Veterinário' : 'Novo Veterinário'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.preview}>
            <View style={styles.previewIcon}>
              <MaterialCommunityIcons name="stethoscope" size={32} color={PetFlowColors.blue} />
            </View>
            <Text style={styles.previewName}>{form.name.trim() || 'Dr(a). Nome'}</Text>
            <Text style={styles.previewSub}>
              {SPECIALTY_LABELS[form.specialty]}
              {form.crmv.trim() ? ` · CRMV ${form.crmv.trim()}` : ''}
            </Text>
          </View>

          <Text style={styles.label}>
            Nome completo <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Dr(a). Maria Silva"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.name}
            onChangeText={(t) => update('name', t)}
          />

          <Text style={styles.label}>CRMV</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: SP-12345"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.crmv}
            onChangeText={(t) => update('crmv', t)}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Especialidade</Text>
          <View style={styles.specialtyGrid}>
            {SPECIALTY_OPTIONS.map((spec) => {
              const selected = form.specialty === spec;
              return (
                <Pressable
                  key={spec}
                  style={[styles.specialtyChip, selected && styles.choiceSelected]}
                  onPress={() => update('specialty', spec)}>
                  <Text style={[styles.specialtyText, selected && styles.choiceLabelSelected]}>
                    {SPECIALTY_LABELS[spec]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="(11) 99999-9999"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.phone}
            onChangeText={(t) => update('phone', t)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="vet@clinica.com"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.email}
            onChangeText={(t) => update('email', t)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Ativo na clínica</Text>
              <Text style={styles.switchSub}>Veterinários inativos não aparecem nos atendimentos</Text>
            </View>
            <Switch
              value={form.active}
              onValueChange={(v) => update('active', v)}
              trackColor={{ false: PetFlowColors.border, true: '#B5D4F4' }}
              thumbColor={form.active ? PetFlowColors.blue : '#f4f4f4'}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.saveText}>
              {isEditing ? 'Salvar alterações' : 'Cadastrar veterinário'}
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
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: PetFlowColors.textSecondary,
  },
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
  preview: {
    alignItems: 'center',
    backgroundColor: '#EBF4FC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#B5D4F4',
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PetFlowColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '800',
    color: PetFlowColors.text,
  },
  previewSub: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
  choiceSelected: {
    borderColor: PetFlowColors.blue,
    backgroundColor: '#EBF4FC',
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '600',
    color: PetFlowColors.textSecondary,
  },
  choiceLabelSelected: {
    color: '#185FA5',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PetFlowColors.card,
    borderRadius: 12,
    padding: 16,
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
    backgroundColor: PetFlowColors.blue,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
