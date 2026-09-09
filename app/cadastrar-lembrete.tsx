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

import { PetFlowColors } from '@/constants/petflow';
import { getPets } from '@/lib/pets-storage';
import {
  maskDateInput,
  maskTimeInput,
  parseDateInput,
  toIsoDate,
} from '@/lib/reminder-utils';
import { saveReminder } from '@/lib/reminders-storage';
import type { Pet } from '@/types/pet';
import type { Reminder, ReminderType } from '@/types/reminder';
import { REMINDER_TYPE_LABELS } from '@/types/reminder';
import { SPECIES_LABELS } from '@/types/pet';

const TYPE_OPTIONS: ReminderType[] = ['vacina', 'medicamento', 'checkup', 'outro'];

const TYPE_ICONS: Record<ReminderType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  vacina: 'needle',
  medicamento: 'pill',
  checkup: 'stethoscope',
  outro: 'bell-outline',
};

const EMPTY_FORM = {
  petId: '',
  type: 'vacina' as ReminderType,
  title: '',
  date: '',
  time: '',
  notes: '',
};

export default function CadastrarLembreteScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    getPets().then((list) => {
      setPets(list);
      if (list.length === 1) {
        setForm((prev) => ({ ...prev, petId: list[0].id }));
      }
    });
  }, []);

  const selectedPet = pets.find((p) => p.id === form.petId);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'type' && !prev.title.trim()) {
        next.title = REMINDER_TYPE_LABELS[value as ReminderType];
      }
      return next;
    });
  };

  const handleClear = () => setForm({ ...EMPTY_FORM, petId: form.petId });

  const handleSave = async () => {
    if (!form.petId || !selectedPet) {
      Alert.alert('Selecione um pet', 'Cadastre um pet antes de criar um lembrete.', [
        { text: 'Cadastrar Pet', onPress: () => router.replace('/cadastrar-pet') },
        { text: 'Cancelar', style: 'cancel' },
      ]);
      return;
    }
    const title = form.title.trim();
    if (!title) {
      Alert.alert('Campo obrigatório', 'Digite o título do lembrete.');
      return;
    }
    const parsedDate = parseDateInput(form.date);
    if (!parsedDate) {
      Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA (ex.: 24/05/2026).');
      return;
    }
    const timeMatch = form.time.trim().match(/^(\d{2}):(\d{2})$/);
    if (!timeMatch) {
      Alert.alert('Hora inválida', 'Use o formato HH:MM (ex.: 10:00).');
      return;
    }
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    if (hours > 23 || minutes > 59) {
      Alert.alert('Hora inválida', 'Informe um horário válido.');
      return;
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      petId: selectedPet.id,
      petName: selectedPet.name,
      type: form.type,
      title,
      date: toIsoDate(parsedDate),
      time: form.time.trim(),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await saveReminder(reminder);
      Alert.alert('Sucesso', 'Lembrete criado!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o lembrete.');
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
          <Text style={styles.headerTitle}>Novo Lembrete</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {pets.length === 0 ? (
            <View style={styles.emptyPets}>
              <Text style={styles.emptyText}>Cadastre um pet antes de criar lembretes.</Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push('/cadastrar-pet')}>
                <Text style={styles.emptyButtonText}>Cadastrar Pet</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.label}>
                Pet <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.petList}>
                {pets.map((pet) => {
                  const selected = form.petId === pet.id;
                  return (
                    <Pressable
                      key={pet.id}
                      style={[styles.petChip, selected && styles.choiceSelected]}
                      onPress={() => update('petId', pet.id)}>
                      <Text style={[styles.petChipText, selected && styles.choiceLabelSelected]}>
                        {pet.name}
                      </Text>
                      <Text style={styles.petChipSub}>
                        {pet.breed} · {SPECIES_LABELS[pet.species]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Tipo</Text>
              <View style={styles.typeGrid}>
                {TYPE_OPTIONS.map((type) => {
                  const selected = form.type === type;
                  return (
                    <Pressable
                      key={type}
                      style={[styles.typeButton, selected && styles.choiceSelected]}
                      onPress={() => update('type', type)}>
                      <MaterialCommunityIcons
                        name={TYPE_ICONS[type]}
                        size={20}
                        color={selected ? PetFlowColors.primary : PetFlowColors.textMuted}
                      />
                      <Text style={[styles.typeLabel, selected && styles.choiceLabelSelected]}>
                        {REMINDER_TYPE_LABELS[type]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>
                Título <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: Vacina — V10"
                placeholderTextColor={PetFlowColors.textMuted}
                value={form.title}
                onChangeText={(text) => update('title', text)}
              />

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>
                    Data <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={PetFlowColors.textMuted}
                    value={form.date}
                    onChangeText={(text) => update('date', maskDateInput(text))}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>
                    Hora <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    placeholderTextColor={PetFlowColors.textMuted}
                    value={form.time}
                    onChangeText={(text) => update('time', maskTimeInput(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>

              <Text style={styles.label}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex.: Reforço anual da vacina V10."
                placeholderTextColor={PetFlowColors.textMuted}
                value={form.notes}
                onChangeText={(text) => update('notes', text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </>
          )}
        </ScrollView>

        {pets.length > 0 ? (
          <View style={styles.footer}>
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Feather name="trash-2" size={18} color={PetFlowColors.textSecondary} />
              <Text style={styles.clearText}>Limpar</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="notifications" size={20} color="#fff" />
              <Text style={styles.saveText}>Salvar Lembrete</Text>
            </Pressable>
          </View>
        ) : null}
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
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: PetFlowColors.text,
    marginBottom: 8,
  },
  required: { color: PetFlowColors.primary },
  input: {
    backgroundColor: PetFlowColors.card,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: PetFlowColors.text,
    marginBottom: 20,
  },
  textArea: { minHeight: 88, paddingTop: 14 },
  petList: { gap: 10, marginBottom: 20 },
  petChip: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
    padding: 14,
  },
  petChipText: { fontSize: 16, fontWeight: '700', color: PetFlowColors.text },
  petChipSub: { fontSize: 13, color: PetFlowColors.textSecondary, marginTop: 2 },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
  typeLabel: { fontSize: 13, fontWeight: '600', color: PetFlowColors.textMuted },
  choiceSelected: {
    borderColor: PetFlowColors.primary,
    backgroundColor: PetFlowColors.aiBg,
  },
  choiceLabelSelected: { color: PetFlowColors.primary },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  emptyPets: { alignItems: 'center', paddingVertical: 40 },
  emptyText: {
    fontSize: 15,
    color: PetFlowColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: PetFlowColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
  },
  clearText: { fontSize: 14, fontWeight: '600', color: PetFlowColors.textSecondary },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: PetFlowColors.blue,
  },
  saveText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
