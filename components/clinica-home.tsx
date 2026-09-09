import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChooseProfileTypeButton } from '@/components/choose-profile-type-button';
import { VeterinarianCard } from '@/components/veterinarian-card';
import { PetFlowColors } from '@/constants/petflow';
import type { Veterinarian } from '@/types/veterinarian';

type Props = {
  clinicName: string;
  vetCount: number;
  activeCount: number;
  recentVets: Veterinarian[];
};

export function ClinicaHome({
  clinicName,
  vetCount,
  activeCount,
  recentVets,
}: Props) {
  const router = useRouter();
  const greeting = clinicName ? `Olá, ${clinicName}!` : 'Olá, clínica!';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>PetFlow</Text>
            <Text style={styles.greeting}>{greeting} 🏥</Text>
            <Text style={styles.subtitle}>Gerencie sua equipe veterinária.</Text>
          </View>
          <Pressable
            style={styles.profileButton}
            accessibilityLabel="Perfil"
            onPress={() => router.push('/profile')}>
            <MaterialCommunityIcons name="hospital-building" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <Pressable
            style={[styles.statCard, styles.statBlue]}
            onPress={() => router.push('/veterinarians')}>
            <MaterialCommunityIcons name="stethoscope" size={22} color="#fff" />
            <Text style={styles.statLabel}>Equipe</Text>
            <Text style={styles.statValue}>{vetCount}</Text>
          </Pressable>
          <Pressable
            style={[styles.statCard, styles.statGreen]}
            onPress={() => router.push('/veterinarians')}>
            <MaterialCommunityIcons name="account-check" size={22} color="#fff" />
            <Text style={styles.statLabel}>Ativos</Text>
            <Text style={styles.statValue}>{activeCount}</Text>
          </Pressable>
          <View style={[styles.statCard, styles.statOrange]}>
            <MaterialCommunityIcons name="calendar-clock" size={22} color="#fff" />
            <Text style={styles.statLabel}>Em breve</Text>
            <Text style={styles.statValue}>—</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="stethoscope" size={18} color={PetFlowColors.text} />
          <Text style={styles.sectionTitle}>Equipe veterinária</Text>
          {vetCount > 0 ? (
            <Pressable onPress={() => router.push('/veterinarians')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </Pressable>
          ) : null}
        </View>

        {recentVets.length > 0 ? (
          <View style={styles.recentList}>
            {recentVets.map((vet) => (
              <VeterinarianCard
                key={vet.id}
                vet={vet}
                onPress={() =>
                  router.push({
                    pathname: '/cadastrar-veterinario',
                    params: { id: vet.id },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhum veterinário cadastrado. Comece montando sua equipe!
            </Text>
          </View>
        )}

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color={PetFlowColors.blue} />
            <Text style={styles.tipsTitle}>Dicas para sua clínica</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="account-plus" size={18} color={PetFlowColors.blue} />
            <Text style={styles.tipText}>Cadastre todos os veterinários da equipe</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="phone" size={18} color={PetFlowColors.blue} />
            <Text style={styles.tipText}>Mantenha telefones atualizados para contato rápido</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="bell" size={18} color={PetFlowColors.blue} />
            <Text style={styles.tipText}>Agendamentos e pacientes em breve no app</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, styles.actionBlue]}
            onPress={() => router.push('/cadastrar-veterinario')}>
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.actionText}>Novo veterinário</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionOutline]}
            onPress={() => router.push('/veterinarians')}>
            <MaterialCommunityIcons name="stethoscope" size={20} color={PetFlowColors.blue} />
            <Text style={styles.actionTextOutline}>Ver equipe</Text>
          </Pressable>
        </View>

        <ChooseProfileTypeButton variant="outline" accent="blue" spacingTop />
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
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: PetFlowColors.blue,
    letterSpacing: -0.5,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: PetFlowColors.text,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: PetFlowColors.textSecondary,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PetFlowColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  statBlue: { backgroundColor: PetFlowColors.blue },
  statGreen: { backgroundColor: PetFlowColors.primary },
  statOrange: { backgroundColor: PetFlowColors.orange },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginTop: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: PetFlowColors.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: PetFlowColors.blue,
  },
  recentList: { gap: 10, marginBottom: 16 },
  emptyCard: {
    backgroundColor: PetFlowColors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: PetFlowColors.textSecondary,
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: '#EBF4FC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    marginBottom: 20,
    gap: 12,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#185FA5',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 14,
    color: PetFlowColors.text,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionBlue: { backgroundColor: PetFlowColors.blue },
  actionOutline: {
    backgroundColor: PetFlowColors.card,
    borderWidth: 1.5,
    borderColor: PetFlowColors.blue,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  actionTextOutline: {
    fontSize: 14,
    fontWeight: '700',
    color: PetFlowColors.blue,
  },
});
