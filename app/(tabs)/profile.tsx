import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileMenuRow } from '@/components/profile-menu-row';
import { PetFlowColors } from '@/constants/petflow';
import { getPets } from '@/lib/pets-storage';
import { clearAllAppData, getProfile } from '@/lib/profile-storage';
import { getVeterinarians } from '@/lib/veterinarians-storage';
import type { UserType } from '@/types/profile';
import {
  countRemindersToday,
  formatDateBR,
  getDateBadge,
  getNextReminder,
} from '@/lib/reminder-utils';
import { getReminders } from '@/lib/reminders-storage';
import type { TutorProfile } from '@/types/profile';

import packageJson from '../../package.json';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [petCount, setPetCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [nextLabel, setNextLabel] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | undefined>(undefined);
  const [vetCount, setVetCount] = useState(0);
  const [activeVetCount, setActiveVetCount] = useState(0);

  const load = useCallback(() => {
    Promise.all([getProfile(), getPets(), getReminders(), getVeterinarians()]).then(
      ([prof, pets, reminders, vets]) => {
        setProfile(prof);
        setUserType(prof.userType);
        setPetCount(pets.length);
        setReminderCount(reminders.length);
        setTodayCount(countRemindersToday(reminders));
        setVetCount(vets.length);
        setActiveVetCount(vets.filter((v) => v.active).length);
        const next = getNextReminder(reminders);
        if (next) {
          const badge = getDateBadge(next.date);
          setNextLabel(`${next.title} — ${badge || formatDateBR(next.date)}`);
        } else {
          setNextLabel(null);
        }
      }
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const isClinica = userType === 'clinica';
  const displayName = profile?.name.trim() || (isClinica ? 'Clínica' : 'Tutor');
  const subtitle = isClinica
    ? [profile?.email, profile?.city, profile?.clinicPhone].filter(Boolean).join(' · ')
    : [profile?.email, profile?.city].filter(Boolean).join(' · ');

  const callPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) {
      Alert.alert('Sem telefone', 'Cadastre o número em Editar perfil.');
      return;
    }
    Linking.openURL(`tel:${digits}`);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Apagar todos os dados?',
      isClinica
        ? 'Veterinários, perfil e demais dados serão removidos deste aparelho. Essa ação não pode ser desfeita.'
        : 'Pets, lembretes e perfil serão removidos deste aparelho. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await clearAllAppData();
            load();
            Alert.alert('Pronto', 'Todos os dados foram apagados.');
          },
        },
      ]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'Como usar o PetFlow',
      isClinica
        ? '1. Complete os dados da clínica\n2. Cadastre os veterinários da equipe\n3. Gerencie ativos e contatos na aba Equipe\n\nSeus dados ficam salvos apenas neste celular.'
        : '1. Cadastre seus pets\n2. Crie lembretes de vacinas e medicamentos\n3. Acompanhe tudo na Home\n\nSeus dados ficam salvos apenas neste celular.',
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Perfil</Text>

        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{profile?.avatarEmoji ?? '🐾'}</Text>
          </View>
          <View style={styles.heroText}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{displayName}</Text>
              {userType ? (
                <View style={[
                  styles.userTypeBadge,
                  userType === 'clinica' && styles.userTypeBadgeClinica,
                ]}>
                  <MaterialCommunityIcons
                    name={userType === 'clinica' ? 'hospital-building' : 'heart'}
                    size={11}
                    color={userType === 'clinica' ? '#185FA5' : '#248A4E'}
                  />
                  <Text style={[
                    styles.userTypeBadgeText,
                    userType === 'clinica' && styles.userTypeBadgeTextClinica,
                  ]}>
                    {userType === 'clinica' ? 'Clínica' : 'Tutor'}
                  </Text>
                </View>
              ) : null}
            </View>
            {subtitle ? (
              <Text style={styles.heroSub}>{subtitle}</Text>
            ) : (
              <Text style={styles.heroSubMuted}>Complete seu perfil</Text>
            )}
          </View>
          <Pressable
            style={styles.editChip}
            onPress={() =>
              router.push(isClinica ? '/editar-perfil-clinica' : '/editar-perfil')
            }>
            <Feather
              name="edit-2"
              size={14}
              color={isClinica ? PetFlowColors.blue : PetFlowColors.primary}
            />
            <Text style={[
              styles.editChipText,
              isClinica && styles.editChipTextClinica,
            ]}>
              Editar
            </Text>
          </Pressable>
        </View>

        {isClinica ? (
          <View style={styles.statsRow}>
            <Pressable
              style={[styles.statCard, styles.statBlue]}
              onPress={() => router.push('/veterinarians')}>
              <MaterialCommunityIcons name="stethoscope" size={20} color="#fff" />
              <Text style={styles.statLabel}>Equipe</Text>
              <Text style={styles.statValue}>{vetCount}</Text>
            </Pressable>
            <Pressable
              style={[styles.statCard, styles.statGreen]}
              onPress={() => router.push('/veterinarians')}>
              <MaterialCommunityIcons name="account-check" size={20} color="#fff" />
              <Text style={styles.statLabel}>Ativos</Text>
              <Text style={styles.statValue}>{activeVetCount}</Text>
            </Pressable>
            <View style={[styles.statCard, styles.statOrange]}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
              <Text style={styles.statLabel}>Cidade</Text>
              <Text style={styles.statValueSmall} numberOfLines={1}>
                {profile?.city?.trim() || '—'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <Pressable style={[styles.statCard, styles.statGreen]} onPress={() => router.push('/pets')}>
              <MaterialCommunityIcons name="paw" size={20} color="#fff" />
              <Text style={styles.statLabel}>Pets</Text>
              <Text style={styles.statValue}>{petCount}</Text>
            </Pressable>
            <Pressable
              style={[styles.statCard, styles.statOrange]}
              onPress={() => router.push('/reminders')}>
              <Ionicons name="notifications" size={20} color="#fff" />
              <Text style={styles.statLabel}>Lembretes</Text>
              <Text style={styles.statValue}>{reminderCount}</Text>
            </Pressable>
            <View style={[styles.statCard, styles.statBlue]}>
              <Ionicons name="calendar" size={20} color="#fff" />
              <Text style={styles.statLabel}>Hoje</Text>
              <Text style={styles.statValue}>{todayCount}</Text>
            </View>
          </View>
        )}

        {!isClinica && nextLabel ? (
          <View style={styles.nextCard}>
            <Ionicons name="time-outline" size={18} color={PetFlowColors.primary} />
            <View style={styles.nextText}>
              <Text style={styles.nextTitle}>Próximo cuidado</Text>
              <Text style={styles.nextSub}>{nextLabel}</Text>
            </View>
          </View>
        ) : null}

        {isClinica && (profile?.clinicPhone || profile?.clinicAddress) ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Clínica</Text>
            <View style={styles.menuCard}>
              {profile.clinicPhone ? (
                <Pressable
                  style={styles.vetRow}
                  onPress={() => callPhone(profile.clinicPhone!)}>
                  <View style={styles.vetIcon}>
                    <Feather name="phone" size={20} color={PetFlowColors.blue} />
                  </View>
                  <View style={styles.vetInfo}>
                    <Text style={styles.vetLabel}>Telefone</Text>
                    <Text style={styles.vetName}>{profile.clinicPhone}</Text>
                  </View>
                  <Feather name="phone" size={18} color={PetFlowColors.blue} />
                </Pressable>
              ) : null}
              {profile.clinicAddress ? (
                <Pressable style={[styles.vetRow, profile.clinicPhone && styles.vetBorder]}>
                  <View style={styles.vetIcon}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={PetFlowColors.blue} />
                  </View>
                  <View style={styles.vetInfo}>
                    <Text style={styles.vetLabel}>Endereço</Text>
                    <Text style={styles.vetName}>{profile.clinicAddress}</Text>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {!isClinica && (profile?.vetName || profile?.vetPhone) ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Saúde</Text>
            <View style={styles.menuCard}>
              {profile.vetName ? (
                <Pressable
                  style={styles.vetRow}
                  onPress={() => profile.vetPhone && callPhone(profile.vetPhone)}>
                  <View style={styles.vetIcon}>
                    <MaterialCommunityIcons name="stethoscope" size={20} color={PetFlowColors.primary} />
                  </View>
                  <View style={styles.vetInfo}>
                    <Text style={styles.vetLabel}>Veterinário</Text>
                    <Text style={styles.vetName}>{profile.vetName}</Text>
                    {profile.vetPhone ? (
                      <Text style={styles.vetPhone}>{profile.vetPhone}</Text>
                    ) : null}
                  </View>
                  {profile.vetPhone ? (
                    <Feather name="phone" size={18} color={PetFlowColors.primary} />
                  ) : null}
                </Pressable>
              ) : null}
              {profile.emergencyName || profile.emergencyPhone ? (
                <Pressable
                  style={[styles.vetRow, profile.vetName && styles.vetBorder]}
                  onPress={() => profile.emergencyPhone && callPhone(profile.emergencyPhone)}>
                  <View style={[styles.vetIcon, styles.vetIconDanger]}>
                    <Ionicons name="medical" size={20} color="#DC2626" />
                  </View>
                  <View style={styles.vetInfo}>
                    <Text style={styles.vetLabel}>Emergência 24h</Text>
                    <Text style={styles.vetName}>
                      {profile.emergencyName || 'Contato de emergência'}
                    </Text>
                    {profile.emergencyPhone ? (
                      <Text style={styles.vetPhone}>{profile.emergencyPhone}</Text>
                    ) : null}
                  </View>
                  {profile.emergencyPhone ? (
                    <Feather name="phone" size={18} color="#DC2626" />
                  ) : null}
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Atalhos</Text>
          <View style={styles.menuCard}>
            <ProfileMenuRow
              icon="edit-2"
              label={isClinica ? 'Dados da clínica' : 'Editar perfil'}
              subtitle={isClinica ? 'Nome, contato e endereço' : 'Nome, vet e notificações'}
              onPress={() => router.push(isClinica ? '/editar-perfil-clinica' : '/editar-perfil')}
            />
            {isClinica ? (
              <>
                <View style={styles.divider} />
                <ProfileMenuRow
                  icon="users"
                  label="Equipe veterinária"
                  subtitle={`${vetCount} cadastrado${vetCount !== 1 ? 's' : ''}`}
                  onPress={() => router.push('/veterinarians')}
                />
                <View style={styles.divider} />
                <ProfileMenuRow
                  icon="plus-circle"
                  label="Novo veterinário"
                  onPress={() => router.push('/cadastrar-veterinario')}
                />
              </>
            ) : (
              <>
                <View style={styles.divider} />
                <ProfileMenuRow
                  icon="heart"
                  label="Meus pets"
                  subtitle={`${petCount} cadastrado${petCount !== 1 ? 's' : ''}`}
                  onPress={() => router.push('/pets')}
                />
                <View style={styles.divider} />
                <ProfileMenuRow
                  icon="bell"
                  label="Lembretes"
                  subtitle={`${reminderCount} ativo${reminderCount !== 1 ? 's' : ''}`}
                  onPress={() => router.push('/reminders')}
                />
                <View style={styles.divider} />
                <ProfileMenuRow
                  icon="plus-circle"
                  label="Cadastrar pet"
                  onPress={() => router.push('/cadastrar-pet')}
                />
                <View style={styles.divider} />
                <ProfileMenuRow
                  icon="plus"
                  label="Novo lembrete"
                  onPress={() => router.push('/cadastrar-lembrete')}
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App</Text>
          <View style={styles.menuCard}>
            <ProfileMenuRow icon="help-circle" label="Como usar" onPress={showHelp} />
            <View style={styles.divider} />
            <ProfileMenuRow
              icon="repeat"
              label="Tutor ou Clínica"
              subtitle="Voltar e escolher outro tipo de perfil"
              onPress={() => router.replace('/onboarding')}
            />
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <View style={styles.aboutIcon}>
                <MaterialCommunityIcons name="paw" size={20} color={PetFlowColors.primary} />
              </View>
              <View>
                <Text style={styles.aboutTitle}>PetFlow</Text>
                <Text style={styles.aboutSub}>
                  Versão {packageJson.version} · Dados no aparelho
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <ProfileMenuRow
              icon="trash-2"
              label="Apagar todos os dados"
              subtitle={isClinica ? 'Veterinários, perfil e dados' : 'Pets, lembretes e perfil'}
              onPress={handleDeleteAll}
              danger
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PetFlowColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: PetFlowColors.text, marginTop: 8, marginBottom: 16 },
  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: PetFlowColors.aiBg, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: PetFlowColors.aiBorder, marginBottom: 16,
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: PetFlowColors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: PetFlowColors.primary,
  },
  avatarEmoji: { fontSize: 32 },
  heroText: { flex: 1 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  heroName: { fontSize: 20, fontWeight: '800', color: PetFlowColors.primary },
  userTypeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F5EC', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#C8E6D0',
  },
  userTypeBadgeClinica: { backgroundColor: '#EBF4FC', borderColor: '#B5D4F4' },
  userTypeBadgeText: { fontSize: 11, fontWeight: '700', color: '#248A4E' },
  userTypeBadgeTextClinica: { color: '#185FA5' },
  heroSub: { fontSize: 13, color: PetFlowColors.textSecondary, marginTop: 4 },
  heroSubMuted: { fontSize: 13, color: PetFlowColors.textMuted, marginTop: 4 },
  editChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PetFlowColors.card, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: PetFlowColors.aiBorder,
  },
  editChipText: { fontSize: 13, fontWeight: '600', color: PetFlowColors.primary },
  editChipTextClinica: { color: PetFlowColors.blue },
  statValueSmall: { fontSize: 14, fontWeight: '800', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, minHeight: 88, justifyContent: 'space-between' },
  statGreen: { backgroundColor: PetFlowColors.primary },
  statOrange: { backgroundColor: PetFlowColors.orange },
  statBlue: { backgroundColor: PetFlowColors.blue },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginTop: 6 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#fff' },
  nextCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: PetFlowColors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: PetFlowColors.border, marginBottom: 20,
  },
  nextText: { flex: 1 },
  nextTitle: { fontSize: 12, fontWeight: '600', color: PetFlowColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  nextSub: { fontSize: 14, fontWeight: '600', color: PetFlowColors.text, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: PetFlowColors.textSecondary, marginBottom: 8, marginLeft: 4 },
  menuCard: { backgroundColor: PetFlowColors.card, borderRadius: 16, borderWidth: 1, borderColor: PetFlowColors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: PetFlowColors.border, marginLeft: 70 },
  vetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  vetBorder: { borderTopWidth: 1, borderTopColor: PetFlowColors.border },
  vetIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: PetFlowColors.aiBg, alignItems: 'center', justifyContent: 'center' },
  vetIconDanger: { backgroundColor: '#FEE2E2' },
  vetInfo: { flex: 1 },
  vetLabel: { fontSize: 11, fontWeight: '600', color: PetFlowColors.textMuted, textTransform: 'uppercase' },
  vetName: { fontSize: 15, fontWeight: '700', color: PetFlowColors.text, marginTop: 2 },
  vetPhone: { fontSize: 13, color: PetFlowColors.primary, marginTop: 2 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  aboutIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: PetFlowColors.aiBg, alignItems: 'center', justifyContent: 'center' },
  aboutTitle: { fontSize: 15, fontWeight: '700', color: PetFlowColors.text },
  aboutSub: { fontSize: 12, color: PetFlowColors.textSecondary, marginTop: 2 },
});
