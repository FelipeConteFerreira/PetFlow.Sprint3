import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Field, FormError, Input, PrimaryButton } from '@/components/ui/form';
import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useEstilos } from '@/hooks/use-estilos';
import { useLoginForm } from '@/hooks/forms/use-login-form';
import { useAppNavigation } from '@/navigation/use-app-navigation';

/** Só desenho: campos, validação e envio moram em `useLoginForm`. */
export function LoginScreen() {
  const styles = useEstilos(criarEstilos);
  const navigation = useAppNavigation();
  const { values, setValue, errors, submit, isSubmitting, submitError } = useLoginForm();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.marcaBloco}>
            <View style={[styles.marcaIcone, shadow(2)]}>
              <MaterialCommunityIcons name="paw" size={36} color="#fff" />
            </View>
            <Text style={styles.marca}>PetFlow</Text>
            <Text style={styles.marcaTexto}>
              Os cuidados do seu pet, acompanhados de perto.
            </Text>
          </View>

          <View style={[styles.cartao, shadow(1)]}>
            <Field label="E-mail" error={errors.email}>
              <Input
                value={values.email}
                onChangeText={(texto) => setValue('email', texto)}
                placeholder="voce@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                invalid={!!errors.email}
                editable={!isSubmitting}
              />
            </Field>

            <Field label="Senha" error={errors.senha}>
              <Input
                value={values.senha}
                onChangeText={(texto) => setValue('senha', texto)}
                placeholder="••••••••"
                secureTextEntry
                invalid={!!errors.senha}
                editable={!isSubmitting}
              />
            </Field>

            <FormError message={submitError} />

            <PrimaryButton
              label="Entrar"
              icon="log-in-outline"
              loading={isSubmitting}
              onPress={submit}
            />
          </View>

          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>Ainda não tem conta? </Text>
            <Text style={styles.rodapeLink} onPress={navigation.abrirCadastro}>
              Cadastre-se
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function criarEstilos(cores: Paleta) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: cores.background },
    flex: { flex: 1 },
    conteudo: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
    marcaBloco: { alignItems: 'center', marginBottom: Spacing.xxl },
    marcaIcone: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: cores.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    marca: {
      fontSize: 30,
      fontWeight: '800',
      color: cores.text,
      marginTop: Spacing.lg,
      letterSpacing: -0.6,
    },
    marcaTexto: {
      fontSize: 15,
      color: cores.textSecondary,
      marginTop: Spacing.xs,
      textAlign: 'center',
    },
    cartao: {
      backgroundColor: cores.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: cores.border,
      padding: Spacing.xl,
    },
    rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
    rodapeTexto: { color: cores.textSecondary, fontSize: 14 },
    rodapeLink: { color: cores.primary, fontSize: 14, fontWeight: '700' },
  });
}
