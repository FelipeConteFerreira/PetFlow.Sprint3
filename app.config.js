/**
 * Configuração dinâmica do Expo: parte de `app.json` e acrescenta, em
 * `extra.build`, a identificação exata do código que gerou este build.
 *
 * A tela "Sobre o App" mostra esse hash. É ele que prova que o APK publicado
 * no Firebase App Distribution corresponde ao commit entregue no repositório.
 *
 * Ordem de origem do hash:
 *   1. EAS_BUILD_GIT_COMMIT_HASH — definida pelo EAS Build na nuvem;
 *   2. `git rev-parse HEAD` — build local ou `expo start`;
 *   3. "desconhecido" — fora de um repositório git.
 *
 * Se houver alteração não commitada no momento do build, o hash ganha o
 * sufixo "-modificado": um aviso de que aquele APK não corresponde a nenhum
 * commit e não deve ser publicado.
 */
const { execSync } = require('node:child_process');

function git(comando) {
  try {
    return execSync(`git ${comando}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function hashDoCommit() {
  const doEas = process.env.EAS_BUILD_GIT_COMMIT_HASH;
  if (doEas) return doEas;

  const hash = git('rev-parse HEAD');
  if (!hash) return 'desconhecido';

  const modificado = git('status --porcelain --untracked-files=no') !== '';
  return modificado ? `${hash}-modificado` : hash;
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    build: {
      commitHash: hashDoCommit(),
      geradoEm: new Date().toISOString(),
    },
  },
});
