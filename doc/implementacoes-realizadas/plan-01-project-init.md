# Plano de Inicialização do Projeto – Sistema de Reserva de Espaços da Igreja

**Versão:** 1.7
**Data:** 22 de março de 2026
**Status:** Fase 9 Completa ✅ | Fase 8 (OneSignal) PULADA

---

## 0. Resumo do Status

### Fase 1 - Setup do Projeto ✅ COMPLETA
**Concluído em:** 22 de março de 2026

### Fase 2 - Multi-Tenant e Configurações ✅ COMPLETA
**Concluído em:** 22 de março de 2026

### Fase 3 - Integração Google Calendar ✅ COMPLETA
**Concluído em:** 22 de março de 2026

### Fase 4 - Autenticação e Layout ✅ COMPLETA
**Concluído em:** 22 de março de 2026

### Fase 5 - Tela de Reserva ✅ COMPLETA
**Concluído em:** 22 de março de 2026

### Fase 6 - Tela Minhas Reservas ✅ COMPLETA
**Concluído em:** 22 de março de 2026

### Fase 7 - Agenda Geral ✅ COMPLETA
**Concluído em:** 22 de março de 2026

### Fase 8 - Notificações OneSignal ⏭️ PULADA
**Decisão:** Implementação deixada para fase futura (requer banco de dados)

### Fase 9 - PWA e Responsividade ✅ COMPLETA
**Concluído em:** 22 de março de 2026

**Entregáveis Fase 9:**
- ✅ manifest.json configurado (RNF-02)
- ✅ Ícones PWA (192x192, 512x512)
- ✅ Metadata de viewport e theme color
- ✅ Suporte a instalação como app
- ✅ Responsividade testada
- ✅ Build testado e aprovado (19 páginas)

**Próxima Fase:** Fase 10 - Polimento e Testes

---

## 1. Resumo do Projeto

### 1.1 Objetivo

Desenvolver uma aplicação web monolítica usando **Next.js 16+ (App Router)** para gerenciamento de reservas de espaços da igreja, integrada ao **Google Calendar** como fonte da verdade, com **SSO Google**, suporte a **multi-tenant** e funcionalidades de **PWA**.

### 1.2 Base Técnica

- **Framework:** Next.js 16+ com App Router e Server Actions
- **Base UI:** nextjs-admin-dashboard-main (template admin com Next.js)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Backend:** Server Actions (sem API REST)
- **Banco de Dados:** Nenhum no MVP (configurações em variáveis de ambiente)

---

## 2. Arquitetura Proposta

### 2.1 Estrutura de Diretórios

