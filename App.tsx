import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/auth-context';
import { TemaProvider, useTema } from '@/contexts/theme-context';
import { useAberturaPorNotificacao } from '@/hooks/use-notificacoes';
import { queryClient } from '@/lib/query-client';
import { navigationRef } from '@/navigation/navigation-ref';
import { RootNavigator } from '@/navigation/root-navigator';

/**
 * Raiz do aplicativo: só monta os provedores, de fora para dentro.
 *
 * Tema → cache do TanStack Query → sessão → navegação. O tema fica por fora
 * de tudo porque até a tela de carregamento da sessão já precisa das cores.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Navegacao />
          </AuthProvider>
        </QueryClientProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}

/**
 * Contêiner de navegação com as cores do tema ativo. A referência permite que
 * o toque numa notificação leve o usuário direto à tela certa.
 */
function Navegacao() {
  const { cores, esquema } = useTema();
  const { onNavegacaoPronta } = useAberturaPorNotificacao();

  const temaNavegacao = useMemo<Theme>(() => {
    const base = esquema === 'escuro' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: cores.primary,
        background: cores.background,
        card: cores.card,
        text: cores.text,
        border: cores.border,
        notification: cores.danger,
      },
    };
  }, [cores, esquema]);

  return (
    <NavigationContainer ref={navigationRef} theme={temaNavegacao} onReady={onNavegacaoPronta}>
      <RootNavigator />
      <StatusBar style={esquema === 'escuro' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}
