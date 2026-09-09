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


const PUBLIC_ROUTES = ['login', 'cadastro-tutor'];

function RootNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isRestoring) return;

    const isPublic = PUBLIC_ROUTES.includes(segments[0] ?? '');

    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
    } else if (isAuthenticated && isPublic) {
      router.replace('/(tabs)');
    }
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
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro-tutor" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cadastrar-pet" options={{ headerShown: false }} />
        <Stack.Screen name="cadastrar-lembrete" options={{ headerShown: false }} />
        <Stack.Screen name="editar-perfil" options={{ headerShown: false }} />
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
