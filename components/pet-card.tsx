import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';
import { PET_STATUS_LABEL, emojiDoPet, resumoDoPet } from '@/lib/formatters';
import type { PetResponse } from '@/types/api';

export function PetCard({
  pet,
  especieNome,
  onPress,
}: {
  pet: PetResponse;
  especieNome?: string;
  onPress: () => void;
}) {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const emTratamento = pet.status === 'EM_TRATAMENTO';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cartao, shadow(1), pressed && styles.pressionado]}>
      <View style={styles.avatar}>
        <Text style={styles.emoji}>{emojiDoPet(especieNome ?? pet.racaNome)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>
          {pet.nome}
        </Text>
        <Text style={styles.resumo} numberOfLines={1}>
          {resumoDoPet(pet) || 'Sem detalhes cadastrados'}
        </Text>

        {pet.status && pet.status !== 'ATIVO' ? (
          <View style={[styles.etiqueta, emTratamento && styles.etiquetaAtencao]}>
            <Text style={[styles.etiquetaTexto, emTratamento && styles.etiquetaTextoAtencao]}>
              {PET_STATUS_LABEL[pet.status]}
            </Text>
          </View>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={20} color={cores.textMuted} />
    </Pressable>
  );
}

function criarEstilos(cores: Paleta) {
  return StyleSheet.create({
    cartao: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
      backgroundColor: cores.card,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: cores.border,
    },
    pressionado: { opacity: 0.75 },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: cores.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emoji: { fontSize: 28 },
    info: { flex: 1, gap: 3 },
    nome: { fontSize: 17, fontWeight: '700', color: cores.text },
    resumo: { fontSize: 13, color: cores.textSecondary },
    etiqueta: {
      alignSelf: 'flex-start',
      marginTop: Spacing.xs,
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: 3,
      borderRadius: Radius.pill,
      backgroundColor: cores.infoBg,
    },
    etiquetaAtencao: { backgroundColor: cores.orangeSoft },
    etiquetaTexto: { fontSize: 11, fontWeight: '700', color: cores.textSecondary },
    etiquetaTextoAtencao: { color: cores.warningText },
  });
}
