import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { useAgendamentos } from '@/hooks/use-agendamentos';
import { sincronizarAgenda } from '@/lib/notificacoes';
import { queryKeys } from '@/lib/query-client';
import { abrirDestino } from '@/navigation/navigation-ref';
import {
  type DestinoNotificacao,
  type PermissaoNotificacao,
  configurarNotificacoes,
  consumirToqueInicial,
  lerPermissao,
  ouvirToques,
  pedirPermissao,
} from '@/services/notificacoes';

/** De quanto em quanto tempo a agenda é conferida com a API enquanto o app está aberto. */
const INTERVALO_CONFERENCIA_MS = 60_000;

/**
 * Configura as notificações e trata o toque nelas.
 *
 * O toque pode chegar antes de a navegação estar pronta (app aberto pela
 * notificação) ou antes do login (sessão expirada). O destino fica pendente
 * e é aberto assim que as duas coisas acontecem.
 *
 * Devolve o `onReady` para o `NavigationContainer`.
 */
export function useAberturaPorNotificacao() {
  const { isAuthenticated } = useAuth();
  const [navegacaoPronta, setNavegacaoPronta] = useState(false);
  const [pendente, setPendente] = useState<DestinoNotificacao | null>(null);

  useEffect(() => {
    void configurarNotificacoes();
    void consumirToqueInicial().then((destino) => destino && setPendente(destino));
    return ouvirToques(setPendente);
  }, []);

  useEffect(() => {
    if (pendente && navegacaoPronta && isAuthenticated) {
      abrirDestino(pendente);
      setPendente(null);
    }
  }, [pendente, navegacaoPronta, isAuthenticated]);

  return { onNavegacaoPronta: useCallback(() => setNavegacaoPronta(true), []) };
}

/**
 * Mantém lembretes e avisos de status em dia com a agenda da API.
 *
 * Fica montado na área logada. Toda vez que a agenda chega do servidor — ao
 * abrir o app, ao puxar para atualizar, depois de uma escrita, ao voltar do
 * segundo plano e a cada minuto com o app aberto — ela é comparada com o que o
 * aparelho já sabia. É assim que a confirmação feita pela clínica chega ao
 * tutor como notificação.
 */
export function useSincronizacaoDeNotificacoes() {
  const qc = useQueryClient();
  const { data: agenda } = useAgendamentos();

  useEffect(() => {
    if (agenda) void sincronizarAgenda(agenda).catch(() => undefined);
  }, [agenda]);

  useEffect(() => {
    const conferir = () => void qc.invalidateQueries({ queryKey: queryKeys.agendamentos });

    const intervalo = setInterval(() => {
      if (AppState.currentState === 'active') conferir();
    }, INTERVALO_CONFERENCIA_MS);

    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') conferir();
    });

    return () => {
      clearInterval(intervalo);
      inscricao.remove();
    };
  }, [qc]);
}

/** Estado da permissão, para o Perfil mostrar e oferecer a ativação. */
export function usePermissaoDeNotificacao() {
  const [permissao, setPermissao] = useState<PermissaoNotificacao>('pendente');

  useEffect(() => {
    void lerPermissao().then(setPermissao);
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void lerPermissao().then(setPermissao);
    });
    return () => inscricao.remove();
  }, []);

  const ativar = useCallback(async () => {
    const resultado = await pedirPermissao();
    setPermissao(resultado);
    // Negada uma vez, o sistema não pergunta de novo: só pelos Ajustes.
    if (resultado === 'negada') await Linking.openSettings();
  }, []);

  return { permissao, ativar: () => void ativar() };
}
