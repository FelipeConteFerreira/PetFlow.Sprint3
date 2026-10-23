import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';

import type { RootStackParamList, TabParamList } from './types';

/**
 * A navegação do app em verbos, não em nomes de rota.
 *
 * As telas dizem `abrirPet(3)` em vez de `navigate('PetDetalhe', { petId: 3 })`.
 * Um nome de rota que muda, ou um parâmetro novo, é corrigido aqui e em mais
 * nenhum lugar.
 */
export function useAppNavigation() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return useMemo(
    () => ({
      voltar: () => {
        if (navigation.canGoBack()) navigation.goBack();
      },
      irParaAba: (aba: keyof TabParamList) => navigation.navigate('Tabs', { screen: aba }),

      abrirCadastro: () => navigation.navigate('CadastroTutor'),
      abrirLogin: () => navigation.navigate('Login'),

      abrirPet: (petId: number) => navigation.navigate('PetDetalhe', { petId }),
      novoPet: () => navigation.navigate('PetForm'),
      editarPet: (petId: number) => navigation.navigate('PetForm', { petId }),

      marcarConsulta: () => navigation.navigate('AgendamentoForm'),
      remarcarConsulta: (agendamentoId: number) =>
        navigation.navigate('AgendamentoForm', { agendamentoId }),
    }),
    [navigation]
  );
}
