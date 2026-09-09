import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PetFlowColors, Radius, Spacing } from '@/constants/petflow';

/**
 * Os três estados que toda tela que carrega dados precisa mostrar.
 *
 * Estão juntos num arquivo de propósito: quando cada tela inventa o seu, uma
 * esquece o botão de tentar de novo e a outra deixa a lista vazia sem explicar
 * o vazio. Aqui a forma é a mesma em todo lugar, e a tela só escolhe o texto.
 */

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={PetFlowColors.primary} />
      <Text style={styles.legenda}>{label}</Text>
    </View>
  );
}

/**
 * Erro com saída. O `onRetry` é obrigatório: uma tela de erro sem como sair
 * dela deixa o usuário preso, e no Render o motivo mais comum do erro é a
 * instância acordando — a segunda tentativa costuma funcionar.
 */
export function ErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <View style={styles.centro}>
      <View style={[styles.icone, styles.iconeErro]}>
        <Ionicons name="cloud-offline-outline" size={28} color={PetFlowColors.danger} />
      </View>
      <Text style={styles.titulo}>Não foi possível carregar</Text>
      <Text style={styles.legenda}>{message}</Text>
      <Pressable
        style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
        onPress={onRetry}
        disabled={retrying}>
        {retrying ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="refresh" size={17} color="#fff" />
            <Text style={styles.botaoTexto}>Tentar de novo</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

/**
 * Vazio que explica o vazio. `action` é opcional porque nem todo vazio tem uma
 * saída — a agenda de quem ainda não tem pet, por exemplo, se resolve na outra
 * aba.
 */
export function EmptyState({
  emoji = '🐾',
  title,
  description,
  actionLabel,
  onAction,
}: {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.centro}>
      <View style={styles.icone}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.titulo}>{title}</Text>
      <Text style={styles.legenda}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable
          style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
          onPress={onAction}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.botaoTexto}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Atalho para o caso comum: uma tela que precisa decidir entre carregando,
 * erro e conteúdo. Devolve `null` quando é hora de renderizar o conteúdo, para
 * que a tela faça `{estado ?? <Conteudo />}`.
 */
export function AsyncBoundary({
  isLoading,
  error,
  onRetry,
  isRetrying,
  loadingLabel,
}: {
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
  loadingLabel?: string;
}): ReactNode | null {
  if (isLoading) return <LoadingState label={loadingLabel} />;
  if (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Erro inesperado.'}
        onRetry={onRetry}
        retrying={isRetrying}
      />
    );
  }
  return null;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 48,
  },
  icone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PetFlowColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  iconeErro: { backgroundColor: PetFlowColors.dangerSoft },
  emoji: { fontSize: 34 },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: PetFlowColors.text,
    textAlign: 'center',
  },
  legenda: {
    fontSize: 14,
    lineHeight: 20,
    color: PetFlowColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    backgroundColor: PetFlowColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    minWidth: 168,
    justifyContent: 'center',
  },
  pressionado: { opacity: 0.85 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
