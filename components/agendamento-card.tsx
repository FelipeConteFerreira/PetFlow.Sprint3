import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PetFlowColors, Radius, Spacing, shadow } from '@/constants/petflow';
import {
  AGENDAMENTO_STATUS_LABEL,
  corDoStatusAgendamento,
  formatarData,
  formatarHora,
  statusOuPadrao,
} from '@/lib/formatters';
import type { AgendamentoResponse } from '@/types/api';

/**
 * Um agendamento na lista.
 *
 * Cancelado continua aparecendo — o DELETE da API muda o status em vez de
 * apagar — mas esmaecido, para não competir com o que ainda vai acontecer.
 */
export function AgendamentoCard({
  agendamento,
  onPress,
  onCancelar,
}: {
  agendamento: AgendamentoResponse;
  onPress: () => void;
  onCancelar?: () => void;
}) {
  const status = statusOuPadrao(agendamento.status);
  const cancelado = status === 'CANCELADO';
  const encerrado = cancelado || status === 'REALIZADO';
  const cores = corDoStatusAgendamento(status);

  return (
    <Pressable
      onPress={onPress}
      disabled={encerrado}
      style={({ pressed }) => [
        styles.cartao,
        shadow(1),
        cancelado && styles.cancelado,
        pressed && styles.pressionado,
      ]}>
      <View style={styles.data}>
        <Text style={styles.dataDia}>{formatarData(agendamento.dtAgendamento).slice(0, 5)}</Text>
        <Text style={styles.dataHora}>{formatarHora(agendamento.hrAgendamento)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.pet} numberOfLines={1}>
          {agendamento.petNome ?? `Pet #${agendamento.petId}`}
        </Text>
        <Text style={styles.vet} numberOfLines={1}>
          {agendamento.veterinarioNome
            ? `com ${agendamento.veterinarioNome}`
            : 'Veterinário a confirmar'}
        </Text>
        <View style={[styles.etiqueta, { backgroundColor: cores.fundo }]}>
          <Text style={[styles.etiquetaTexto, { color: cores.texto }]}>
            {AGENDAMENTO_STATUS_LABEL[status]}
          </Text>
        </View>
      </View>

      {onCancelar && !encerrado ? (
        <Pressable
          onPress={onCancelar}
          hitSlop={10}
          accessibilityLabel="Cancelar agendamento"
          style={({ pressed }) => [styles.cancelarBotao, pressed && styles.pressionado]}>
          <Ionicons name="close" size={18} color={PetFlowColors.danger} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: PetFlowColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: PetFlowColors.border,
    padding: Spacing.lg,
  },
  cancelado: { opacity: 0.6 },
  pressionado: { opacity: 0.75 },
  data: {
    width: 62,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: PetFlowColors.primarySoft,
  },
  dataDia: { fontSize: 15, fontWeight: '800', color: PetFlowColors.primaryDark },
  dataHora: { fontSize: 12, color: PetFlowColors.primaryDark, marginTop: 2 },
  info: { flex: 1, gap: 3 },
  pet: { fontSize: 16, fontWeight: '700', color: PetFlowColors.text },
  vet: { fontSize: 13, color: PetFlowColors.textSecondary },
  etiqueta: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  etiquetaTexto: { fontSize: 11, fontWeight: '700' },
  cancelarBotao: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PetFlowColors.dangerSoft,
  },
});
