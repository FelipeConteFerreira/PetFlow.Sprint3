import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { PetFlowColors } from '@/constants/petflow';

/**
 * As quatro abas do aplicativo do tutor.
 *
 * Não há mais escolha de perfil: as abas de clínica saíram junto com as telas
 * que dependiam de endpoints que um token de tutor não alcança. Sem esse
 * `userType` para consultar, o layout deixou de precisar carregar nada antes
 * de desenhar — e as abas param de piscar na abertura.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PetFlowColors.primary,
        tabBarInactiveTintColor: PetFlowColors.textMuted,
        tabBarStyle: {
          backgroundColor: PetFlowColors.card,
          borderTopColor: PetFlowColors.border,
          paddingTop: 4,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: 'Meus pets',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="paw" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agendamentos"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
