import { Redirect } from 'expo-router';

/**
 * A decisão de para onde ir é do guarda de rota em _layout.tsx,
 * que olha a sessão real. Aqui só apontamos para a área logada.
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
