import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChooseProfileTypeButton } from '@/components/choose-profile-type-button';
import { ClinicaHome } from '@/components/clinica-home';
import { ReminderCard } from '@/components/reminder-card';
import { PetFlowColors } from '@/constants/petflow';
import { getProfile } from '@/lib/profile-storage';
import { getPets } from '@/lib/pets-storage';
import { getVeterinarians } from '@/lib/veterinarians-storage';
import type { UserType } from '@/types/profile';
import type { Veterinarian } from '@/types/veterinarian';
import {
  countRemindersToday,
  getNextReminder,
} from '@/lib/reminder-utils';
import { getReminders } from '@/lib/reminders-storage';
import type { Pet } from '@/types/pet';
import type { Reminder } from '@/types/reminder';

export default function HomeScreen() {
  const router = useRouter();
  const [petCount, setPetCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [nextReminder, setNextReminder] = useState<Reminder | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [tutorName, setTutorName] = useState('');
  const [userType, setUserType] = useState<UserType | undefined>(undefined);
  const [vets, setVets] = useState<Veterinarian[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getProfile(), getPets(), getReminders(), getVeterinarians()]).then(
        ([profile, petList, reminders, vetList]) => {
          setUserType(profile.userType);
          setTutorName(profile.name.trim());
          setPets(petList);
          setVets(vetList);
          setPetCount(petList.length);
          setReminderCount(reminders.length);
          setTodayCount(countRemindersToday(reminders));
          setNextReminder(getNextReminder(reminders));
        }
      );
    }, [])
  );

  if (userType === 'clinica') {
    const activeCount = vets.filter((v) => v.active).length;
    const recentVets = [...vets]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3);
    return (
      <ClinicaHome
        clinicName={tutorName}
        vetCount={vets.length}
        activeCount={activeCount}
        recentVets={recentVets}
      />
    );
  }

  const greeting = tutorName ? `Olá, ${tutorName}!` : 'Olá, tutor!';

  const nextPetSubtitle = nextReminder
    ? (() => {
        const pet = pets.find((p) => p.id === nextReminder.petId);
        return pet
          ? `${pet.name} · ${pet.breed}`
          : nextReminder.petName;
      })()
    : '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>PetFlow</Text>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.subtitle}>Seus pets merecem cuidado hoje.</Text>
          </View>
          <Pressable
            style={styles.profileButton}
            accessibilityLabel="Perfil"
            onPress={() => router.push('/profile')}>
            <MaterialCommunityIcons name="paw" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <Pressable
            style={[styles.statCard, styles.statGreen]}
            onPress={() => router.push('/pets')}>
            <MaterialCommunityIcons name="paw" size={22} color="#fff" />
            <Text style={styles.statLabel}>Pets</Text>
            <Text style={styles.statValue}>{petCount}</Text>
          </Pressable>
          <Pressable
            style={[styles.statCard, styles.statOrange]}
            onPress={() => router.push('/reminders')}>
            <Ionicons name="notifications" size={22} color="#fff" />
            <Text style={styles.statLabel}>Lembretes</Text>
            <Text style={styles.statValue}>{reminderCount}</Text>
          </Pressable>
          <Pressable
            style={[styles.statCard, styles.statBlue]}
            onPress={() => router.push('/reminders')}>
            <Ionicons name="calendar" size={22} color="#fff" />
            <Text style={styles.statLabel}>Hoje</Text>
            <Text style={styles.statValue}>{todayCount}</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={18} color={PetFlowColors.text} />
          <Text style={styles.sectionTitle}>Lembretes próximos</Text>
        </View>

        {nextReminder ? (
          <ReminderCard reminder={nextReminder} petSubtitle={nextPetSubtitle} />
        ) : (
          <View style={styles.emptyReminder}>
            <Text style={styles.emptyReminderText}>
              Nenhum lembrete ainda. Crie o primeiro!
            </Text>
          </View>
        )}

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="brain" size={20} color={PetFlowColors.primary} />
            <Text style={styles.aiTitle}>IA PetFlow — Recomendações</Text>
          </View>
          <View style={styles.aiItem}>
            <MaterialCommunityIcons name="shield-check" size={18} color={PetFlowColors.primary} />
            <Text style={styles.aiItemText}>Mantenha as vacinas em dia</Text>
          </View>
          <View style={styles.aiItem}>
            <MaterialCommunityIcons name="food-drumstick" size={18} color={PetFlowColors.primary} />
            <Text style={styles.aiItemText}>Alimentação equilibrada</Text>
          </View>
          <View style={styles.aiItem}>
            <MaterialCommunityIcons name="heart-pulse" size={18} color={PetFlowColors.primary} />
            <Text style={styles.aiItemText}>Exercícios e carinho</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, styles.actionGreen]}
            onPress={() => router.push('/cadastrar-pet')}>
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.actionText}>Cadastrar Pet</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionBlue]}
            onPress={() => router.push('/cadastrar-lembrete')}>
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.actionText}>Lembrete</Text>
          </Pressable>
        </View>

        <ChooseProfileTypeButton variant="outline" accent="green" spacingTop />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PetFlowColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  headerText: { flex: 1, paddingRight: 12 },
  brand: { fontSize: 26, fontWeight: '800', color: PetFlowColors.primary, letterSpacing: -0.5 },
  greeting: { fontSize: 22, fontWeight: '700', color: PetFlowColors.text, marginTop: 4 },
  subtitle: { fontSize: 14, color: PetFlowColors.textSecondary, marginTop: 4 },
  profileButton: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: PetFlowColors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, minHeight: 100, justifyContent: 'space-between' },
  statGreen: { backgroundColor: PetFlowColors.primary },
  statOrange: { backgroundColor: PetFlowColors.orange },
  statBlue: { backgroundColor: PetFlowColors.blue },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginTop: 8 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: PetFlowColors.text },
  emptyReminder: {
    backgroundColor: PetFlowColors.card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: PetFlowColors.border, marginBottom: 16, alignItems: 'center',
  },
  emptyReminderText: { fontSize: 14, color: PetFlowColors.textSecondary, textAlign: 'center' },
  aiCard: {
    backgroundColor: PetFlowColors.aiBg, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: PetFlowColors.aiBorder, marginBottom: 20, gap: 12,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: PetFlowColors.primaryDark },
  aiItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiItemText: { fontSize: 14, color: PetFlowColors.text },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14,
  },
  actionGreen: { backgroundColor: PetFlowColors.primary },
  actionBlue: { backgroundColor: PetFlowColors.blue },
  actionText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