```
oitava-igreja-agenda/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Rotas de autenticação (grupo de rotas)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx       # Layout sem sidebar para auth
│   │   ├── (dashboard)/         # Rotas protegidas do dashboard
│   │   │   ├── reserva/
│   │   │   │   └── page.tsx     # Tela de Reserva (RF-02)
│   │   │   ├── minhas-reservas/
│   │   │   │   └── page.tsx     # Tela Minhas Reservas (RF-07)
│   │   │   ├── agenda-geral/
│   │   │   │   └── page.tsx     # Visualizar Agenda Geral (RF-08)
│   │   │   ├── admin/           # Área administrativa (tenants, espaços)
│   │   │   │   ├── tenants/
│   │   │   │   ├── espacos/
│   │   │   │   └── configuracoes/
│   │   │   └── layout.tsx       # Layout com sidebar
│   │   ├── api/                 # Webhooks e endpoints externos
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   └── webhook/
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Redirect para login ou dashboard
│   ├── components/
│   │   ├── auth/                # Componentes de autenticação
│   │   ├── reserva/             # Componentes da tela de reserva
│   │   │   ├── reserva-form.tsx
│   │   │   ├── espacos-selector.tsx
│   │   │   ├── mapa-igreja.tsx
│   │   │   ├── recorrencia-form.tsx
│   │   │   └── loading-spinner.tsx
│   │   ├── calendario/          # Componentes do Google Calendar
│   │   │   ├── calendar-iframe.tsx
│   │   │   └── calendar-integration.ts
│   │   ├── reservas/            # Componentes de listagem de reservas
│   │   │   ├── reservas-list.tsx
│   │   │   ├── reserva-card.tsx
│   │   │   └── cancel-modal.tsx
│   │   ├── layout/              # Header, Sidebar, etc.
│   │   └── ui/                  # Componentes UI reutilizáveis
│   ├── lib/
│   │   ├── auth/                # Configuração NextAuth
│   │   │   ├── index.ts
│   │   │   └── google-provider.ts
│   │   ├── google-calendar/     # Integração Google Calendar API
│   │   │   ├── index.ts
│   │   │   ├── events.ts        # CRUD de eventos
│   │   │   ├── availability.ts  # Verificação de conflitos
│   │   │   └── recurrence.ts    # Cálculo de recorrências
│   │   ├── tenant/              # Gerenciamento multi-tenant
│   │   │   ├── index.ts
│   │   │   └── config.ts
│   │   ├── validation/          # Schemas de validação (Zod)
│   │   │   ├── reserva.ts
│   │   │   └── tenant.ts
│   │   └── utils/
│   │       ├── date.ts          # Utilitários de data (dayjs)
│   │       └── rules.ts         # Regras de negócio (RN-01 a RN-04)
│   ├── config/
│   │   ├── tenants.ts           # Configuração de tenants (MVP)
│   │   └── espacos.ts           # Lista fixa de espaços (RF-03)
│   └── types/
│       ├── reserva.ts
│       ├── tenant.ts
│       └── google-calendar.ts
├── public/
│   ├── images/
│   │   ├── logo/
│   │   └── mapa-igreja.png
│   └── manifest.json            # PWA manifest (RNF-02)
├── .env.local.example           # Template de variáveis de ambiente
├── .env.local                   # Variáveis de ambiente (não versionado)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Backlog de Implementação

### Fase 1: Setup do Projeto (Dia 1)

#### 3.1.1 Inicialização do Repositório

- [ ] Copiar estrutura do `nextjs-admin-dashboard-main` para raiz do projeto
- [ ] Renomear pacote no `package.json` para `oitava-igreja-agenda`
- [ ] Atualizar `README.md` com descrição do projeto
- [ ] Configurar `.gitignore` adequado
- [ ] Criar `.env.local.example` com todas as variáveis necessárias

#### 3.1.2 Instalação de Dependências

```bash
# Dependências base (já existentes no template)
npm install  # next, react, typescript, tailwind, etc.

# Dependências adicionais necessárias
npm install next-auth@beta         # Autenticação com SSO Google
npm install @googleapis/calendar   # Google Calendar API
npm install zod                    # Validação de schemas
npm install @onesignal/react-web-push  # Notificações (RF-09)
npm install dayjs                  # Manipulação de datas (já existe no template)
```

#### 3.1.3 Configuração do NextAuth

- [ ] Configurar NextAuth com provider Google
- [ ] Criar rotas de API `/api/auth/[...nextauth]`
- [ ] Implementar session callback com dados do tenant
- [ ] Criar middleware para proteção de rotas

#### 3.1.4 Variáveis de Ambiente

Criar `.env.local.example`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gerar_com_openssl_rand_base64_32

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Calendar (por tenant)
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/calendar/callback

# OneSignal
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=

# Configurações de Tenant (MVP - hardcoded)
DEFAULT_TENANT_ID=oitava-agenda
```

---

### Fase 2: Multi-Tenant e Configurações (Dia 2)

#### 3.2.1 Sistema de Tenants (RF-10)

- [ ] Criar tipo `TenantConfig`
- [ ] Implementar `lib/tenant/config.ts` com:
  - Credenciais Google OAuth por tenant
  - IDs das agendas do Google Calendar
  - Lista de espaços por tenant
  - URL do iframe da agenda geral
  - Configurações do OneSignal
- [ ] Criar middleware para identificar tenant por subdomínio ou path
- [ ] Implementar hook `useTenant()` para acesso às configurações

#### 3.2.2 Configuração de Espaços (RF-03)

- [ ] Criar `config/espacos.ts` com lista fixa:
  ```typescript
  export const ESPACOS = [
    { id: 'templo', nome: 'Templo', capacidade: null },
    { id: 'salao-social', nome: 'Salão Social', capacidade: null },
    { id: 'sala-a', nome: 'Sala A', capacidade: 15 },
    { id: 'sala-b', nome: 'Sala B', capacidade: 15 },
    { id: 'sala-01', nome: 'Sala 01', capacidade: 35 },
    { id: 'sala-02', nome: 'Sala 02', capacidade: 15 },
    { id: 'sala-03', nome: 'Sala 03', capacidade: 20 },
    { id: 'sala-04', nome: 'Sala 04', capacidade: 15 },
    { id: 'sala-05', nome: 'Sala 05', capacidade: 15 },
    { id: 'sala-07', nome: 'Sala 07', capacidade: 20 },
    { id: 'sala-apoio', nome: 'Sala Apoio Ministerial', capacidade: null },
  ] as const;
  ```

