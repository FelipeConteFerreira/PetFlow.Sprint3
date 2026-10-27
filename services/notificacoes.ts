import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Acesso ao sistema de notificações do aparelho (expo-notifications).
 *
 * É a "camada de dados" das notificações, no mesmo papel que os outros
 * services fazem com a API: só sabe agendar, mostrar, cancelar e ouvir.
 * *Quando* e *o que* avisar é regra de negócio e fica em `lib/notificacoes`.
 */

/** Para onde o toque na notificação leva o usuário. */
export type DestinoNotificacao =
  | { tela: 'Agenda' }
  | { tela: 'AgendamentoForm'; agendamentoId: number }
  | { tela: 'PetDetalhe'; petId: number };

export type CanalNotificacao = 'consultas' | 'vacinas';

export type NovaNotificacao = {
  titulo: string;
  corpo: string;
  destino: DestinoNotificacao;
  canal: CanalNotificacao;
};

export type PermissaoNotificacao = 'concedida' | 'negada' | 'pendente';

const CANAIS: Record<CanalNotificacao, string> = {
  consultas: 'Consultas',
  vacinas: 'Vacinas e reforços',
};

/**
 * Configuração única, no boot: mostra a notificação mesmo com o app aberto
 * (é o caso da confirmação de consulta) e cria os canais do Android.
 */
export async function configurarNotificacoes(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Promise.all(
      (Object.keys(CANAIS) as CanalNotificacao[]).map((canal) =>
        Notifications.setNotificationChannelAsync(canal, {
          name: CANAIS[canal],
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 200, 120, 200],
          lightColor: '#2E9B5B',
        })
      )
    );
  }
}

function traduzirPermissao(status: Notifications.PermissionStatus): PermissaoNotificacao {
  if (status === Notifications.PermissionStatus.GRANTED) return 'concedida';
  if (status === Notifications.PermissionStatus.DENIED) return 'negada';
  return 'pendente';
}

export async function lerPermissao(): Promise<PermissaoNotificacao> {
  const { status } = await Notifications.getPermissionsAsync();
  return traduzirPermissao(status);
}

/** Pede a permissão só se ainda não foi respondida. */
export async function pedirPermissao(): Promise<PermissaoNotificacao> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.status !== Notifications.PermissionStatus.UNDETERMINED) {
    return traduzirPermissao(atual.status);
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return traduzirPermissao(status);
}

function conteudo(n: NovaNotificacao): Notifications.NotificationContentInput {
  return {
    title: n.titulo,
    body: n.corpo,
    data: { destino: n.destino },
    sound: true,
  };
}

/** Exibe agora. */
export async function mostrarAgora(n: NovaNotificacao): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: conteudo(n),
    trigger: Platform.OS === 'android' ? { channelId: n.canal } : null,
  });
}

/**
 * Agenda para uma data. O `id` é determinístico (ex.: `consulta-12-24h`):
 * agendar de novo com o mesmo id substitui o anterior em vez de duplicar.
 */
export async function agendarPara(id: string, data: Date, n: NovaNotificacao): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: conteudo(n),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: data,
      channelId: n.canal,
    },
  });
}

/** Ids de tudo que está agendado e ainda não disparou. */
export async function listarAgendadas(): Promise<string[]> {
  const agendadas = await Notifications.getAllScheduledNotificationsAsync();
  return agendadas.map((n) => n.identifier);
}

export async function cancelar(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function cancelarTodas(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function destinoDe(resposta: Notifications.NotificationResponse | null): DestinoNotificacao | null {
  const destino = resposta?.notification.request.content.data?.destino;
  return destino && typeof destino === 'object' && 'tela' in destino
    ? (destino as DestinoNotificacao)
    : null;
}

/**
 * Toque que abriu o app a partir de uma notificação (app estava fechado).
 * Depois de lido, é limpo para não reabrir a mesma tela no próximo boot.
 */
export async function consumirToqueInicial(): Promise<DestinoNotificacao | null> {
  const destino = destinoDe(await Notifications.getLastNotificationResponseAsync());
  if (destino) await Notifications.clearLastNotificationResponseAsync();
  return destino;
}

/** Toques com o app aberto ou em segundo plano. Devolve a função de desinscrição. */
export function ouvirToques(aoTocar: (destino: DestinoNotificacao) => void): () => void {
  const inscricao = Notifications.addNotificationResponseReceivedListener((resposta) => {
    const destino = destinoDe(resposta);
    if (destino) {
      aoTocar(destino);
      void Notifications.clearLastNotificationResponseAsync();
    }
  });
  return () => inscricao.remove();
}
