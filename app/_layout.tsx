import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getProfile } from '@/lib/profile-storage';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getProfile().then((profile) => {
      const inOnboardingFlow =
        segments[0] === 'onboarding' ||
        segments[0] === 'cadastro-clinica' ||
        segments[0] === 'cadastro-tutor';
      if (!profile.onboardingCompleted && !inOnboardingFlow) {
        router.replace('/onboarding');
      }
      setChecked(true);
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro-clinica" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro-tutor" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cadastrar-pet" options={{ headerShown: false }} />
        <Stack.Screen name="cadastrar-lembrete" options={{ headerShown: false }} />
        <Stack.Screen name="editar-perfil" options={{ headerShown: false }} />
        <Stack.Screen name="editar-perfil-clinica" options={{ headerShown: false }} />
        <Stack.Screen name="cadastrar-veterinario" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
