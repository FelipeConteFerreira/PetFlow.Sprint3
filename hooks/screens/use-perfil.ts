import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useAgendamentos } from '@/hooks/use-agendamentos';
import { usePets } from '@/hooks/use-pets';
import { useTutorMe } from '@/hooks/use-tutor';
import { AVATARES, getAvatar, setAvatar } from '@/lib/preferences';

/**
 * Perfil: os dados vêm de `GET /api/tutor/me`. O avatar é a única coisa
 * guardada no aparelho, porque é a única que o servidor não tem.
 */
export function usePerfil() {
  const { signOut } = useAuth();
  const tutor = useTutorMe();
  const pets = usePets();
  const agenda = useAgendamentos();

  const [avatar, setAvatarAtual] = useState(AVATARES[0]);
  const [escolhendoAvatar, setEscolhendoAvatar] = useState(false);

  useEffect(() => {
    void getAvatar().then(setAvatarAtual);
  }, []);

  function escolherAvatar(emoji: string) {
    setAvatarAtual(emoji);
    setEscolhendoAvatar(false);
    void setAvatar(emoji);
  }

  return {
    tutor: tutor.data,
    carregando: tutor.isPending,
    erro: tutor.error,
    atualizando: tutor.isFetching,
    recarregar: () => void tutor.refetch(),
    totalPets: pets.data?.length ?? 0,
    totalConsultas: agenda.data?.filter((a) => a.status !== 'CANCELADO').length ?? 0,
    avatar,
    escolhendoAvatar,
    alternarEscolhaAvatar: () => setEscolhendoAvatar((v) => !v),
    escolherAvatar,
    /** O navegador troca para o login sozinho quando a sessão some. */
    sair: () => void signOut(),
  };
}
