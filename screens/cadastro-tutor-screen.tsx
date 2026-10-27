import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect, Field, FormError, Input, PrimaryButton } from '@/components/ui/form';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Radius, Spacing } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';
import { useCadastroTutorForm } from '@/hooks/forms/use-cadastro-tutor-form';
import { useAppNavigation } from '@/navigation/use-app-navigation';

/** Só desenho: campos, escolha da clínica, validação e envio moram no hook. */
export function CadastroTutorScreen() {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const navigation = useAppNavigation();
  const {
    values,
    setValue,
    errors,
    clinicas,
    clinicaId,
    escolherClinica,
    submit,
    isSubmitting,
    submitError,
  } = useCadastroTutorForm();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Criar conta" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroIcone}>
              <MaterialCommunityIcons name="paw" size={30} color={cores.primary} />
            </View>
            <Text style={styles.heroTitulo}>Bem-vindo ao PetFlow</Text>
            <Text style={styles.heroTexto}>
              Acompanhe vacinas, consultas e a rotina de cuidado dos seus pets em um lugar só.
            </Text>
          </View>

          <Field label="Seu nome" required error={errors.nome}>
            <Input
              value={values.nome}
              onChangeText={(texto) => setValue('nome', texto)}
              placeholder="Maria Silva"
              autoCapitalize="words"
              invalid={!!errors.nome}
              editable={!isSubmitting}
            />
          </Field>

          <Field label="E-mail" required error={errors.email}>
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

          <Field label="Telefone" hint="Opcional. A clínica usa para falar com você.">
            <Input
              value={values.telefone}
              onChangeText={(texto) => setValue('telefone', texto)}
              placeholder="(11) 99999-0000"
              keyboardType="phone-pad"
              editable={!isSubmitting}
            />
          </Field>

          <Field
            label="Sua clínica"
            required
            error={errors.clinicaId}
            hint="É ela que atende os seus pets e mantém o seu cadastro.">
            {clinicas.isPending ? (
              <Text style={styles.aviso}>Carregando clínicas…</Text>
            ) : clinicas.error ? (
              <Text style={styles.avisoErro}>
                Não foi possível carregar as clínicas. Verifique a conexão e volte a esta tela.
              </Text>
            ) : clinicas.data?.length ? (
              <ChipSelect
                opcoes={clinicas.data.map((c) => ({
                  valor: c.id,
                  rotulo: c.nome,
                  detalhe: [c.cidade, c.estado].filter(Boolean).join(' · '),
                }))}
                valor={clinicaId}
                onChange={escolherClinica}
                scroll
              />
            ) : (
              <Text style={styles.aviso}>
                Nenhuma clínica disponível no momento. Fale com a sua clínica para que ela se
                cadastre na plataforma.
              </Text>
            )}
          </Field>

          <Field label="Senha" required error={errors.senha}>
            <Input
              value={values.senha}
              onChangeText={(texto) => setValue('senha', texto)}
              placeholder="Pelo menos 6 caracteres"
              secureTextEntry
              invalid={!!errors.senha}
              editable={!isSubmitting}
            />
          </Field>

          <Field label="Confirmar senha" required error={errors.confirmacao}>
            <Input
              value={values.confirmacao}
              onChangeText={(texto) => setValue('confirmacao', texto)}
              placeholder="Repita a senha"
              secureTextEntry
              invalid={!!errors.confirmacao}
              editable={!isSubmitting}
            />
          </Field>

          <FormError message={submitError} />

          <PrimaryButton
            label="Criar conta"
            icon="arrow-forward"
            loading={isSubmitting}
            onPress={submit}
          />

          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>Já tem conta? </Text>
            <Text style={styles.rodapeLink} onPress={navigation.abrirLogin}>
              Entrar
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
    conteudo: { padding: Spacing.xl, paddingBottom: 40 },
    hero: { alignItems: 'center', marginBottom: Spacing.xxl },
    heroIcone: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: cores.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitulo: {
      fontSize: 21,
      fontWeight: '800',
      color: cores.text,
      marginTop: Spacing.md,
    },
    heroTexto: {
      fontSize: 14,
      lineHeight: 20,
      color: cores.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },
    aviso: {
      fontSize: 13,
      lineHeight: 19,
      color: cores.textSecondary,
      backgroundColor: cores.infoBg,
      borderRadius: Radius.sm,
      padding: Spacing.md,
    },
    avisoErro: {
      fontSize: 13,
      lineHeight: 19,
      color: cores.danger,
      backgroundColor: cores.dangerSoft,
      borderRadius: Radius.sm,
      padding: Spacing.md,
    },
    rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
    rodapeTexto: { color: cores.textSecondary, fontSize: 14 },
    rodapeLink: { color: cores.primary, fontSize: 14, fontWeight: '700' },
  });
}
