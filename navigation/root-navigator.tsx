import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { useTema } from '@/contexts/theme-context';
import { AgendamentoFormScreen } from '@/screens/agendamento-form-screen';
import { CadastroTutorScreen } from '@/screens/cadastro-tutor-screen';
import { LoginScreen } from '@/screens/login-screen';
import { PetDetalheScreen } from '@/screens/pet-detalhe-screen';
import { PetFormScreen } from '@/screens/pet-form-screen';
import { SobreAppScreen } from '@/screens/sobre-app-screen';

import { MainTabs } from './main-tabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Raiz da navegação, com o controle de acesso embutido.
 *
 * Sem sessão, o navegador só conhece Login e Cadastro. Com sessão, só conhece a
 * área interna. Quando `isAuthenticated` muda — login, logout ou refresh que
 * falhou — o React Navigation troca o conjunto de telas na hora e leva o
 * usuário para a primeira do novo conjunto. Não há `router.replace` espalhado
 * nem tela interna acessível por atalho.
 */
export function RootNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();
  const { cores } = useTema();

  // Enquanto a sessão salva é lida, não se sabe qual conjunto de telas mostrar.
  if (isRestoring) {
    return (
      <View style={[styles.splash, { backgroundColor: cores.background }]}>
        <ActivityIndicator size="large" color={cores.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.background } }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Tabs" component={MainTabs} />
          <Stack.Screen name="PetDetalhe" component={PetDetalheScreen} />
          <Stack.Screen name="PetForm" component={PetFormScreen} />
          <Stack.Screen name="AgendamentoForm" component={AgendamentoFormScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CadastroTutor" component={CadastroTutorScreen} />
        </>
      )}
      {/* Fora dos dois grupos: a versão instalada pode ser conferida antes do login. */}
      <Stack.Screen name="SobreApp" component={SobreAppScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