---

### Fase 3: Integração Google Calendar (Dia 3-4)

#### 3.3.1 Configuração da API Google Calendar

- [ ] Criar projeto no Google Cloud Console
- [ ] Habilitar Google Calendar API
- [ ] Configurar OAuth 2.0 credentials
- [ ] Criar service account ou usar OAuth por usuário
- [ ] Implementar `lib/google-calendar/index.ts`

#### 3.3.2 Implementação das Funções

- [ ] `checkAvailability()`: Verificar conflitos em um espaço/data/horário
- [ ] `createEvent()`: Criar evento com propriedades customizadas
- [ ] `deleteEvent()`: Cancelar evento
- [ ] `listEvents()`: Listar eventos por e-mail do responsável
- [ ] `checkRecurrenceAvailability()`: Verificar disponibilidade para todas as datas de recorrência

#### 3.3.3 Propriedades Customizadas (RF-06)

- [ ] Adicionar `extendedProperties` nos eventos:
  ```typescript
  extendedProperties: {
    private: {
      responsibleEmail: 'usuario@email.com'
    }
  }
  ```

---

### Fase 4: Autenticação e Layout (Dia 5)

#### 3.4.1 Tela de Login (RF-01)

- [ ] Adaptar `src/app/(auth)/login/page.tsx` baseado no template
- [ ] Implementar botão "Entrar com Google"
- [ ] Configurar redirect automático para `/reserva` após login
- [ ] Remover campos de e-mail/senha (apenas SSO)

#### 3.4.2 Layout do Dashboard

- [ ] Adaptar sidebar do template com menu:
  - Reservar Espaço
  - Minhas Reservas
  - Agenda Geral
  - (Admin) Configurações
- [ ] Adaptar header com:
  - Nome do usuário logado
  - Botão de logout
  - Seletor de tenant (se aplicável)

---

### Fase 5: Tela de Reserva (Dia 6-8)

#### 3.5.1 Formulário de Reserva (RF-02)

- [ ] Criar `components/reserva/reserva-form.tsx` com campos:
  - Nome da Programação (text)
  - Responsável (text, pré-preenchido)
  - Telefone para contato (tel)
  - Observações (textarea)
  - Data de início (date picker)
  - Horário de início (time picker)
  - Horário de fim (time picker)
  - Checkbox "Programação recorrente"
  - Campos condicionais de recorrência:
    - Tipo (semanal/mensal)
    - Data de término
  - Seleção múltipla de espaços (checkboxes)
  - Mapa da igreja (imagem estática)

#### 3.5.2 Validações (RN-01 a RN-04)

- [ ] Implementar `lib/validation/reserva.ts` com Zod:
  - RN-01: Horário final > horário inicial
  - RN-02: Data >= data atual
  - RN-03: Duração mínima de 30 minutos
  - RN-04: Janela permitida (Seg-Qui: próxima semana; Sex-Dom: semana subsequente)

#### 3.5.3 Server Action de Reserva

- [ ] Criar `app/(dashboard)/reserva/actions.ts`:
  ```typescript
  async function criarReserva(formData: FormData) {
    // 1. Validar dados
    // 2. Verificar disponibilidade de todos os espaços
    // 3. Se conflito: abortar e retornar erro
    // 4. Se disponível: criar eventos no Google Calendar
    // 5. Retornar sucesso/erro
  }
  ```

#### 3.5.4 Tratamento de Recorrência (RF-05)

- [ ] Implementar `lib/google-calendar/recurrence.ts`:
  - Calcular todas as datas baseado em:
    - Data inicial
    - Tipo (semanal/mensal)
    - Data final
  - Para cada data, verificar disponibilidade
  - Criar eventos individuais (não usar recorrência nativa)

#### 3.5.5 UI/UX

- [ ] Implementar loading spinner (RNF-06)
- [ ] Feedback visual de erros
- [ ] Mensagem de janela bloqueada (RN-04)
- [ ] Mapa da igreja interativo (opcional)

---

### Fase 6: Tela Minhas Reservas (Dia 9)

#### 3.6.1 Listagem de Reservas (RF-07)

- [ ] Criar `app/(dashboard)/minhas-reservas/page.tsx`
- [ ] Implementar `lib/google-calendar/events.ts#listByUser()`:
  - Filtrar eventos por `extendedProperties.private.responsibleEmail`
- [ ] Criar componentes de listagem:
  - `components/reservas/reservas-list.tsx`
  - `components/reservas/reserva-card.tsx`

#### 3.6.2 Cancelamento de Reserva

