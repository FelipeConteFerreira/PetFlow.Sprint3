import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  type EsquemaDeCor,
  type Paleta,
  type PreferenciaDeTema,
  paletaClara,
  paletaEscura,
} from '@/constants/theme';
import { getPreferenciaTema, setPreferenciaTema } from '@/lib/preferences';

type TemaContextValue = {
  /** Paleta do modo ativo — é daqui que toda tela tira as cores. */
  cores: Paleta;
  /** Modo efetivamente aplicado, já resolvido o "sistema". */
  esquema: EsquemaDeCor;
  /** O que o usuário escolheu no Perfil. */
  preferencia: PreferenciaDeTema;
  escolherPreferencia: (preferencia: PreferenciaDeTema) => void;
};

const TemaContext = createContext<TemaContextValue | null>(null);

/**
 * Tema claro/escuro.
 *
 * Por padrão acompanha o celular (`useColorScheme`). Se o usuário fixar
 * "Claro" ou "Escuro" no Perfil, a escolha vale só neste aparelho e fica no
 * AsyncStorage — é preferência de quem segura o celular, não dado do servidor.
 */
export function TemaProvider({ children }: { children: React.ReactNode }) {
  const esquemaDoSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaDeTema>('sistema');

  useEffect(() => {
    void getPreferenciaTema().then(setPreferencia);
  }, []);

  const escolherPreferencia = useCallback((nova: PreferenciaDeTema) => {
    setPreferencia(nova);
    void setPreferenciaTema(nova);
  }, []);

  const esquema: EsquemaDeCor =
    preferencia === 'sistema' ? (esquemaDoSistema === 'dark' ? 'escuro' : 'claro') : preferencia;

  const value = useMemo<TemaContextValue>(
    () => ({
      cores: esquema === 'escuro' ? paletaEscura : paletaClara,
      esquema,
      preferencia,
      escolherPreferencia,
    }),
    [esquema, preferencia, escolherPreferencia]
  );

  return <TemaContext.Provider value={value}>{children}</TemaContext.Provider>;
}

export function useTema(): TemaContextValue {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema precisa estar dentro de <TemaProvider>');
  return ctx;
}
