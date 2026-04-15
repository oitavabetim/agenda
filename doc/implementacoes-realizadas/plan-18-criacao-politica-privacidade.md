# Plan 18 — Criação da Página de Política de Privacidade

## Contexto

O Google está solicitando uma página de Política de Privacidade para o aplicativo de autenticação OAuth. Esta página deve ser acessível publicamente (sem login) e descrever quais dados são coletados, como são usados e compartilhados.

### Requisitos do Google OAuth

- Página acessível publicamente (sem autenticação)
- Descrever escopos OAuth solicitados
- Explicar coleta, uso e compartilhamento de dados
- Informar direitos do usuário
- Link visível na aplicação

---

## Princípios Aplicados (Vercel Best Practices)

### 1. Server Components por Padrão ([react-best-practices](.agents/skills/vercel-react-best-practices/))
- Página de política de privacidade é **100% estática** — sem client components
- Sem interatividade, sem `useState`, sem `useEffect`
- Renderizada como static content no build

### 2. Route Group para Rotas Públicas ([composition-patterns](.agents/skills/vercel-composition-patterns/))
- Usar `(public)` route group para isolar páginas sem autenticação
- Layout próprio sem sidebar/header do dashboard
- Decoupled do layout principal da aplicação

### 3. Avoid Barrel Imports ([bundle-barrel-imports](.agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md))
- Imports diretos nos componentes da página
- Sem criar `index.ts` barrel file para páginas

### 4. Auth Callback como Gate de Rotas ([state-decouple-implementation](.agents/skills/vercel-composition-patterns/rules/state-decouple-implementation.md))
- Proteção de rotas já existe em `auth.config.ts` (callback `authorized`)
- Páginas públicas não precisam de middleware — basta não entrar no grupo protegido
- O grupo `(public)` fica fora do scope do `authorized` guard

---

## Dados Coletados pela Aplicação

### Autenticação (Google OAuth)

| Dado | Origem | Finalidade |
|---|---|---|
| Nome completo | Google Profile | Identificar usuário |
| E-mail | Google Profile | Identificação e comunicação |
| Foto de perfil | Google Profile | Exibição no header |
| ID Google | Google Profile | Identificação única interna |

### Escopos OAuth Solicitados

> **Nota:** As operações com Google Calendar são realizadas via **Service Account**
> no servidor da aplicação. O login do usuário **não** solicita permissão de
> acesso ao Calendar. O usuário autentica-se apenas para identificação (nome,
> e-mail, foto).

| Escopo | Descrição | Uso |
|---|---|---|
| `openid` | Autenticação OpenID Connect | Login SSO |
| `userinfo.email` | E-mail do usuário | Identificação |
| `userinfo.profile` | Nome e foto | Perfil do usuário |

### Dados do Formulário de Reserva

| Dado | Finalidade | Armazenamento |
|---|---|---|
| Programação (título) | Nome do evento no Calendar | Google Calendar |
| Responsável | Descrição do evento | Google Calendar (description) |
| Telefone | Contato para diáconos/cozinha | Google Calendar (description) |
| Observações | Detalhes do evento | Google Calendar (description) |
| Data/horário | Agendamento | Google Calendar |
| Espaços selecionados | Qual agenda usar | Google Calendar (calendarId) |

### Onde os Dados São Armazenados

- **Todos os dados de reserva** são armazenados no **Google Calendar** do tenant (igreja)
- **A aplicação não possui banco de dados próprio**
- **Tokens de sessão** são gerenciados pelo NextAuth.js (cookie seguro)
- **Google Calendar** é acessado via **Service Account** no servidor — o app não acessa o Calendar pessoal do usuário

---

## Plano de Implementação

### Arquivos a Criar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(public)/layout.tsx` | **Criar** | Layout mínimo para rotas públicas (sem sidebar/header do dashboard) |
| `src/app/(public)/politica-privacidade/page.tsx` | **Criar** | Server Component estático com texto completo da política |

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---|---|---|
| Nenhum | — | A proteção de rotas é feita pelo callback `authorized` em `auth.config.ts` — rotas fora do grupo `(dashboard)` já são públicas |

> **Nota:** A aplicação **não possui `middleware.ts`**. A proteção de rotas é gerenciada pelo callback `authorized` do NextAuth em `src/lib/auth/auth.config.ts`, que verifica `nextUrl.pathname.startsWith("/")`. O grupo `(public)` ficará fora do escopo protegido por usar um route group diferente.

---

### Passo 1: Criar grupo de rotas públicas `(public)`

**Arquivo:** `src/app/(public)/layout.tsx`

Layout mínimo para páginas que não requerem autenticação nem a estrutura do dashboard:

```tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {children}
    </div>
  );
}
```

> **Nota:** Usa `<div>` ao invés de `<main>` pois o layout pode envolver múltiplas seções. O `min-h-screen` garante fundo completo para dark mode.

---

### Passo 2: Criar página de política de privacidade

**Arquivo:** `src/app/(public)/politica-privacidade/page.tsx`

