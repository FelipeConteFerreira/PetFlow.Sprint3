import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/auth-context';
import { queryClient } from '@/lib/query-client';
import { RootNavigator } from '@/navigation/root-navigator';

/**
 * Raiz do aplicativo: só monta os provedores, de fora para dentro.
 *
 * Cache do TanStack Query → sessão → contêiner de navegação. A sessão fica
 * acima da navegação porque é ela que decide quais telas existem.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
