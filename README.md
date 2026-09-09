# 🐾 PetFlow

Aplicativo mobile desenvolvido com **React Native + Expo** como projeto do 1º Sprint da disciplina de Mobile Application Development — FIAP.

---

## 📱 Sobre o Projeto

O PetFlow resolve um problema comum: tutores só cuidam dos pets em situações de emergência. O app propõe uma abordagem preventiva, centralizando lembretes, histórico e rotina de cuidados em um só lugar.

Além do fluxo do tutor, o PetFlow suporta o perfil de **Clínica**, permitindo o gerenciamento da equipe de veterinários diretamente pelo app.

---

## 🎯 Objetivo

- Lembrar automaticamente de cuidados (vacinas, remédios, check-ups)
- Armazenar o histórico e perfil do pet
- Personalizar a experiência conforme o tipo de usuário (Tutor ou Clínica)
- Incentivar uma rotina contínua de saúde animal

---

## 🚀 Funcionalidades

### Tutor
- 📋 Cadastro e gerenciamento de pets
- 🔔 Lembretes de vacinas, medicamentos e check-ups
- 📊 Acompanhamento de lembretes do dia
- 👤 Perfil com contato do veterinário e emergência
- ✏️ Edição de perfil completa

### Clínica
- 🏥 Dashboard com resumo da equipe
- 👨‍⚕️ Cadastro e gerenciamento de veterinários
- ✅ Controle de veterinários ativos
- ✏️ Edição de perfil da clínica (nome, CNPJ, endereço, contato)

---

## 📱 Telas do Aplicativo

| Tela | Descrição |
|------|-----------|
| Onboarding | Escolha do tipo de perfil (Tutor ou Clínica) |
| Cadastro Tutor | Formulário de criação de conta do tutor |
| Cadastro Clínica | Formulário de criação de conta da clínica |
| Home (Tutor) | Resumo de pets, lembretes e próximo cuidado |
| Home (Clínica) | Dashboard com equipe e veterinários recentes |
| Meus Pets | Lista de pets cadastrados |
| Lembretes | Lista de lembretes ativos com filtros |
| Equipe | Lista de veterinários da clínica |
| Perfil | Dados do usuário, atalhos e estatísticas |
| Cadastrar Pet | Formulário completo de cadastro de pet |
| Cadastrar Lembrete | Formulário de criação de lembrete |
| Cadastrar Veterinário | Formulário de cadastro de veterinário |
| Editar Perfil (Tutor) | Edição de dados do tutor |
| Editar Perfil (Clínica) | Edição de dados da clínica |

---

## 🔄 Fluxo do App

```
Abertura do app
    └── Onboarding (escolha: Tutor ou Clínica)
            ├── Tutor
            │     └── Cadastro → Home → Pets / Lembretes / Perfil
            └── Clínica
                  └── Cadastro → Dashboard → Equipe / Perfil
```

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| React Native | Framework mobile |
| Expo (SDK 52) | Plataforma de desenvolvimento |
| Expo Router | Navegação entre telas (Stack + Tabs) |
| AsyncStorage | Persistência de dados local |
| TypeScript | Tipagem estática |
| expo-vector-icons | Ícones (Ionicons, MaterialCommunityIcons) |
| react-native-safe-area-context | Áreas seguras de tela |

---

## 💾 Armazenamento de Dados

Os dados são armazenados localmente com AsyncStorage e restaurados automaticamente ao reabrir o app:

```ts
// Exemplo — salvar pet
await AsyncStorage.setItem('@petflow/pets', JSON.stringify(pets));

// Exemplo — carregar perfil
const raw = await AsyncStorage.getItem('@petflow/profile');
const profile = raw ? JSON.parse(raw) : defaultProfile;
```

Dados persistidos:
- `@petflow/profile` — perfil do usuário (tutor ou clínica)
- `@petflow/pets` — lista de pets
- `@petflow/reminders` — lembretes
- `@petflow/veterinarians` — equipe de veterinários
- `@petflow/session` — sessão de autenticação

---

## 📋 Requisitos do Sprint Atendidos

| # | Requisito | Status |
|---|-----------|--------|
| 1 | Navegação entre telas com Expo Router (5+ rotas) | ✅ 14 rotas |
| 2 | Protótipo visual completo com fluxo lógico | ✅ |
| 3 | Formulário com manipulação de estado (useState) | ✅ 7 formulários |
| 4 | Armazenamento local com AsyncStorage | ✅ 5 storages |
| 5 | Demonstração em vídeo narrada | 🎬  https://youtu.be/uzRVg26eQHQ |

---

## ▶️ Como Executar

```bash
# Instalar dependências
npm install

# Iniciar o projeto
npx expo start
```

Escaneie o QR Code com o app **Expo Go** (Android/iOS) ou rode em um emulador.

---

## 👥 Equipe

Desenvolvido por **PetFlow** — FIAP 2026.
