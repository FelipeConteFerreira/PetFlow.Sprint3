import type { NavigatorScreenParams } from '@react-navigation/native';

/** Abas da área logada. */
export type TabParamList = {
  Inicio: undefined;
  Pets: undefined;
  Agenda: undefined;
  Perfil: undefined;
};

/**
 * Todas as telas do app, num único stack.
 *
 * `Login` e `CadastroTutor` só existem enquanto não há sessão; as demais só
 * existem com sessão. Quem decide é o `RootNavigator`, e é isso que protege as
 * rotas: uma tela interna não pode ser aberta sem token porque, sem token, ela
 * não está registrada no navegador.
 */
export type RootStackParamList = {
  Login: undefined;
  CadastroTutor: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  PetDetalhe: { petId: number };
  /** Sem `petId` é cadastro; com `petId` é edição. */
  PetForm: { petId?: number } | undefined;
  /** Sem `agendamentoId` é consulta nova; com ele é remarcação. */
  AgendamentoForm: { agendamentoId?: number } | undefined;
  /** Versão e commit do build. Aberta com ou sem sessão. */
  SobreApp: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
