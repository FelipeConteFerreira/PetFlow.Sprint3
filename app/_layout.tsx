import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { PetFlowColors } from '@/constants/petflow';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { queryClient } from '@/lib/query-client';

export const unstable_settings = {
  anchor: '(tabs)',
};

/** Rotas alcançáveis sem sessão. Todo o resto passa pelo guarda abaixo. */
const ROTAS_PUBLICAS = ['login', 'cadastro-tutor'];

function RootNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isRestoring) return;

    const publica = ROTAS_PUBLICAS.includes(segments[0] ?? '');

    if (!isAuthenticated && !publica) router.replace('/login');
    else if (isAuthenticated && publica) router.replace('/(tabs)');
  }, [isAuthenticated, isRestoring, segments, router]);

  if (isRestoring) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={PetFlowColors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro-tutor" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pet/[id]" />
        <Stack.Screen name="cadastrar-pet" />
        <Stack.Screen name="agendar" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PetFlowColors.background,
  },
});
