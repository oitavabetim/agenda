# Oitava Igreja Agenda

**Sistema de Reserva de Espaços da Igreja** — Aplicação web para gerenciamento de reservas de espaços integrada ao Google Calendar.

---

## 📋 Sobre o Projeto

Sistema completo para reserva de espaços de igrejas, desenvolvido com **Next.js 16+** (App Router), **React 19** e **TypeScript**. Integrado ao **Google Calendar** como fonte da verdade para disponibilidade e conflitos.

### Arquitetura

- **Multi-Tenant por Deploy** — Cada igreja possui seu próprio deploy com configurações isoladas (espaços, credenciais Google, mapa personalizado)
- **Google Calendar como Backend** — Cada espaço físico é uma agenda no Google Calendar; eventos são criados/cancelados via API
- **PWA Instalável** — Aplicação instalável em dispositivos móveis com manifest.json configurado
- **Server-First** — Server Components por padrão, Server Actions para mutations, Client Components apenas para interatividade

### ✨ Funcionalidades Implementadas

- 🔐 **Autenticação SSO Google** — Login seguro com conta Google via NextAuth.js v5
- 📅 **Integração Google Calendar** — Cada espaço físico é uma agenda no Google Calendar
- 🔄 **Reservas Recorrentes** — Suporte para eventos semanais e mensais (eventos individuais, não recorrência nativa do Google)
- ⚠️ **Controle de Conflitos** — Validação automática de disponibilidade antes de criar reservas; aborta totalmente em caso de conflito
- 📱 **PWA** — Aplicação instalável em dispositivos móveis
- 🏢 **Multi-Tenant** — Espaços configuráveis por igreja/deploy, nome dinâmico por tenant
- 📋 **Minhas Reservas** — Listagem de reservas do usuário com cancelamento
- 🗓️ **Agenda Geral** — Visualização consolidada via iframe do Google Calendar
- 🎨 **Responsivo + Dark Mode** — Funciona em desktop, tablet e celular com suporte a tema escuro
- ⏳ **Loading States** — Feedback visual durante operações com spinner e botão desabilitado

### ⚠️ Não Implementado (MVP)

- 🔔 Notificações push (OneSignal planejado, não implementado)

### 🏛️ Espaços Disponíveis

Os espaços são **configuráveis por tenant** — cada igreja define seus próprios espaços no arquivo de configuração. Não há lista fixa no código.

**Exemplo: Oitava Igreja Betim**
- Templo
- Salão Social
- Salas de reunião (A, B, 01-07)
- Sala Apoio Ministerial

Cada deploy pode ter quantidades, nomes e capacidades diferentes de espaços. O mapa da igreja também é personalizável por deploy.

---

## 🚀 Tecnologias Utilizadas

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 16+ (App Router) |
| **Linguagem** | TypeScript |
| **UI** | React 19, Tailwind CSS |
| **Formulários** | React Hook Form + Zod |
| **Autenticação** | NextAuth.js v5 (beta) |
| **Calendar** | Google Calendar API (@googleapis/calendar) |
| **Data** | Day.js |
| **Tema** | next-themes (Dark Mode) |
| **UI Utils** | CVA, clsx, tailwind-merge |

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Google Cloud Console
- Google Calendar API habilitada

### Passos Rápidos

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd oitava-igreja-agenda
```

2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

4. Preencha as variáveis de ambiente no arquivo `.env.local` (veja [Guia de Configuração](doc/guia-adicionando-nova-igreja.md) para detalhes)

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse `http://localhost:3000`

> 📖 **Guia Completo:** Para instruções detalhadas sobre como configurar uma nova igreja, consulte [doc/guia-adicionando-nova-igreja.md](doc/guia-adicionando-nova-igreja.md)

---

## 📖 Uso

### Para Membros da Igreja

1. Faça login com sua conta Google
2. Acesse a tela "Reservar Espaço"
3. Preencha os dados da programação
4. Selecione os espaços desejados
5. Confira a disponibilidade
6. Confirme a reserva

### Para Administradores

- Configure espaços e agendas do Google Calendar no arquivo de configuração do tenant
- Visualize todas as reservas na Agenda Geral

---

## 🏗️ Estrutura do Projeto

