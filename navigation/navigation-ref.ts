import { createNavigationContainerRef } from '@react-navigation/native';

import type { DestinoNotificacao } from '@/services/notificacoes';

import type { RootStackParamList } from './types';

/**
 * Referência ao contêiner de navegação, para navegar de fora de uma tela —
 * hoje, só a partir do toque numa notificação.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Leva o usuário à tela que a notificação aponta. */
export function abrirDestino(destino: DestinoNotificacao): void {
  if (!navigationRef.isReady()) return;

  switch (destino.tela) {
    case 'Agenda':
      navigationRef.navigate('Tabs', { screen: 'Agenda' });
      return;
    case 'AgendamentoForm':
      navigationRef.navigate('AgendamentoForm', { agendamentoId: destino.agendamentoId });
      return;
    case 'PetDetalhe':
      navigationRef.navigate('PetDetalhe', { petId: destino.petId });
      return;
  }
}