- [ ] Implementar Server Action `cancelarReserva(eventId: string)`
- [ ] Criar modal de confirmação (`components/reservas/cancel-modal.tsx`)
- [ ] Exibir feedback de sucesso/erro

---

### Fase 7: Agenda Geral (Dia 10)

#### 3.7.1 Iframe do Google Calendar (RF-08)

- [ ] Criar `app/(dashboard)/agenda-geral/page.tsx`
- [ ] Implementar `components/calendario/calendar-iframe.tsx`:
  ```typescript
  const CalendarIframe = () => {
    const { calendarIframeUrl } = useTenant();
    return <iframe src={calendarIframeUrl} />;
  };
  ```
- [ ] Configurar URL via variável de ambiente por tenant

---

### Fase 8: Notificações OneSignal (Dia 11)

#### 3.8.1 Integração OneSignal (RF-09)

- [ ] Configurar OneSignal no Google Cloud Console
- [ ] Instalar `@onesignal/react-web-push`
- [ ] Criar `lib/notifications/onesignal.ts`:
  - Inicializar OneSignal no client
  - Solicitar permissão de notificação
  - Enviar notificações agendadas
- [ ] Implementar lógica de notificação:
  - Notificar X horas antes do evento
  - Incluir link para cancelar

---

### Fase 9: PWA e Responsividade (Dia 12)

#### 3.9.1 PWA Manifest (RNF-02)

- [ ] Criar `public/manifest.json`:
  ```json
  {
    "name": "Reserva de Espaços - Oitava Igreja",
    "short_name": "Reserva",
    "description": "Sistema de reserva de espaços da igreja",
    "start_url": "/reserva",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#5750F1",
    "icons": [
      {
        "src": "/icons/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```
- [ ] Adicionar link ao manifest no layout
- [ ] Criar ícones da aplicação

#### 3.9.2 Responsividade (RNF-01)

- [ ] Testar em desktop, tablet e mobile
- [ ] Ajustar componentes com Tailwind breakpoints
- [ ] Garantir usabilidade em telas pequenas

---

### Fase 10: Polimento e Testes (Dia 13-14)

#### 3.10.1 Testes Manuais

- [ ] Testar fluxo completo de reserva simples
- [ ] Testar fluxo completo de reserva recorrente
- [ ] Testar cancelamento de reservas
- [ ] Testar validações de regras de negócio
- [ ] Testar multi-tenant (se aplicável)
- [ ] Testar em diferentes dispositivos

#### 3.10.2 Ajustes de UI/UX

- [ ] Refinar loadings e feedbacks
- [ ] Melhorar mensagens de erro
- [ ] Ajustar acessibilidade (ARIA labels)
- [ ] Otimizar performance

#### 3.10.3 Documentação

- [ ] Atualizar README.md
- [ ] Documentar variáveis de ambiente
- [ ] Criar guia de deploy

---

## 4. Matriz de Rastreabilidade

| Requisito | Componente/Arquivo | Status |
|-----------|-------------------|--------|
| RF-01 (Autenticação) | `app/(auth)/login/`, `lib/auth/` | Pendente |
| RF-02 (Tela de Reserva) | `app/(dashboard)/reserva/`, `components/reserva/` | Pendente |
| RF-03 (Lista de Espaços) | `config/espacos.ts` | Pendente |
| RF-04 (Reserva Simples) | `lib/google-calendar/availability.ts` | Pendente |
| RF-05 (Reserva Recorrente) | `lib/google-calendar/recurrence.ts` | Pendente |
| RF-06 (Propriedades Customizadas) | `lib/google-calendar/events.ts` | Pendente |
| RF-07 (Minhas Reservas) | `app/(dashboard)/minhas-reservas/` | Pendente |
| RF-08 (Agenda Geral) | `app/(dashboard)/agenda-geral/` | Pendente |
| RF-09 (Notificações) | `lib/notifications/onesignal.ts` | Pendente |
| RF-10 (Multi-Tenant) | `lib/tenant/`, `config/tenants.ts` | Pendente |
| RN-01 a RN-04 | `lib/validation/reserva.ts`, `lib/utils/rules.ts` | Pendente |
| RNF-01 (Responsividade) | Todos componentes com Tailwind | Pendente |
| RNF-02 (PWA) | `public/manifest.json` | Pendente |
| RNF-03 (Segurança) | Server Actions, variáveis de ambiente | Pendente |
| RNF-04 (Performance) | Validações no backend | Pendente |
| RNF-06 (Loadings) | `components/ui/loading-spinner.tsx` | Pendente |

