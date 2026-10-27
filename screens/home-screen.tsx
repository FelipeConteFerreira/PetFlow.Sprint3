import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgendamentoCard } from '@/components/agendamento-card';
import { ErrorState } from '@/components/ui/screen-state';
import { Radius, Spacing, shadow } from '@/constants/petflow';
import type { Paleta } from '@/constants/theme';
import { useTema } from '@/contexts/theme-context';
import { useEstilos } from '@/hooks/use-estilos';
import { useHome } from '@/hooks/screens/use-home';
import { emojiDoPet, resumoDoPet } from '@/lib/formatters';
import { useAppNavigation } from '@/navigation/use-app-navigation';

/**
 * Início — só desenho. Os números e listas já chegam calculados do `useHome`,
 * e cada atalho é um verbo de navegação.
 */
export function HomeScreen() {
  const { cores } = useTema();
  const styles = useEstilos(criarEstilos);
  const navigation = useAppNavigation();
  const home = useHome();
  const { pets, proximas, carregando } = home;

  if (home.erro) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState message={home.erro} onRetry={home.recarregar} retrying={home.atualizando} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={home.atualizando}
            onRefresh={home.recarregar}
            tintColor={cores.primary}
            colors={[cores.primary]}
          />
        }>
        <View style={styles.cabecalho}>
          <View style={styles.cabecalhoTexto}>
            <Text style={styles.marca}>PetFlow</Text>
            <Text style={styles.saudacao}>
              {home.primeiroNome ? `Olá, ${home.primeiroNome}! 👋` : 'Olá! 👋'}
            </Text>
            <Text style={styles.subtitulo}>
              {proximas.length
                ? 'Veja o que vem por aí para os seus pets.'
                : 'Tudo tranquilo por aqui hoje.'}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.avatar, shadow(1), pressed && styles.pressionado]}
            accessibilityLabel="Perfil"
            onPress={() => navigation.irParaAba('Perfil')}>
            <MaterialCommunityIcons name="paw" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.numeros}>
          <Numero
            icone="paw"
            rotulo="Pets"
            valor={carregando ? '—' : String(pets.length)}
            cor={cores.primary}
            onPress={() => navigation.irParaAba('Pets')}
          />
          <Numero
            icone="calendar"
            rotulo="Próximas"
            valor={carregando ? '—' : String(proximas.length)}
            cor={cores.blue}
            onPress={() => navigation.irParaAba('Agenda')}
          />
          <Numero
            icone="time"
            rotulo="Hoje"
            valor={carregando ? '—' : String(home.totalHoje)}
            cor={cores.orange}
            onPress={() => navigation.irParaAba('Agenda')}
          />
        </View>

        <Secao
          titulo="Próxima consulta"
          acao={
            proximas.length > 1
              ? { rotulo: 'Ver agenda', onPress: () => navigation.irParaAba('Agenda') }
              : undefined
          }>
          {proximas.length ? (
            <AgendamentoCard
              agendamento={proximas[0]}
              onPress={() => navigation.remarcarConsulta(proximas[0].id)}
            />
          ) : (
            <Vazio
              texto={
                pets.length
                  ? 'Nenhuma consulta marcada. Que tal agendar um check-up?'
                  : 'Cadastre um pet para começar a marcar consultas.'
              }
              acaoRotulo={pets.length ? 'Marcar consulta' : 'Cadastrar pet'}
              onAcao={pets.length ? navigation.marcarConsulta : navigation.novoPet}
            />
          )}
        </Secao>

        <Secao
          titulo="Seus pets"
          acao={
            pets.length
              ? { rotulo: 'Ver todos', onPress: () => navigation.irParaAba('Pets') }
              : undefined
          }>
          {pets.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.petsRolagem}>
              {pets.slice(0, 6).map((pet) => (
                <Pressable
                  key={pet.id}
                  onPress={() => navigation.abrirPet(pet.id)}
                  style={({ pressed }) => [
                    styles.petCartao,
                    shadow(1),
                    pressed && styles.pressionado,
                  ]}>
                  <Text style={styles.petEmoji}>{emojiDoPet(pet.racaNome)}</Text>
                  <Text style={styles.petNome} numberOfLines={1}>
                    {pet.nome}
                  </Text>
                  <Text style={styles.petResumo} numberOfLines={1}>
                    {resumoDoPet(pet) || 'Sem detalhes'}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Vazio
              texto="Nenhum pet cadastrado ainda. É por aqui que tudo começa."
              acaoRotulo="Cadastrar pet"
              onAcao={navigation.novoPet}
            />
          )}
        </Secao>

        <View style={styles.atalhos}>
          <Atalho
            icone="add-circle"
            rotulo="Cadastrar pet"
            cor={cores.primary}
            onPress={navigation.novoPet}
          />
          <Atalho
            icone="calendar"
            rotulo="Marcar consulta"
            cor={cores.blue}
            onPress={navigation.marcarConsulta}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Numero({
  icone,
  rotulo,
  valor,
  cor,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
  cor: string;
  onPress: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.numero,
        { backgroundColor: cor },
        shadow(1),
        pressed && styles.pressionado,
      ]}>
      <Ionicons name={icone} size={20} color="#fff" />
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
      <Text style={styles.numeroValor}>{valor}</Text>
    </Pressable>
  );
}