**Server Component estático** — sem `"use client"`, sem hooks, sem interatividade.

Conteúdo completo cobrindo:

1. **Introdução** — Quem somos, propósito da aplicação
2. **Dados Coletados** — Autenticação (Google OAuth), formulário de reserva
3. **Escopos OAuth** — Apenas `openid`, `userinfo.email`, `userinfo.profile` (sem calendar)
4. **Service Account** — Explicar que Calendar usa conta de serviço no servidor
5. **Finalidade do Tratamento** — Reserva de espaços, identificação de usuários
6. **Armazenamento** — Google Calendar do tenant, sem banco de dados próprio
7. **Compartilhamento** — Google Cloud Platform (Service Account), equipe interna (diáconos, cozinha)
8. **Segurança** — HTTPS, NextAuth, tokens seguros, Service Account no servidor
9. **Direitos do Titular (LGPD)** — Acesso, retificação, exclusão, portabilidade
10. **Cookies** — Sessão NextAuth (cookie seguro, httpOnly)
11. **Contato** — E-mail do administrador
12. **Atualizações** — Como mudanças são comunicadas

```tsx
export default function PoliticaPrivacidadePage() {
  const atualizacao = "13 de abril de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Última atualização: {atualizacao}
      </p>

      <div className="mt-8 space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            1. Introdução
          </h2>
          <p className="mt-2">
            O sistema de reserva de espaços é uma aplicação web para
            gerenciamento de reservas de espaços integrada ao Google Calendar.
            Esta política descreve como coletamos, usamos e protegemos seus
            dados pessoais.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            2. Dados Coletados
          </h2>
          <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
            2.1 Autenticação (Google OAuth)
          </h3>
          <p className="mt-2">
            Ao fazer login com sua conta Google, coletamos apenas os dados
            necessários para identificação:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Foto de perfil (opcional)</li>
            <li>Identificador único do Google (ID)</li>
          </ul>

          <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
            2.2 Dados do Formulário de Reserva
          </h3>
          <p className="mt-2">
            Ao criar uma reserva, coletamos:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Título da programação</li>
            <li>Nome do responsável</li>
            <li>Telefone de contato</li>
            <li>Observações (opcionais)</li>
            <li>Data e horário da reserva</li>
            <li>Espaços selecionados</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            3. Escopos Google OAuth Solicitados
          </h2>
          <p className="mt-2">
            Nosso login utiliza apenas os seguintes escopos do Google:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                openid
              </code>{" "}
              — Autenticação OpenID Connect
            </li>
            <li>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                userinfo.email
              </code>{" "}
              — E-mail do usuário
            </li>
            <li>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                userinfo.profile
              </code>{" "}
              — Nome e foto
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Nota importante:</strong> As operações com Google Calendar
              são realizadas via <strong>Service Account</strong> no servidor da
              aplicação. O login do usuário <strong>não</strong> solicita
              permissão de acesso ao Calendar. O usuário autentica-se apenas
              para identificação (nome, e-mail, foto).
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            4. Finalidade do Tratamento
          </h2>
          <p className="mt-2">
            Utilizamos seus dados para:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Identificar você no sistema de reservas</li>
            <li>Criar e gerenciar reservas de espaços no Google Calendar</li>
            <li>Exibir suas reservas na seção &quot;Minhas Reservas&quot;</li>
            <li>
              Disponibilizar informações de contato (responsável e telefone)
              para diáconos e equipe de cozinha
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            5. Armazenamento dos Dados
          </h2>
          <p className="mt-2">
            <strong>Não possuímos banco de dados próprio.</strong> Todos os
            dados de reserva são armazenados no <strong>Google Calendar</strong>
            da igreja (tenant). Informações de sessão são gerenciadas pelo
            NextAuth.js via cookies seguros.
          </p>
          <p className="mt-2">
            O Google Calendar é acessado exclusivamente via Service Account no
            servidor — não acessamos o Calendar pessoal do usuário.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            6. Compartilhamento de Dados
          </h2>
          <p className="mt-2">
            Seus dados podem ser compartilhados com:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Google Cloud Platform</strong> — como infraestrutura de
              armazenamento (Google Calendar via Service Account)
            </li>
            <li>
              <strong>Equipe interna da igreja</strong> — diáconos e equipe de
              cozinha podem visualizar nome do responsável e telefone no
              descritivo do evento
            </li>
          </ul>
          <p className="mt-2">
            <strong>Não vendemos, alugamos ou compartilhamos seus dados</strong>{" "}
            com terceiros para fins de marketing ou publicidade.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            7. Segurança
          </h2>
          <p className="mt-2">
            Adotamos as seguintes medidas de segurança:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Conexões criptografadas via HTTPS em toda a aplicação
            </li>
            <li>
              Autenticação segura via NextAuth.js com OAuth 2.0 do Google
            </li>
            <li>
              Tokens de sessão armazenados em cookies seguros (httpOnly)
            </li>
            <li>
              Service Account do Google Calendar protegida no servidor —
              credenciais nunca expostas no cliente
            </li>
            <li>
              Validação de dados de entrada com Zod no servidor
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            8. Seus Direitos (LGPD)
          </h2>
          <p className="mt-2">
            De acordo com a Lei Geral de Proteção de Dados (LGPD — Lei nº
            13.709/2018), você tem direito a:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Acesso</strong> — solicitar cópia dos dados que temos
              sobre você
            </li>
            <li>
              <strong>Retificação</strong> — corrigir dados incompletos,
              inexatos ou desatualizados
            </li>
            <li>
              <strong>Exclusão</strong> — solicitar a eliminação dos seus dados
              pessoais (exceto quando o armazenamento for obrigatório por lei)
            </li>
            <li>
              <strong>Portabilidade</strong> — transferir seus dados para outro
              fornecedor de serviço
            </li>
            <li>
              <strong>Revogação do consentimento</strong> — retirar seu
              consentimento para o tratamento de dados a qualquer momento
            </li>
          </ul>
          <p className="mt-2">
            Para exercer seus direitos, entre em contato conosco pelo e-mail
            informado na seção &quot;Contato&quot;.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            9. Cookies
          </h2>
          <p className="mt-2">
            Utilizamos cookies de sessão gerenciados pelo NextAuth.js. Estes
            cookies são:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>httpOnly</strong> — não acessíveis via JavaScript no
              navegador
            </li>
            <li>
              <strong>Secure</strong> — transmitidos apenas por conexões HTTPS
            </li>
            <li>
              <strong>Temporários</strong> — expiram quando a sessão termina ou
              após período de inatividade
            </li>
          </ul>
          <p className="mt-2">
            Não utilizamos cookies de rastreamento, analytics ou publicidade.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            10. Contato
          </h2>
          <p className="mt-2">
            Para dúvidas, solicitações ou exercício de seus direitos previstos
            na LGPD, entre em contato:
          </p>
          <p className="mt-2">
            <strong>E-mail:</strong>{" "}
            {/* Inserir e-mail do administrador da igreja */}
            <span className="italic text-gray-500">
              [e-mail da igreja]
            </span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            11. Atualizações desta Política
          </h2>
          <p className="mt-2">
            Esta política pode ser atualizada periodicamente. Notificaremos
            sobre mudanças significativas através de aviso na própria aplicação
            ou por e-mail. Recomendamos revisar esta página regularmente.
          </p>
        </section>
      </div>
    </div>
  );
}
```

