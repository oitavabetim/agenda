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

## Dados Coletados pela Aplicação

### Autenticação (Google OAuth)

| Dado | Origem | Finalidade |
|---|---|---|
| Nome completo | Google Profile | Identificar usuário |
| E-mail | Google Profile | Identificação e comunicação |
| Foto de perfil | Google Profile | Exibição no header |
| ID Google | Google Profile | Identificação única interna |

### Escopos OAuth Solicitados

| Escopo | Descrição | Uso |
|---|---|---|
| `openid` | Autenticação OpenID Connect | Login SSO |
| `userinfo.email` | E-mail do usuário | Identificação |
| `userinfo.profile` | Nome e foto | Perfil do usuário |
| `calendar` | Acesso ao Google Calendar | Criar/gerenciar eventos de reserva |

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
- **Tokens de acesso Google** são persistidos apenas no JWT da sessão (servidor)

---

## Plano de Implementação

### Arquivos a Criar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(public)/politica-privacidade/page.tsx` | **Criar** | Página estática com política de privacidade |
| `src/app/(public)/layout.tsx` | **Criar** | Layout mínimo para páginas públicas (sem sidebar) |

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/middleware.ts` | **Modificar** | Permitir acesso público à rota `/politica-privacidade` |
| `src/components/Layouts/header/index.tsx` | **Modificar** (opcional) | Adicionar link "Política de Privacidade" no footer ou header |

---

### Passo 1: Criar grupo de rotas públicas `(public)`

**Arquivo:** `src/app/(public)/layout.tsx`

Layout mínimo para páginas que não requerem autenticação:

```tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {children}
    </main>
  );
}
```

---

### Passo 2: Criar página de política de privacidade

**Arquivo:** `src/app/(public)/politica-privacidade/page.tsx`

Página estática com conteúdo completo cobrindo:

1. **Introdução** — Quem somos, propósito
2. **Dados Coletados** — Autenticação, formulário, uso
3. **Escopos OAuth** — Cada escopo solicitado e sua finalidade
4. **Finalidade do Tratamento** — Por que coletamos
5. **Armazenamento** — Google Calendar, sem banco próprio
6. **Compartilhamento** — Google Cloud Platform, diáconos/cozinha
7. **Segurança** — HTTPS, NextAuth, tokens seguros
8. **Direitos do Titular** — LGPD (acesso, retificação, exclusão)
9. **Cookies** — Sessão NextAuth
10. **Contato** — E-mail do administrador/igreja
11. **Atualizações** — Como mudanças são comunicadas

**Estrutura do componente:**

```tsx
export default function PoliticaPrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      <p className="text-sm text-gray-500">Última atualização: {data}</p>

      <section>1. Introdução</section>
      <section>2. Dados Coletados</section>
      <section>3. Escopos Google OAuth</section>
      <section>4. Finalidade</section>
      <section>5. Armazenamento</section>
      <section>6. Compartilhamento</section>
      <section>7. Segurança</section>
      <section>8. Seus Direitos (LGPD)</section>
      <section>9. Cookies</section>
      <section>10. Contato</section>
    </div>
  );
}
```

---

### Passo 3: Atualizar middleware para permitir acesso público

**Arquivo:** `src/middleware.ts`

Adicionar `/politica-privacidade` às rotas públicas:

**Antes:**
```typescript
const publicPaths = ["/api/auth"];
```

**Depois:**
```typescript
const publicPaths = ["/api/auth", "/politica-privacidade"];
```

---

### Passo 4 (Opcional): Adicionar link no footer

Se houver footer na aplicação, adicionar link para a política:

```tsx
<Link href="/politica-privacidade" className="text-sm text-gray-500">
  Política de Privacidade
</Link>
```

---

## Checklist de Validação

- [ ] Página acessível sem login (`/politica-privacidade`)
- [ ] Middleware não bloqueia rota pública
- [ ] Conteúdo cobre todos os escopos OAuth solicitados
- [ ] Conteúdo descreve dados coletados e finalidade
- [ ] Conteúdo menciona LGPD e direitos do usuário
- [ ] Conteúdo informa e-mail de contato
- [ ] Layout legível (desktop e mobile)
- [ ] Dark mode funciona
- [ ] Build passa sem erros
- [ ] Google consegue acessar a página para validação OAuth

---

## Riscos e Considerações

| Risco | Mitigação |
|---|---|
| Google rejeitar política incompleta | Cobrir todos os escopos e dados coletados explicitamente |
| URL não acessível publicamente | Middleware configurado para permitir `/politica-privacidade` |
| Dados de contato desatualizados | Usar placeholder para e-mail do administrador (configurável) |
| Política desatualizada | Incluir data de última atualização no topo |

---

## Arquivos de Referência

| Arquivo | Caminho |
|---|---|
| Middleware atual | `src/middleware.ts` |
| Auth config | `src/lib/auth/index.ts` |
| Auth config (callbacks) | `src/lib/auth/auth.config.ts` |
| Header (para link) | `src/components/Layouts/header/index.tsx` |
| Google Calendar events | `src/lib/google-calendar/events.ts` |
| Reserva form context | `src/app/(dashboard)/reserva/_components/ReservaFormContext.tsx` |
| Reserva actions | `src/app/(dashboard)/reserva/_components/actions.ts` |

---

## Regras Vercel Aplicadas

| Regra | Skill | Onde Aplicada |
|---|---|---|
| Server Components por padrão | react-best-practices | Página estática sem interatividade |
| Cheap Condition Before Async | react-best-practices | N/A — página sem operações async |
| Avoid Barrel Imports | react-best-practices | Imports diretos se necessário |
