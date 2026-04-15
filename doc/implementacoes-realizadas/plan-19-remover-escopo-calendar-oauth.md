# Plan 19 — Remover Escopo Calendar Desnecessário do OAuth

## Contexto

A aplicação usa **Service Account (JWT)** para todas as operações com Google Calendar. No entanto, o fluxo de autenticação OAuth do login está solicitando o escopo `https://www.googleapis.com/auth/calendar` **desnecessariamente**.

### Problemas Identificados

| Problema | Arquivo | Impacto |
|---|---|---|
| **Escopo `calendar` no OAuth** | `src/lib/auth/index.ts` | Google exige justificativa na Política de Privacidade e revisão OAuth |
| **`accessToken` persistido no JWT** | `src/lib/auth/auth.config.ts` | Dado desnecessário armazenado no token |
| **`accessToken` exposto ao client** | `src/lib/auth/auth.config.ts` | `session.user.accessToken` acessível no browser sem necessidade |
| **Tela de consentimento assustadora** | Google OAuth | Usuário vê permissão de Calendar e pode desistir do login |

### Confirmação: Service Account é Usada para Calendar

**`src/lib/google-calendar/index.ts`** — Todas as operações usam JWT/Service Account:
```typescript
function getJWTClient(): JWT {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
}
```

### Confirmação: `accessToken` Nunca é Usado

Busca por `session.user.accessToken` em todo o `src/` retorna **apenas 1 resultado** — a linha onde é definido no `auth.config.ts`. Nenhum componente, server action ou API route consome este valor.

---

## Princípios Aplicados (Vercel Best Practices)

### 1. Minimum Necessary Scope
- Solicitar apenas escopos estritamente necessários no OAuth
- Princípio de menor privilégio — security best practice

### 2. Don't Store What You Don't Use
- `accessToken` é persistido no JWT mas nunca consumido
- Remover reduz superfície de ataque e complexidade

### 3. Server Action Security
- Remover `accessToken` do client elimina risco de vazamento no browser
- Service Account permanece apenas no servidor

---

## Plano de Implementação

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/lib/auth/index.ts` | **Modificar** | Remover escopo `calendar` do OAuth Google |
| `src/lib/auth/auth.config.ts` | **Modificar** | Remover persistência de `accessToken` no JWT/session |
| `src/types/next-auth.d.ts` | **Modificar** | Remover tipo `accessToken` das definições |
| `doc/plan-18-criacao-politica-privacidade.md` | **Modificar** | Atualizar política para remover menção ao escopo calendar |

---

### Passo 1: Remover escopo `calendar` do OAuth

**Arquivo:** `src/lib/auth/index.ts`

**Antes:**
```typescript
Google({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      scope: [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/calendar",  // ← REMOVER
      ].join(" "),
    },
  },
}),
```

**Depois:**
```typescript
Google({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      scope: [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" "),
    },
  },
}),
```

---

### Passo 2: Remover persistência de `accessToken` no JWT e Session

**Arquivo:** `src/lib/auth/auth.config.ts`

**Antes:**
```typescript
jwt({ token, user, account }) {
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.name = user.name;
    token.image = user.image;
  }
  // Persist access token
  if (account?.access_token) {
    token.accessToken = account.access_token;
  }
  return token;
},
session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.email = token.email as string;
    session.user.name = token.name as string;
    session.user.image = token.image as string;
    session.user.accessToken = token.accessToken as string;  // ← REMOVER
  }
  return session;
},
```

**Depois:**
```typescript
jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.name = user.name;
    token.image = user.image;
  }
  return token;
},
session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.email = token.email as string;
    session.user.name = token.name as string;
    session.user.image = token.image as string;
  }
  return session;
},
```

---

### Passo 3: Remover tipo `accessToken` das definições TypeScript

**Arquivo:** `src/types/next-auth.d.ts`

**Antes:**
```typescript
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    image: string;
    accessToken?: string;   // ← REMOVER
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
      accessToken?: string;  // ← REMOVER
    };
  }

  interface JWT {
    id: string;
    email: string;
    name: string;
    image: string;
    accessToken?: string;   // ← REMOVER
  }
}
```

**Depois:**
```typescript
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    image: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
    name: string;
    image: string;
  }
}
```

---

### Passo 4: Atualizar Política de Privacidade

**Arquivo:** `doc/plan-18-criacao-politica-privacidade.md`

Remover/ajustar:

1. **Escopo `calendar`** da tabela de escopos OAuth — não é mais solicitado no login
2. **Adicionar nota** explicando que operações com Calendar usam Service Account (servidor), não autenticação do usuário
3. **Atualizar tabela de compartilhamento** — o app não acessa Calendar do usuário, apenas da Service Account

**Antes (na política):**
```
| `calendar` | Acesso ao Google Calendar | Criar/gerenciar eventos de reserva |
```

**Depois:**
```
> **Nota:** As operações com Google Calendar são realizadas via Service Account
> no servidor da aplicação. O login do usuário **não** solicita permissão de
> acesso ao Calendar. O usuário autentica-se apenas para identificação (nome,
> e-mail, foto).
```

---

## Checklist de Validação

- [ ] Escopo `calendar` removido do OAuth em `src/lib/auth/index.ts`
- [ ] `accessToken` removido do callback `jwt` em `auth.config.ts`
- [ ] `accessToken` removido do callback `session` em `auth.config.ts`
- [ ] Tipos `accessToken` removidos de `src/types/next-auth.d.ts`
- [ ] Política de privacidade atualizada (Plan 18)
- [ ] Login com Google funciona (nome, e-mail, foto persistem)
- [ ] Reservas continuam funcionando (Service Account inalterada)
- [ ] `session.user` não expõe `accessToken` no client
- [ ] Build passa sem erros (`npx next build`)
- [ ] TypeScript compila sem erros

---

## Impacto na Política de Privacidade (Plan 18)

Com esta mudança, a política de privacidade fica **significativamente mais simples**:

| Antes | Depois |
|---|---|
| 4 escopos OAuth (incluindo `calendar`) | 3 escopos OAuth (apenas identidade) |
| Precisa justificar acesso ao Calendar do usuário | Service Account explicada separadamente |
| Tela de consentimento mostra permissão de Calendar | Tela mostra apenas perfil básico |
| Google pode exigir revisão OAuth | Escopos básicos geralmente não exigem revisão |

---

## Riscos e Considerações

| Risco | Mitigação |
|---|---|
| Sessão existente ter `accessToken` antigo | Sessões são renovadas no próximo login — token será removido naturalmente |
| Algum código consumir `session.user.accessToken` sem estar no grep | Busca já cobriu todo o `src/` — nenhum consumo encontrado |
| Service Account parar de funcionar | Service Account é independente do OAuth — nenhuma alteração nela |
| Google rejeitar política atualizada | Nota explicativa sobre Service Account torna política mais clara |

---

## Arquivos de Referência

| Arquivo | Caminho |
|---|---|
| OAuth config | `src/lib/auth/index.ts` |
| Auth callbacks | `src/lib/auth/auth.config.ts` |
| Type definitions | `src/types/next-auth.d.ts` |
| Google Calendar client | `src/lib/google-calendar/index.ts` |
| Política de privacidade | `doc/plan-18-criacao-politica-privacidade.md` |

---

## Regras Vercel Aplicadas

| Regra | Skill | Onde Aplicada |
|---|---|---|
| Minimum Necessary Scope | Server Action Security | OAuth pede apenas identidade, não Calendar |
| Don't Store Unused Data | General | `accessToken` removido do token/session |
| Decouple State from UI | composition-patterns | Service Account separada do fluxo de autenticação |