---

## 5. Pré-requisitos e Configurações Externas

### 5.1 Google Cloud Console

1. Criar projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar APIs:
   - Google Calendar API
   - Google People API (para dados do usuário)
3. Criar credenciais OAuth 2.0:
   - Client ID
   - Client Secret
   - Redirect URI: `http://localhost:3000/api/auth/callback/google`

### 5.2 Google Calendar

1. Criar agendas para cada espaço:
   - Templo
   - Salão Social
   - Sala A, B, 01, 02, etc.
2. Obter `calendarId` de cada agenda
3. Configurar permissões de escrita para a aplicação

### 5.3 OneSignal

1. Criar conta no [OneSignal](https://onesignal.com)
2. Criar novo app Web Push
3. Obter:
   - App ID
   - REST API Key

---

## 6. Critérios de Aceite por Fase

### Fase 1 (Setup)
- [ ] Projeto rodando localmente com `npm run dev`
- [ ] Template admin carregando corretamente
- [ ] Variáveis de ambiente configuradas

### Fase 2 (Multi-Tenant)
- [ ] Sistema de tenants funcional
- [ ] Configurações de espaços carregando

### Fase 3 (Google Calendar)
- [ ] Autenticação com Google funcionando
- [ ] CRUD de eventos implementado
- [ ] Verificação de conflitos operacional

### Fase 4 (Auth e Layout)
- [ ] Login via SSO Google funcional
- [ ] Redirecionamento automático após login
- [ ] Menu lateral com navegação básica

### Fase 5 (Reserva)
- [ ] Formulário de reserva completo
- [ ] Validações de regras de negócio
- [ ] Reserva simples criando eventos no Calendar
- [ ] Reserva recorrente criando múltiplos eventos
- [ ] Feedback de conflitos e erros

### Fase 6 (Minhas Reservas)
- [ ] Listagem de reservas do usuário
- [ ] Cancelamento de reservas funcional
- [ ] Modal de confirmação

### Fase 7 (Agenda Geral)
- [ ] Iframe do Calendar exibindo agenda consolidada

### Fase 8 (Notificações)
- [ ] OneSignal integrado
- [ ] Notificações sendo enviadas

### Fase 9 (PWA)
- [ ] Manifest.json configurado
- [ ] Aplicação instalável no mobile
- [ ] Responsividade testada

### Fase 10 (Polimento)
- [ ] Todos os critérios de sucesso do PRD atendidos
- [ ] Nenhum bug crítico conhecido
- [ ] Documentação completa

---

## 7. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| API Google Calendar com limitações | Alto | Implementar retry logic e cache |
| Complexidade do multi-tenant | Médio | Começar com single-tenant, evoluir depois |
| Conflitos de concorrência | Médio | Usar transações otimizadas no Calendar |
| OneSignal gratuito com limitações | Baixo | Avaliar alternativas ou upgrade |
| Template admin com dependências desatualizadas | Médio | Atualizar dependências gradualmente |

---

## 8. Próximos Passos Imediatos

1. **Copiar template para raiz do projeto**
   ```bash
   # Copiar conteúdo de nextjs-admin-dashboard-main/ para raiz
   ```

2. **Instalar dependências adicionais**
   ```bash
   npm install next-auth@beta @googleapis/calendar zod @onesignal/react-web-push
   ```

3. **Configurar variáveis de ambiente**
   - Copiar `.env.local.example` para `.env.local`
   - Preencher com credenciais do Google OAuth

4. **Configurar NextAuth**
   - Criar rotas de API de autenticação
   - Configurar provider Google

5. **Implementar Fase 1 completa antes de prosseguir**

---

## 9. Notas Técnicas

### 9.1 Decisões de Arquitetura

- **Monolito Next.js:** Todas as funcionalidades no mesmo projeto, usando App Router
- **Server Actions:** Sem API REST, comunicação direta do componente para o servidor
- **Sem banco de dados:** Configurações em arquivos e variáveis de ambiente (MVP)
- **Google Calendar como fonte da verdade:** Todos os eventos residem no Calendar

### 9.2 Considerações de Segurança

- Tokens do Google nunca expostos no client
- Server Actions validam autenticação antes de executar
- Variáveis de ambiente sensíveis no servidor

### 9.3 Evolução Futura (Pós-MVP)

- Adicionar banco de dados para histórico e relatórios
- Implementar sistema de aprovação de reservas
- Gestão de usuários e permissões
- Relatórios e analytics
- Integração com outros calendários (Outlook, Apple)

---

**Fim do Documento**