```
oitava-igreja-agenda/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Grupo: rotas de autenticação
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Grupo: rotas do dashboard
│   │   │   ├── reserva/              # Formulário de reserva
│   │   │   ├── minhas-reservas/      # Lista de reservas do usuário
│   │   │   ├── agenda-geral/         # Iframe do Google Calendar
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx              # Redireciona para /reserva
│   │   ├── api/auth/[...nextauth]/   # NextAuth API routes
│   │   ├── layout.tsx                # Layout raiz com metadata PWA
│   │   └── providers.tsx             # SessionProvider
│   ├── components/
│   │   ├── Layouts/                  # Header, Sidebar, Dashboard
│   │   └── ui/                       # Componentes de UI genéricos
│   ├── lib/
│   │   ├── auth/                     # Configuração NextAuth
│   │   ├── google-calendar/          # Integração Google Calendar
│   │   │   ├── index.ts              # Cliente OAuth2
│   │   │   ├── availability.ts       # Verificação de disponibilidade
│   │   │   ├── events.ts             # CRUD de eventos
│   │   │   └── recurrence.ts         # Recorrências
│   │   ├── tenant/                   # Configuração multi-tenant
│   │   │   ├── config.ts             # Definição de tenants
│   │   │   └── tenant-context.tsx    # Contexto React
│   │   └── validation/               # Schemas Zod
│   ├── types/                        # Tipos TypeScript
│   └── middleware.ts                 # Middleware de proteção de rotas
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── images/mapas/                 # Mapas das igrejas
├── doc/
│   ├── prds/                         # Product Requirements Documents
│   ├── implementacoes-realizadas/    # Planos de implementação executados
│   └── guia-adicionando-nova-igreja.md
└── .env.local.example                # Template de variáveis de ambiente
```

---

## 📜 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **RN-01** | Horário final deve ser maior que horário inicial |
| **RN-02** | Não permitir reservas em datas anteriores ao dia atual |
| **RN-03** | Reservas devem ter duração mínima de 30 minutos |
| **RN-04** | Janela permitida: Seg-Qui → próxima semana; Sex-Dom → semana subsequente (garante tempo para organização de escalas) |
| **RN-05** | Conflito em qualquer espaço/data aborta TODA a reserva (nenhuma reserva parcial é criada) |

---

## 📄 Documentação

- [PRD do Sistema](doc/prds/prd_sistema_de_reserva_de_espacos_da_igreja.md)
- [Guia: Configurando Nova Igreja](doc/guia-adicionando-nova-igreja.md)
- [Implementações Realizadas](doc/implementacoes-realizadas/) — Histórico completo de todos os planos executados

---

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Roda linter
```

---

## 🔐 Segurança

- Tokens e credenciais Google nunca são expostos no client
- Todas as operações sensíveis são feitas via Server Actions com autenticação
- Variáveis de ambiente sensíveis apenas no servidor
- Autenticação com NextAuth.js e sessões seguras
- Validação de inputs com Zod no servidor

---

## 📱 PWA

A aplicação é um Progressive Web App (PWA) e pode ser instalada no seu dispositivo móvel:

1. Acesse a aplicação no navegador do celular
2. Toque em "Adicionar à tela inicial" (Chrome) ou "Adicionar à Tela de Início" (Safari)
3. Use como um app nativo

---

## 🛠️ Skills e Boas Práticas

Este projeto utiliza as seguintes skills de referência para desenvolvimento:

| Skill | Descrição |
|-------|-----------|
| **[Vercel React Best Practices](.agents/skills/vercel-react-best-practices/)** | Otimizações de performance React/Next.js (69 regras em 8 categorias) |
| **[Vercel Composition Patterns](.agents/skills/vercel-composition-patterns/)** | Padrões de composição de componentes React (compound components, state management) |
| **[Vercel React Native Skills](.agents/skills/vercel-react-native-skills/)** | Boas práticas para mobile React Native/Expo (referência futura) |

---

## ✅ Critérios de Sucesso

| Critério | Status |
|----------|--------|
| Usuário consegue reservar múltiplos espaços sem conflitos | ✅ |
| Nenhuma reserva parcial é criada | ✅ |
| Usuário consegue listar e cancelar suas próprias reservas | ✅ |
| Sistema reduz conflitos operacionais da igreja | ✅ |
| Notificações push (OneSignal) | ⚠️ Planejado, não implementado |

---

## 🔮 Melhorias Futuras

- 🔔 **Notificações push** — Integração com OneSignal para lembretes de eventos
- 🧪 **Testes automatizados** — Testes unitários e de integração

---

## 🤝 Contribuindo

Projeto de uso interno da Oitava Igreja. Desenvolvido seguindo as melhores práticas da Vercel Engineering para React e Next.js.

---

## 📝 Licença

Este projeto é de uso interno da Oitava Igreja.

---

## 🆘 Suporte

Para dúvidas ou problemas, por favor abra uma issue no repositório.

---

**Desenvolvido com ❤️ para a Oitava Igreja**
