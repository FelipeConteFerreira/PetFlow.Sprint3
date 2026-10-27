# Publicação no Firebase App Distribution

Passo a passo para gerar o APK e entregá-lo ao professor como tester. A ordem
importa: **o hash que aparece na tela "Sobre o App" é o do commit em que o
build foi gerado**, e é ele que o professor confere contra o repositório.

---

## 1. Antes do build: o código tem de estar commitado e enviado

```bash
git status            # precisa estar limpo
git push              # o commit do build tem de existir no GitHub Classroom
git rev-parse --short HEAD   # anote: é o hash que vai aparecer no app
```

Se houver alteração não commitada, o app mostra o hash com o aviso
"Build gerado com alterações não commitadas". **Não publique esse APK.**

## 2. Gerar o APK com o EAS Build

Uma vez só, na máquina de quem vai gerar:

```bash
npm install -g eas-cli
eas login              # conta Expo (gratuita)
eas init               # vincula o projeto; aceite criar o projectId
```

> O `eas init` grava o `projectId` no `app.json`. **Commite essa mudança antes
> do build** (`git commit -am "chore: vincula projeto ao EAS"` e `git push`),
> senão o build sai marcado como modificado.

Depois, a cada versão:

```bash
npm run build:apk      # = eas build --platform android --profile preview
```

O perfil `preview` (em `eas.json`) gera um **APK** instalável direto, já
apontado para a API publicada. No fim, o EAS mostra o link para baixar o
`.apk`. O EAS Build na nuvem informa o commit ao app pela variável
`EAS_BUILD_GIT_COMMIT_HASH`, então o hash sai certo mesmo sem a pasta `.git`.

## 3. Criar o app no Firebase (uma vez)

1. <https://console.firebase.google.com> → **Adicionar projeto** (ex.: `PetFlow`).
2. Dentro do projeto → **Adicionar app** → **Android**.
3. Nome do pacote: **`br.com.clyvovet.petflow`** (é o `android.package` do
   `app.json` — tem de ser idêntico). Os demais campos são opcionais; o
   `google-services.json` **não** é necessário para o App Distribution.

## 4. Distribuir o APK

**Pelo console** (mais simples):

1. No menu lateral, abra **App Distribution** (fica no grupo de lançamento e
   monitoramento; use a busca do console se não achar) → aceite os termos.
2. Arraste o `.apk` baixado do EAS.
3. Em **Testers & Groups**, adicione o **e-mail institucional do professor**
   (e o de cada integrante, para testar antes).
4. Nas **notas da versão**, escreva o hash do commit, por exemplo:
   `Sprint 4 — commit 3790560`.
5. **Distribute**. O tester recebe um e-mail com o convite.

**Pela linha de comando** (alternativa):

```bash
npm install -g firebase-tools
firebase login
firebase appdistribution:distribute caminho/do/petflow.apk \
  --app <ID-DO-APP-ANDROID-NO-FIREBASE> \
  --testers "email.do.professor@fiap.com.br" \
  --release-notes "Sprint 4 — commit $(git rev-parse --short HEAD)"
```

O ID do app está em **Configurações do projeto → Seus apps** (formato
`1:1234567890:android:abc123…`).

## 5. Conferir antes de entregar

- [ ] Instalar pelo convite do Firebase num celular real (não pelo Expo Go).
- [ ] Abrir **Sobre o App**: o hash bate com `git log -1` do repositório entregue
      e **não** tem o aviso de "alterações não commitadas".
- [ ] Testar notificação: marcar uma consulta e ver o aviso na hora.
- [ ] O professor aparece em **Testers** com o convite enviado.
- [ ] Gravar o vídeo **com este mesmo APK** (o requisito pede coerência entre
      vídeo, código e versão publicada).

## Se precisar publicar de novo

Qualquer mudança de código depois da publicação gera um novo commit, então é
preciso **novo build e nova distribuição**. Aumente `android.versionCode` no
`app.json` (1 → 2…) para o Android aceitar a atualização por cima da versão
instalada.