---

## Checklist de Validação

- [ ] Página acessível sem login (`/politica-privacidade`)
- [ ] Página é Server Component (sem `"use client"`)
- [ ] Layout público isolado do dashboard (`(public)` route group)
- [ ] Conteúdo cobre todos os escopos OAuth solicitados (apenas 3, sem calendar)
- [ ] Conteúdo descreve dados coletados e finalidade
- [ ] Conteúdo menciona Service Account para Calendar
- [ ] Conteúdo menciona LGPD e direitos do usuário
- [ ] Conteúdo informa e-mail de contato
- [ ] Layout legível (desktop e mobile, responsive com `sm:`, `lg:`)
- [ ] Dark mode funciona (classes `dark:` em todos os elementos)
- [ ] Build passa sem erros
- [ ] Google consegue acessar a página para validação OAuth

---

## Riscos e Considerações

| Risco | Mitigação |
|---|---|
| Google rejeitar política incompleta | Cobrir todos os escopos e dados coletados explicitamente |
| URL não acessível publicamente | Route group `(public)` fora do scope do `authorized` guard |
| Dados de contato desatualizados | Usar placeholder `[e-mail da igreja]` para substituir depois |
| Política desatualizada | Incluir data de última atualização no topo |
| Página ser renderizada como client component | Não usar `"use client"` — é Server Component por padrão |

---

## Arquivos de Referência

| Arquivo | Caminho |
|---|---|
| Auth config (protected routes) | `src/lib/auth/auth.config.ts` |
| Auth config (providers) | `src/lib/auth/index.ts` |
| Dashboard layout | `src/app/(dashboard)/layout.tsx` |
| Root layout | `src/app/layout.tsx` |
| Google Calendar client | `src/lib/google-calendar/index.ts` |
| Reserva form context | `src/app/(dashboard)/reserva/_components/ReservaFormContext.tsx` |
| Reserva actions | `src/app/(dashboard)/reserva/_components/actions.ts` |

---

## Regras Vercel Aplicadas

| Regra | Skill | Onde Aplicada |
|---|---|---|
| Server Components por padrão | react-best-practices | Página 100% estática, sem `"use client"` |
| Route Group isolation | composition-patterns | `(public)` separado de `(dashboard)` |
| Avoid Barrel Imports | react-best-practices | Sem `index.ts` barrel na página |
| Decoupled Layout | composition-patterns | `PublicLayout` isolado do `DashboardLayout` |
| Cheap Condition Before Auth | react-best-practices | Rotas públicas fora do scope do `authorized` guard |
