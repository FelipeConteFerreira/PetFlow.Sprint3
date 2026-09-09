import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearAuthSession, getAuthSession, saveAuthSession } from '@/lib/api/auth-storage';
import { setUnauthorizedHandler } from '@/lib/api/http';
import { queryClient } from '@/lib/query-client';
import { login as loginRequest, logout as logoutRequest } from '@/services/auth';
import { registerTutor } from '@/services/tutores';
import type { LoginResponse, TutorRequest } from '@/types/api';

type AuthContextValue = {
  session: LoginResponse | null;
  /** id do tutor logado — usado nas telas de pets e agendamentos */
  tutorId: number | undefined;
  isAuthenticated: boolean;
  /** true enquanto a sessão salva está sendo lida no boot */
  isRestoring: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (data: TutorRequest) => Promise<void>;
  signOut: () => Promise<void>;
  /** Relê a sessão salva. Use após um cadastro feito fora do contexto. */
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<LoginResponse | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restaura a sessão persistida: o usuário não loga de novo ao reabrir o app.
  useEffect(() => {
    getAuthSession()
      .then(setSession)
      .finally(() => setIsRestoring(false));
  }, []);

  // Sessão irrecuperável (refresh falhou): derruba o usuário para o login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSession(null);
      void clearAuthSession();
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback(async (email: string, senha: string) => {
    const response = await loginRequest({ email, senha, tipo: 'TUTOR' });
    await saveAuthSession(response);
    setSession(response);
  }, []);

  const signUp = useCallback(
    async (data: TutorRequest) => {
      await registerTutor(data);
      await signIn(data.email, data.senha);
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    const refreshToken = session?.refreshToken;
    setSession(null);
    await clearAuthSession();
    queryClient.clear();
    if (refreshToken) await logoutRequest(refreshToken);
  }, [session?.refreshToken]);

  const refreshSession = useCallback(async () => {
    setSession(await getAuthSession());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      tutorId: session?.id,
      isAuthenticated: !!session?.accessToken,
      isRestoring,
      signIn,
      signUp,
      signOut,
      refreshSession,
    }),
    [session, isRestoring, signIn, signUp, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
