import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetFlowColors } from '@/constants/petflow';
import type { UserType } from '@/types/profile';

type Option = {
  value: UserType;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
};

const OPTIONS: Option[] = [
  {
    value: 'tutor',
    icon: 'heart',
    title: 'Sou Tutor',
    subtitle: 'Cuido do meu pet com amor',
    features: [
      'Cadastre seus pets',
      'Crie lembretes de vacinas e remédios',
      'Acompanhe a saúde do seu animal',
      'Contato rápido com o veterinário',
    ],
    color: '#2E9B5B',
    bgColor: '#E8F5EC',
    borderColor: '#C8E6D0',
  },
  {
    value: 'clinica',
    icon: 'hospital-building',
    title: 'Sou Clínica',
    subtitle: 'Atendo e cuido de vários pets',
    features: [
      'Cadastre sua equipe veterinária',
      'Gerencie veterinários ativos',
      'Dados e contato da clínica',
      'Pacientes e agendamentos em breve',
    ],
    color: '#4A90D9',
    bgColor: '#EBF4FC',
    borderColor: '#B5D4F4',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<UserType | null>(null);

  const handleContinue = async () => {
    if (!selected) {
      Alert.alert('Selecione um perfil', 'Escolha como você vai usar o PetFlow.');
      return;
    }
    if (selected === 'clinica') {
      router.push('/cadastro-clinica');
      return;
    }
    if (selected === 'tutor') {
      router.push('/cadastro-tutor');
      return;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="paw" size={36} color={PetFlowColors.primary} />
          <Text style={styles.brand}>PetFlow</Text>
          <Text style={styles.headline}>Como você vai{'\n'}usar o app?</Text>
          <Text style={styles.description}>
            Escolha seu perfil para personalizarmos a experiência para você.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.card,
                  isSelected && {
                    borderColor: option.color,
                    borderWidth: 2,
                    backgroundColor: option.bgColor,
                  },
                  !isSelected && styles.cardDefault,
                ]}
                onPress={() => setSelected(option.value)}
                accessibilityRole="button"
                accessibilityLabel={option.title}
                accessibilityState={{ selected: isSelected }}
              >
                {/* Selected badge */}
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: option.color }]}>
                    <MaterialCommunityIcons name="check" size={14} color="#fff" />
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isSelected ? option.color : '#F3F4F6' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={28}
                      color={isSelected ? '#fff' : PetFlowColors.textMuted}
                    />
                  </View>
                  <View style={styles.cardTitles}>
                    <Text
                      style={[
                        styles.cardTitle,
                        isSelected && { color: option.color },
                      ]}
                    >
                      {option.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>

                <View style={styles.featureList}>
                  {option.features.map((feat) => (
                    <View key={feat} style={styles.featureRow}>
                      <MaterialCommunityIcons
                        name="check-circle-outline"
                        size={16}
                        color={isSelected ? option.color : PetFlowColors.textMuted}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          isSelected && { color: '#1A1A1A' },
                        ]}
                      >
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.continueButton,
              !selected && styles.continueDisabled,
              selected === 'clinica' && { backgroundColor: '#4A90D9' },
            ]}
            onPress={handleContinue}
          >
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            <Text style={styles.continueText}>
              {selected === 'clinica'
                ? 'Cadastrar clínica'
                : selected === 'tutor'
                  ? 'Cadastrar tutor'
                  : 'Continuar'}
            </Text>
          </Pressable>
          <Text style={styles.footerNote}>
            {selected === 'clinica'
              ? 'Na próxima etapa você cria a conta da clínica.'
              : selected === 'tutor'
                ? 'Na próxima etapa você cria sua conta de tutor.'
                : 'Escolha Tutor ou Clínica para continuar.'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PetFlowColors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: PetFlowColors.primary,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: PetFlowColors.text,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 14,
    color: PetFlowColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  options: {
    flex: 1,
    gap: 14,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 18,
    position: 'relative',
  },
  cardDefault: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: PetFlowColors.border,
  },
  checkBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitles: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PetFlowColors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    marginTop: 2,
  },
  featureList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: PetFlowColors.textSecondary,
    flex: 1,
  },
  footer: {
    paddingBottom: 12,
    gap: 10,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PetFlowColors.primary,
    borderRadius: 16,
    paddingVertical: 18,
  },
  continueDisabled: {
    backgroundColor: PetFlowColors.textMuted,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: PetFlowColors.textMuted,
  },
});
