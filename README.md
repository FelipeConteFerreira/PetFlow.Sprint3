# 🐾 PetFlow — aplicativo do tutor

Aplicativo mobile do **Clyvo Vet**, feito em React Native com Expo e integrado à
API Java (Spring Boot) do projeto. É o aplicativo do **tutor**: quem tem um pet
e quer acompanhar de perto o cuidado dele.

Disciplina de Mobile Application Development — FIAP, Challenge 2026, **Sprint 4 (entrega final)**.

---

## 🎯 O problema

Tutor só lembra da clínica na emergência. Vacina atrasa, o reforço passa em
branco, o histórico do animal fica espalhado entre a memória do dono e uma
pasta de papel na clínica. Quando o problema aparece, ele já está caro.

## 💡 A solução

Trazer o cuidado preventivo para a mão do tutor: os pets cadastrados, a carteira
de vacinação, o histórico de consultas e a agenda com a clínica, tudo no
aplicativo — e tudo **vindo da mesma base que a clínica usa**, e não de uma cópia
guardada no aparelho.

Todo dado que aparece na tela vem da API. Não há dado de exemplo embutido no
código, nem tela que finge ter carregado alguma coisa.

---

## 🆕 O que a Sprint 4 acrescentou

| Requisito | Onde está |
|---|---|
| Notificações locais ligadas a eventos reais | [🔔 Notificações](#-notificações) |
| Tema claro/escuro | [🌗 Tema](#-tema-claro--escuro) |
| Tela "Sobre o App" com o hash do commit | [ℹ️ Sobre o App e versão publicada](#ℹ️-sobre-o-app-e-versão-publicada) |
| Publicação no Firebase App Distribution | [📦 Publicação](#-publicação) e [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md) |

Nenhuma tela ou funcionalidade das sprints anteriores foi removida.

---

## 🔌 Integração com a API

O aplicativo fala com a **superfície do tutor** da API: `/api/tutor/**`.

Essa separação existe por segurança. A API de gestão da clínica
(`/api/pets`, `/api/agendamentos`, `/api/veterinarios`) aceitava o id do dono
pela URL ou pelo corpo, então trocar o número era ler e escrever no nome de
outro tutor. Na superfície do tutor **o dono sai sempre do token** — nenhuma
chamada do aplicativo envia `tutorId`. Recurso de outra pessoa responde `404`, e
não `403`, de propósito: quem não é dono não precisa saber a diferença entre
"não existe" e "não é seu".

A arquitetura é sempre a mesma, sem atalho:

```
tela  →  hook de tela / formulário  →  hook (TanStack Query)  →  service  →  Axios  →  API
```

Nenhuma tela chama HTTP, valida formulário ou dispara `mutate` — isso é dos hooks.
Nenhuma tela guarda lista do servidor em `useState`.
Depois de uma escrita, quem atualiza a lista é a **invalidação de cache** da
mutation — não um `useFocusEffect` recarregando na mão.

O cliente HTTP (`lib/api/http.ts`) é uma instância única do **Axios**. Os
interceptors cuidam do `Bearer` token, renova o acesso uma
vez quando a API responde `401` e derruba para o login quando a renovação também
falha.

### Mapa de CRUD → endpoint

**Pets** (funcionalidade completa)

| Operação | Onde, no app | Método e endpoint |
|---|---|---|
| Listar | Aba **Meus pets**, e o carrossel do Início | `GET /api/tutor/pets` |
| Detalhar | Toque no pet → **Detalhe do pet** | `GET /api/tutor/pets/{id}/ficha-tecnica` |
| Criar | Botão **+** → **Cadastrar pet** | `POST /api/tutor/pets` |
| Atualizar | Detalhe → **Editar dados** | `PUT /api/tutor/pets/{id}` |
| Remover | Detalhe → **Remover pet** (com confirmação) | `DELETE /api/tutor/pets/{id}` |

**Agendamentos** (funcionalidade completa)

| Operação | Onde, no app | Método e endpoint |
|---|---|---|
| Listar | Aba **Agenda** (Próximas / Histórico) | `GET /api/tutor/agendamentos` |
| Detalhar | Toque na consulta | `GET /api/tutor/agendamentos/{id}` |
| Criar | Botão **+** → **Marcar consulta** | `POST /api/tutor/agendamentos` |
| Remarcar | Toque na consulta → novo horário | `PUT /api/tutor/agendamentos/{id}` |
| Cancelar | **✕** no cartão (com confirmação) | `DELETE /api/tutor/agendamentos/{id}` |

**Leitura de apoio**

| O que | Onde | Endpoint |
|---|---|---|
| Perfil do tutor | Aba **Perfil**, saudação do Início | `GET /api/tutor/me` |
| Carteira de vacinação | Detalhe do pet | `GET /api/tutor/pets/{id}/vacinas` |
| Histórico de consultas | Detalhe do pet | `GET /api/tutor/pets/{id}/consultas` |
| Espécies e raças | Formulário de pet | `GET /api/tutor/catalogo/{especies,racas}` |
| Veterinários da clínica | Formulário de consulta | `GET /api/tutor/catalogo/veterinarios` |
| Clínicas (sem token) | Tela de cadastro | `GET /api/clinicas/publicas` |

**Autenticação**

| O que | Endpoint |
|---|---|
| Entrar | `POST /api/auth/login` |
| Renovar sessão | `POST /api/auth/refresh` |
| Sair | `POST /api/auth/logout` |
| Criar conta de tutor | `POST /api/tutores` |

> **Nota sobre o `DELETE`.** Nas duas funcionalidades ele não apaga: em pets
> inativa (o animal sai das suas listas e o histórico clínico continua com a
> clínica) e em agendamentos muda o status para `CANCELADO`. As telas dizem isso
> na confirmação, em vez de prometer que a ação é irreversível.

> **O que o aplicativo do tutor não faz.** Cadastro e edição de veterinário,
> clínica ou catálogo são atos administrativos da equipe: um token de tutor
> responde `403` neles. Alterar o próprio cadastro também é da clínica — a tela
> de Perfil diz onde pedir a mudança em vez de oferecer um botão que falharia.

---

## 🔔 Notificações

Notificações **locais** (`expo-notifications`): quem as mostra é o próprio
aparelho, sem servidor de push. Cada uma nasce de um dado real — a agenda e a
carteira de vacinação que vêm da API, ou uma escrita do tutor que a API
aceitou — e leva o tutor à tela onde ele age sobre o aviso. Nenhuma sai de
botão de teste.

| Cenário | Evento que dispara | O que o tutor vê | Toque leva a |
|---|---|---|---|
| Consulta solicitada / remarcada | Tutor salva o formulário (`POST`/`PUT` com sucesso) | Aviso na hora com data, hora e veterinário | Agenda |
| Lembrete de consulta | 24 h e 2 h antes do horário (agendados no aparelho ao marcar) | "Consulta do Bidu amanhã às 14:00" | A consulta, para remarcar |
| Consulta marcada pela clínica | A agenda vinda da API traz uma consulta ativa que o aparelho não conhecia e que o tutor não marcou nele | "Nova consulta de Bidu 📅 — A clínica marcou para 10/11/2026 às 14:00" | Agenda |
| Remarcação pela clínica | Uma consulta ativa conhecida volta da API com outra data ou hora | "Consulta de Bidu remarcada 📅 — A clínica remarcou para …" | Agenda |
| Confirmação pela clínica | A agenda vinda da API mostra `SOLICITADO → CONFIRMADO` | "Consulta do Bidu confirmada ✅" | Agenda |
| Cancelamento pela clínica | A agenda vinda da API mostra `→ CANCELADO` sem o tutor ter cancelado | Aviso com o motivo | Agenda, para marcar outro horário |
| Reforço de vacina | `proximoReforco` da carteira de vacinação | 7 dias antes e no dia, às 9h | Detalhe do pet |

Como cada peça se encaixa:

- **Cancelar** uma consulta cancela os lembretes dela; **remarcar** os substitui.
- A agenda é conferida com a API ao abrir o app, ao voltar do segundo plano e
  a cada minuto com o app aberto. O status, a data e a hora de cada consulta
  ficam guardados no aparelho; o que mudou **do lado da clínica** vira
  notificação. Mudanças feitas pelo próprio tutor são registradas antes, para
  não gerar aviso falso.
- A primeira sincronização depois do login (ou da instalação) só guarda a
  agenda: nenhuma consulta que já existia vira aviso.
- Com o app fechado, os lembretes agendados tocam normalmente; os avisos de
  mudança feita pela clínica chegam na próxima vez que o app for aberto.
- O toque funciona com o app aberto, em segundo plano ou fechado. Se a sessão
  tiver expirado, a tela é aberta logo depois do login.
- O **logout** cancela todos os lembretes: o próximo tutor do aparelho não
  recebe aviso do anterior.
- A aba **Perfil** mostra se as notificações estão ativas e oferece ativá-las.

Para demonstrar os avisos da clínica, use o site do Clyvo Vet com uma conta da
clínica, com o app aberto no celular: marcar uma consulta para o pet,
remarcá-la, ou **Confirmar**/**Recusar** (com motivo) um pedido feito pelo app
na agenda. O aviso chega em até um minuto, ou na hora ao puxar a Agenda para
atualizar.

Código: `services/notificacoes.ts` (acesso ao sistema), `lib/notificacoes.ts`
(regras: quando e o que avisar), `lib/mudancas-agenda.ts` (o que mudou na
agenda entre duas sincronizações), `hooks/use-notificacoes.ts` (ciclo de vida e
toque), `navigation/navigation-ref.ts` (abrir a tela de destino).

---

## 🌗 Tema claro / escuro

O app acompanha o modo do celular. No **Perfil → Aparência** dá para fixar
**Claro** ou **Escuro** (a escolha fica salva no aparelho).

Nenhuma tela tem cor fixa: as paletas ficam em `constants/theme.ts`, o
`TemaProvider` escolhe a ativa e cada tela monta o próprio `StyleSheet` a
partir dela com `useEstilos(criarEstilos)`. Navegação, barra de abas e barra de
status mudam junto.

---

## ℹ️ Sobre o App e versão publicada

A tela **Sobre o App** (pelo Perfil, ou pelo link no Login, sem precisar de
conta) mostra a versão e o **hash do commit** que gerou o build instalado.

O hash não é digitado à mão: `app.config.js` o lê do git (ou da variável
`EAS_BUILD_GIT_COMMIT_HASH`, no EAS Build) na hora do build e o grava no app.
Se o build sair de uma árvore com alterações não commitadas, a tela avisa — é
o sinal de que aquele APK não deve ser publicado.

---

## 📦 Publicação

O APK é gerado com o **EAS Build** (perfil `preview` do `eas.json`) e
distribuído pelo **Firebase App Distribution**, com o e-mail institucional do
professor cadastrado como tester.

| Item | Valor |
|---|---|
| Pacote Android | `br.com.clyvovet.petflow` |
| Gerar o APK | `npm run build:apk` |
| Versão | `1.0.1` (`versionCode` 3) |
| Commit publicado | `PREENCHER` com o commit do build final (o mesmo da tela Sobre o App) |

### Ordem que garante que o hash bate

1. **Commit final de código** em `master`.
2. **Build a partir dele** (`npm run build:apk`). O `eas.json` tem
   `requireCommit: true`: o EAS recusa build com alteração não commitada.
3. **Distribuição** desse APK no Firebase App Distribution.
4. **Só então** o commit de documentação com o hash publicado e o link do vídeo.

Commits depois do commit publicado só alteram documentação; o código do app é
o desse commit.

Passo a passo completo, com checklist de conferência: [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md).

---

## 📱 Telas

| # | Tela | Rota (React Navigation) | O que faz |
|---|---|---|---|
| 1 | Login | `Login` | Entra com e-mail e senha |
| 2 | Cadastro do tutor | `CadastroTutor` | Cria a conta e escolhe a clínica |
| 3 | Início | `Tabs › Inicio` | Saudação, números, próxima consulta e atalhos |
| 4 | Meus pets | `Tabs › Pets` | Lista os pets, com puxar para atualizar |
| 5 | Detalhe do pet | `PetDetalhe` | Ficha, vacinas, consultas, editar e remover |
| 6 | Cadastrar / editar pet | `PetForm` | Um formulário para criar e para editar |
| 7 | Agenda | `Tabs › Agenda` | Próximas e histórico, com cancelar |
| 8 | Marcar / remarcar consulta | `AgendamentoForm` | Escolhe pet, veterinário, data e hora |
| 9 | Perfil | `Tabs › Perfil` | Dados do tutor, avatar, aparência, notificações e sair |
| 10 | Sobre o App | `SobreApp` | Versão, hash do commit do build, equipe |

Todas as telas que carregam dados mostram os **três estados**: carregando, erro
com botão de tentar de novo, e vazio com um texto que explica o vazio.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native 0.88 | Framework mobile |
| Expo SDK 58 | Plataforma e ferramentas |
| React Navigation 7 | Navegação (Native Stack + Bottom Tabs) e proteção de rotas |
| Axios | Cliente HTTP, com interceptors de token e de renovação de sessão |
| TanStack Query 5 | Cache de servidor, estados de carregamento e invalidação |
| TypeScript | Tipagem dos contratos da API |
| AsyncStorage | Sessão persistida, avatar, tema e último status conhecido da agenda |
| expo-notifications | Notificações locais: avisos, lembretes agendados e toque com destino |
| expo-constants | Versão e hash do commit embutidos no build |
| EAS Build + Firebase App Distribution | Geração e distribuição do APK |
| expo-haptics | Retorno tátil nos seletores e botões |
| @expo/vector-icons | Ícones (Ionicons, MaterialCommunityIcons) |

Nenhuma biblioteca de UI de terceiros: os componentes de `components/ui/`
(estados de tela, formulário, cabeçalho) são do projeto.

---

## ▶️ Como executar

```bash
npm install
npx expo start
```

Depois: `a` para o emulador Android, `i` para o simulador iOS, ou leia o QR Code
com o **Expo Go**.

### Configuração da API

O app já vem apontado para o backend publicado, então **não é preciso criar
`.env`** para rodar a demonstração. Para trocar de servidor, copie
`.env.example` para `.env`:

```bash
EXPO_PUBLIC_API_URL=https://clyvo-vet-api-java.onrender.com
```

Informe **só o host** — o prefixo `/api` é acrescentado pelo app.

### ⚠️ Rodando contra um backend local: `localhost` não funciona

Esta é a pegadinha que mais custa tempo. **Emulador e aparelho físico têm o
próprio `localhost`, que não é o da sua máquina.** Apontar o app para
`http://localhost:8080` faz toda chamada falhar com "Sem conexão com a API",
mesmo com o backend rodando ali do lado.

Use o endereço certo para cada caso:

| Onde o app roda | `EXPO_PUBLIC_API_URL` |
|---|---|
| Emulador Android | `http://10.0.2.2:8080` |
| Simulador iOS | `http://localhost:8080` |
| **Aparelho físico** | `http://<IP-DA-SUA-MAQUINA>:8080` |
| Rede que isola dispositivos | `npx expo start --tunnel` e use a URL pública |

Descubra o IP da máquina com `ipconfig` (Windows) ou `ifconfig` (Linux/macOS) —
é o da rede local, algo como `192.168.0.15`. O celular precisa estar no **mesmo
Wi-Fi**, e a porta `8080` precisa estar liberada no firewall.

### ⏱️ A primeira chamada demora

O backend está numa instância **gratuita do Render, que dorme depois de 15
minutos ociosa**. A chamada que a acorda paga a subida da máquina inteira — nos
nossos testes, mais de dois minutos. Não é o app travado.

Por isso o timeout padrão é de 90 segundos e as consultas tentam uma segunda
vez. Se a primeira tela demorar ou der erro, use **Tentar de novo**: a segunda
chamada responde rápido.

Contra um backend local ou já quente, 90 segundos é tempo demais para descobrir
que a URL está errada. Baixe no `.env`:

```bash
EXPO_PUBLIC_API_TIMEOUT_MS=15000
```

---

## 🔑 Credenciais de teste

Conta de tutor já cadastrada, com pets e consultas para a demonstração:

| Campo | Valor |
|---|---|
| E-mail | `tutor.demo@petflow.com` |
| Senha | `Clyvo@2026` |
| Clínica | Clinica Vida Animal (São Paulo/SP) |

Ela já tem **Bidu** (Labrador) e **Mel** (Golden Retriever), com uma consulta
confirmada e outra solicitada.

Também dá para criar uma conta nova pela tela de cadastro — basta escolher uma
clínica da lista. Uma conta nova nasce sem pets, o que é uma boa forma de ver os
estados vazios do aplicativo.

> Base de demonstração, não de produção: estas credenciais são públicas de
> propósito.

---

## 👥 Integrantes

| Nome | RM |
|---|---|
| Olavo Porto Neves | RM563558 |
| Pedro Henrique Dias França | RM561940 |
| Luiz Gustavo Gonçalves | RM564495 |
| Altamir Lima | RM562906 |
| Felipe Conte | RM562248 |

---

## 🎬 Vídeo de demonstração

**Sprint 4 (entrega final):** `PREENCHER COM O LINK`

Gravado com o APK publicado no Firebase, em aparelho, num fluxo contínuo:
login → pets (cadastrar, editar, ver vacinas) → marcar consulta (notificação
na hora) → confirmação pela clínica (notificação e toque abrindo a Agenda) →
remarcar e cancelar → tema escuro → Sobre o App com o hash → logout.

Sprint 3: https://youtu.be/9Q5g4WaXCoA?feature=shared

---

## 📁 Organização do código

```
App.tsx               provedores: tema, Query, sessão e navegação
app.config.js         grava o hash do commit no build
eas.json              perfis do EAS Build (APK de distribuição)
index.ts              ponto de entrada (registerRootComponent)
navigation/           Stack, Tabs, tipos das rotas, verbos e ref de navegação
screens/              só interface: uma tela por arquivo
hooks/screens/        estado e ações de cada tela
hooks/forms/          estado, validação e envio dos formulários
hooks/                use-pets, use-agendamentos, use-catalogo, use-tutor (TanStack Query),
                      use-notificacoes, use-estilos
components/ui/        estados de tela, formulário, cabeçalho
contexts/             sessão (login, logout, restauração) e tema
services/             uma função por endpoint da API (Axios) e o acesso às notificações
lib/api/              cliente Axios, erros, sessão persistida
lib/forms/            regras de validação e montagem dos payloads
lib/notificacoes.ts   regras de notificação (quando e o que avisar)
lib/app-info.ts       versão e commit do build
constants/theme.ts    paletas clara e escura
docs/PUBLICACAO.md    passo a passo do Firebase App Distribution
types/api.ts          contratos conferidos contra o OpenAPI da API
```
