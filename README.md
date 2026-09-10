# 🐾 PetFlow — aplicativo do tutor

Aplicativo mobile do **Clyvo Vet**, feito em React Native com Expo e integrado à
API Java (Spring Boot) do projeto. É o aplicativo do **tutor**: quem tem um pet
e quer acompanhar de perto o cuidado dele.

Disciplina de Mobile Application Development — FIAP, Challenge 2026, Sprint 3.

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
tela  →  hook (TanStack Query)  →  service  →  cliente HTTP  →  API
```

Nenhuma tela chama `fetch`. Nenhuma tela guarda lista do servidor em `useState`.
Depois de uma escrita, quem atualiza a lista é a **invalidação de cache** da
mutation — não um `useFocusEffect` recarregando na mão.

O cliente HTTP (`lib/api/http.ts`) cuida do `Bearer` token, renova o acesso uma
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

## 📱 Telas

| # | Tela | Rota | O que faz |
|---|---|---|---|
| 1 | Login | `/login` | Entra com e-mail e senha |
| 2 | Cadastro do tutor | `/cadastro-tutor` | Cria a conta e escolhe a clínica |
| 3 | Início | `/(tabs)` | Saudação, números, próxima consulta e atalhos |
| 4 | Meus pets | `/(tabs)/pets` | Lista os pets, com puxar para atualizar |
| 5 | Detalhe do pet | `/pet/[id]` | Ficha, vacinas, consultas, editar e remover |
| 6 | Cadastrar / editar pet | `/cadastrar-pet` | Um formulário para criar e para editar |
| 7 | Agenda | `/(tabs)/agendamentos` | Próximas e histórico, com cancelar |
| 8 | Marcar / remarcar consulta | `/agendar` | Escolhe pet, veterinário, data e hora |
| 9 | Perfil | `/(tabs)/profile` | Dados do tutor, avatar e sair da conta |

Todas as telas que carregam dados mostram os **três estados**: carregando, erro
com botão de tentar de novo, e vazio com um texto que explica o vazio.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native 0.86 | Framework mobile |
| Expo SDK 57 | Plataforma e ferramentas |
| Expo Router | Navegação por arquivos (Stack + Tabs) e proteção de rotas |
| TanStack Query 5 | Cache de servidor, estados de carregamento e invalidação |
| TypeScript | Tipagem dos contratos da API |
| AsyncStorage | Sessão persistida e preferência local de avatar |
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

**https://youtu.be/COLOQUE-O-LINK-AQUI**

> ⚠️ Substituir pelo link do vídeo da Sprint 3 antes da entrega. O link acima é
> um lugar reservado — o vídeo da Sprint 1 não vale para esta entrega.

O vídeo tem no máximo 5 minutos, é narrado e mostra: navegação entre as telas,
autenticação (login e logout), a integração com a API acontecendo, e o
aplicativo rodando em emulador ou aparelho.

---

## 📁 Organização do código

```
app/                  rotas (Expo Router)
  (tabs)/             Início, Meus pets, Agenda, Perfil
  pet/[id].tsx        detalhe do pet
components/ui/        estados de tela, formulário, cabeçalho
contexts/             sessão e proteção de rotas
hooks/                use-pets, use-agendamentos, use-catalogo, use-tutor
services/             uma função por endpoint da API
lib/api/              cliente HTTP, erros, sessão persistida
types/api.ts          contratos conferidos contra o OpenAPI da API
```
