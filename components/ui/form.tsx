import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  type TextInputProps,
  View,
} from 'react-native';

import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';

/** Peças de formulário compartilhadas pelas telas de cadastro e edição. */

export function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.obrigatorio}> *</Text> : null}
      </Text>
      {children}
      {error ? (
        <Text style={styles.erro}>{error}</Text>
      ) : hint ? (
        <Text style={styles.dica}>{hint}</Text>
      ) : null}
    </View>
  );
}

export const Input = forwardRef<TextInputInstance, TextInputProps & { invalid?: boolean }>(
  function Input({ invalid, style, ...props }, ref) {
    const { cores } = useTema();
    const styles = useEstilos(criarEstilos);
    return (
      <TextInput
        ref={ref}
        style={[styles.input, invalid && styles.inputInvalido, style]}
        placeholderTextColor={cores.textMuted}
        {...props}
      />
    );
  }
);

export type Opcao<T> = { valor: T; rotulo: string; detalhe?: string };

/**
 * Seletor em fichas.
 *
 * Substitui o Picker nativo, que tem cara diferente em cada plataforma e não
 * cabe no visual do resto do app. Rola na horizontal quando a lista é longa —
 * é o caso das raças, que vêm do catálogo da clínica e podem ser dezenas.
 */
export function ChipSelect<T extends string | number>({
  opcoes,
  valor,
  onChange,
  scroll,
  accent,
}: {
  opcoes: Opcao<T>[];
  valor: T | undefined;
  onChange: (valor: T) => void;
  scroll?: boolean;
  accent?: string;
}) {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const corAtiva = accent ?? cores.primary;
  const fichas = opcoes.map((opcao) => {
    const ativa = opcao.valor === valor;
    return (
      <Pressable
        key={String(opcao.valor)}
        onPress={() => {
          if (Platform.OS !== 'web') void Haptics.selectionAsync();
          onChange(opcao.valor);
        }}
        style={({ pressed }) => [
          styles.chip,
          ativa && { backgroundColor: corAtiva, borderColor: corAtiva },
          pressed && styles.pressionado,
        ]}>
        <Text style={[styles.chipTexto, ativa && styles.chipTextoAtivo]}>{opcao.rotulo}</Text>
        {opcao.detalhe ? (
          <Text style={[styles.chipDetalhe, ativa && styles.chipDetalheAtivo]}>
            {opcao.detalhe}
          </Text>
        ) : null}
      </Pressable>
    );
  });

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRolagem}>
        {fichas}
      </ScrollView>
    );
  }
  return <View style={styles.chips}>{fichas}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'danger' | 'neutro';
}) {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const fundo = {
    primary: cores.primary,
    danger: cores.danger,
    neutro: cores.card,
  }[tone];
  const cor = tone === 'neutro' ? cores.text : '#fff';

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: fundo },
        tone === 'neutro' && styles.botaoNeutro,
        tone !== 'neutro' && shadow(1),
        (disabled || loading) && styles.botaoDesabilitado,
        pressed && styles.pressionado,
      ]}>
      {loading ? (
        <ActivityIndicator color={cor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={cor} /> : null}
          <Text style={[styles.botaoTexto, { color: cor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

/** Aviso de erro de escrita, acima do botão de salvar. */
export function FormError({ message }: { message: string | null }) {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  if (!message) return null;
  return (
    <View style={styles.avisoErro}>
      <Ionicons name="alert-circle" size={18} color={cores.danger} />
      <Text style={styles.avisoErroTexto}>{message}</Text>
    </View>
  );
}

function criarEstilos(cores: Paleta) {
  return StyleSheet.create({
    campo: { marginBottom: Spacing.lg },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: cores.text,
      marginBottom: Spacing.sm,
    },
    obrigatorio: { color: cores.danger },
    dica: { fontSize: 12, color: cores.textMuted, marginTop: 6 },
    erro: { fontSize: 12, color: cores.danger, marginTop: 6, fontWeight: '500' },
    input: {
      borderWidth: 1,
      borderColor: cores.borderStrong,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md + 2,
      fontSize: 16,
      backgroundColor: cores.card,
      color: cores.text,
    },
    inputInvalido: { borderColor: cores.danger, backgroundColor: cores.dangerSoft },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chipsRolagem: { flexDirection: 'row', gap: Spacing.sm, paddingRight: Spacing.lg },
    chip: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md - 2,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: cores.border,
      backgroundColor: cores.card,
    },
    chipTexto: { fontSize: 14, fontWeight: '600', color: cores.textSecondary },
    chipTextoAtivo: { color: '#fff' },
    chipDetalhe: { fontSize: 11, color: cores.textMuted, marginTop: 2 },
    chipDetalheAtivo: { color: 'rgba(255,255,255,0.85)' },
    botao: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
      borderRadius: Radius.md,
    },
    botaoNeutro: { borderWidth: 1, borderColor: cores.border },
    botaoDesabilitado: { opacity: 0.55 },
    botaoTexto: { fontSize: 16, fontWeight: '700' },
    pressionado: { opacity: 0.85 },
    avisoErro: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
      backgroundColor: cores.dangerSoft,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
    },
    avisoErroTexto: { flex: 1, fontSize: 13, color: cores.danger, lineHeight: 18 },
  });
}
