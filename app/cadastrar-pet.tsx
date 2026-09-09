import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { savePet } from '@/lib/pets-storage';
import type { Pet, PetSex, PetSpecies } from '@/types/pet';
import { SEX_LABELS, SPECIES_EMOJI, SPECIES_LABELS } from '@/types/pet';

const EMPTY_FORM = {
  name: '',
  species: 'cao' as PetSpecies,
  breed: '',
  age: '',
  weight: '',
  sex: 'macho' as PetSex,
};

type SpeciesOption = { value: PetSpecies; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap };
type SexOption = { value: PetSex; label: string; icon: keyof typeof Ionicons.glyphMap };

const SPECIES_OPTIONS: SpeciesOption[] = [
  { value: 'cao', label: 'Cão', icon: 'dog' },
  { value: 'gato', label: 'Gato', icon: 'cat' },
  { value: 'outro', label: 'Outro', icon: 'paw' },
];

const SEX_OPTIONS: SexOption[] = [
  { value: 'macho', label: 'Macho', icon: 'male' },
  { value: 'femea', label: 'Fêmea', icon: 'female' },
];

export default function CadastrarPetScreen() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);

  const previewName = form.name.trim() || 'Bolinha';
  const previewSubtitle = useMemo(() => {
    const breed = form.breed.trim() || 'Golden Retriever';
    const parts = [breed, SPECIES_LABELS[form.species], SEX_LABELS[form.sex]];
    return parts.join(' · ');
  }, [form.breed, form.species, form.sex]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const breed = form.breed.trim();
    const age = form.age.trim();

    if (!name) {
      Alert.alert('Campo obrigatório', 'Digite o nome do seu pet.');
      return;
    }
    if (!breed) {
      Alert.alert('Campo obrigatório', 'Digite a raça do seu pet.');
      return;
    }
    if (!age) {
      Alert.alert('Campo obrigatório', 'Digite a idade do seu pet.');
      return;
    }

    const pet: Pet = {
      id: Date.now().toString(),
      name,
      species: form.species,
      breed,
      age,
      weight: form.weight.trim(),
      sex: form.sex,
      createdAt: new Date().toISOString(),
    };

    try {
      await savePet(pet);
      Alert.alert('Sucesso', `${name} foi cadastrado!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o pet. Tente novamente.');
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
          <Text style={styles.headerTitle}>Cadastrar Pet</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.previewLabel}>Preview do Cartão</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewEmoji}>{SPECIES_EMOJI[form.species]}</Text>
            <View style={styles.previewText}>
              <Text style={styles.previewName}>{previewName}</Text>
              <Text style={styles.previewSubtitle}>{previewSubtitle}</Text>
            </View>
          </View>

          <Text style={styles.label}>
            Nome <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do seu pet"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.name}
            onChangeText={(text) => update('name', text)}
          />

          <Text style={styles.label}>Espécie</Text>
          <View style={styles.choiceRow}>
            {SPECIES_OPTIONS.map((option) => {
              const selected = form.species === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.choiceButton, selected && styles.choiceSelected]}
                  onPress={() => update('species', option.value)}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={22}
                    color={selected ? PetFlowColors.primary : PetFlowColors.textMuted}
                  />
                  <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>
            Raça <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a raça do seu pet"
            placeholderTextColor={PetFlowColors.textMuted}
            value={form.breed}
            onChangeText={(text) => update('breed', text)}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>
                Idade (anos) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: 3"
                placeholderTextColor={PetFlowColors.textMuted}
                value={form.age}
                onChangeText={(text) => update('age', text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: 25,5"
                placeholderTextColor={PetFlowColors.textMuted}
                value={form.weight}
                onChangeText={(text) => update('weight', text.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.sexRow}>
            {SEX_OPTIONS.map((option) => {
              const selected = form.sex === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.sexButton, selected && styles.choiceSelected]}
                  onPress={() => update('sex', option.value)}>
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={selected ? PetFlowColors.primary : PetFlowColors.textMuted}
                  />
                  <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.clearButton} onPress={handleClear}>
            <Feather name="trash-2" size={18} color={PetFlowColors.textSecondary} />
            <Text style={styles.clearText}>Limpar</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons name="paw" size={20} color="#fff" />
            <Text style={styles.saveText}>Salvar Pet</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PetFlowColors.background,
  },
  flex: {
    flex: 1,
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: PetFlowColors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: PetFlowColors.textSecondary,
    marginBottom: 10,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: PetFlowColors.aiBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PetFlowColors.aiBorder,
    marginBottom: 24,
  },
  previewEmoji: {
    fontSize: 56,
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    fontSize: 22,
    fontWeight: '800',
    color: PetFlowColors.primary,
  },
  previewSubtitle: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: PetFlowColors.text,
    marginBottom: 8,
  },
  required: {
    color: PetFlowColors.primary,
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
    marginBottom: 20,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  choiceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
  choiceSelected: {
    borderColor: PetFlowColors.primary,
    backgroundColor: PetFlowColors.aiBg,
  },
  choiceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: PetFlowColors.textMuted,
  },
  choiceLabelSelected: {
    color: PetFlowColors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  sexRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  sexButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PetFlowColors.border,
    backgroundColor: PetFlowColors.card,
  },
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
    backgroundColor: PetFlowColors.card,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: PetFlowColors.textSecondary,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: PetFlowColors.primary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
