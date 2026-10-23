const { getDefaultConfig } = require('expo/metro-config');

/**
 * O app navega com React Navigation (@react-navigation/native, native-stack e
 * bottom-tabs), não com Expo Router.
 *
 * A partir da SDK 56 o Expo CLI traz o `expo-router` como dependência interna
 * e, se o encontra no node_modules, o Metro recusa qualquer import de
 * `@react-navigation/*` do código do app. Como o PetFlow não usa o Expo Router,
 * a verificação é desligada aqui — no arquivo versionado, e não num `.env` ou
 * num comando manual, para funcionar igual em qualquer máquina e em
 * `expo start`, `expo export` e builds.
 */
process.env.EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK = '1';

module.exports = getDefaultConfig(__dirname);