function Secao({
  titulo,
  acao,
  children,
}: {
  titulo: string;
  acao?: { rotulo: string; onPress: () => void };
  children: React.ReactNode;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.secao}>
      <View style={styles.secaoCabecalho}>
        <Text style={styles.secaoTitulo}>{titulo}</Text>
        {acao ? (
          <Pressable onPress={acao.onPress} hitSlop={8}>
            <Text style={styles.secaoAcao}>{acao.rotulo}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Vazio({
  texto,
  acaoRotulo,
  onAcao,
}: {
  texto: string;
  acaoRotulo: string;
  onAcao: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={[styles.vazio, shadow(1)]}>
      <Text style={styles.vazioTexto}>{texto}</Text>
      <Pressable onPress={onAcao} hitSlop={8}>
        <Text style={styles.vazioAcao}>{acaoRotulo} →</Text>
      </Pressable>
    </View>
  );
}

function Atalho({
  icone,
  rotulo,
  cor,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  cor: string;
  onPress: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.atalho,
        { backgroundColor: cor },
        shadow(1),
        pressed && styles.pressionado,
      ]}>
      <Ionicons name={icone} size={19} color="#fff" />
      <Text style={styles.atalhoTexto}>{rotulo}</Text>
    </Pressable>
  );
}

function criarEstilos(cores: Paleta) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: cores.background },
    conteudo: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xxl },
    cabecalho: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginTop: Spacing.sm,
    },
    cabecalhoTexto: { flex: 1, paddingRight: Spacing.md },
    marca: {
      fontSize: 13,
      fontWeight: '800',
      color: cores.primary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    saudacao: {
      fontSize: 25,
      fontWeight: '800',
      color: cores.text,
      marginTop: Spacing.xs,
      letterSpacing: -0.4,
    },
    subtitulo: { fontSize: 14, color: cores.textSecondary, marginTop: Spacing.xs },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: cores.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressionado: { opacity: 0.8 },
    numeros: { flexDirection: 'row', gap: Spacing.md },
    numero: {
      flex: 1,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      minHeight: 102,
      justifyContent: 'space-between',
    },
    numeroRotulo: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.92)',
      fontWeight: '600',
      marginTop: Spacing.sm,
    },
    numeroValor: { fontSize: 27, fontWeight: '800', color: '#fff' },
    secao: { gap: Spacing.md },
    secaoCabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    secaoTitulo: { fontSize: 16, fontWeight: '700', color: cores.text },
    secaoAcao: { fontSize: 13, fontWeight: '600', color: cores.primary },
    vazio: {
      backgroundColor: cores.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: cores.border,
      padding: Spacing.xl,
      gap: Spacing.md,
    },
    vazioTexto: { fontSize: 14, lineHeight: 20, color: cores.textSecondary },
    vazioAcao: { fontSize: 14, fontWeight: '700', color: cores.primary },
    petsRolagem: { gap: Spacing.md, paddingRight: Spacing.lg },
    petCartao: {
      width: 132,
      backgroundColor: cores.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: cores.border,
      padding: Spacing.lg,
      gap: 2,
    },
    petEmoji: { fontSize: 30, marginBottom: Spacing.sm },
    petNome: { fontSize: 15, fontWeight: '700', color: cores.text },
    petResumo: { fontSize: 12, color: cores.textSecondary },
    atalhos: { flexDirection: 'row', gap: Spacing.md },
    atalho: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
      borderRadius: Radius.md,
    },
    atalhoTexto: { fontSize: 14, fontWeight: '700', color: '#fff' },
  });
}
