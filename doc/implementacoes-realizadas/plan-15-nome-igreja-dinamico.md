# Plano 15: Nome Dinâmico da Igreja

## 📋 Análise do Problema

### Contexto

O nome da igreja está **hardcoded** em vários componentes da aplicação. Com o sistema multi-tenant, cada igreja deve ver seu próprio nome.

### Evidências do Código

#### 1. **Header (título da página)**
```tsx
// src/components/Layouts/header/index.tsx:25
<h1 className="...">
  Oitava Igreja Agenda
</h1>
<p className="...">Sistema de Reserva de Espaços</p>
```

#### 2. **Metadata (SEO e título do navegador)**
```tsx
// src/app/layout.tsx:14-15
export const metadata: Metadata = {
  title: {
    template: "%s | Oitava Igreja Agenda",
    default: "Oitava Igreja Agenda",
  },
  description: "Sistema de Reserva de Espaços da Igreja",
};
```

#### 3. **Logo (alt text)**
```tsx
// src/components/Logo.tsx:12,21
<Image alt="Oitava Igreja Agenda" ... />
```

#### 4. **Manifest (PWA)**
```json
// public/manifest.json
{
  "name": "Oitava Igreja Agenda - Reserva de Espaços",
  "short_name": "Oitava Agenda"
}
```

---

## 🔍 Impacto

### Problema
Todas as igrejas veem "Oitava Igreja Agenda" no:
- Header do dashboard
- Título do navegador (SEO)
- Alt text das imagens
- Nome do app PWA

### Solução
Usar `tenant.name` da configuração do tenant atual para tornar dinâmico.

---

## 📐 Arquitetura Proposta

### Abordagem

| Local | Tipo | Solução |
|-------|------|---------|
| **Header** | Client Component | Obter via `useTenant()` hook (React 19 `use()`) |
| **Metadata** | Server (layout.tsx) | Função `generateMetadata()` com `getCurrentTenant()` |
| **Logo alt** | Client Component | Obter via `useTenant()` hook |
| **Manifest** | Estático | Manter genérico (MVP) |

### Regras Vercel Aplicadas

- ✅ `server-serialization` — Passar apenas `{ id, name }` (campos mínimos), não `TenantConfig` inteiro
- ✅ `state-decouple-implementation` — Componentes não sabem de onde vem o nome
- ✅ `state-lift-state` — Provider global no `DashboardLayout`, não no form
- ✅ `react19-no-forwardref` — Usar `use()` do React 19 em vez de `useContext()`
- ✅ `rendering-hydration-suppress-warning` — Garantir consistência server/client

---

## 🎯 Plano de Implementação

### Fase 1: TenantProvider Global ✅ Prioridade Alta

> **Por que global?** O nome da igreja aparece em TODAS as páginas do dashboard, não apenas no formulário de reserva. O provider deve envolver toda a aplicação.

#### 1.1 Criar hook `useTenant()` global (React 19)

**Arquivo:** `src/lib/tenant/use-tenant.ts`

```typescript
"use client";

import { createContext, use } from "react";  // ← React 19: use() em vez de useContext()

// Interface mínima para o contexto (Vercel: server-serialization)
// Não expor googleClientSecret, espacos, etc. para client components
interface TenantContextValue {
  id: string;
  name: string;
}

const TenantContext = createContext<TenantContextValue | null>(null);

// Provider global — envolve TODO o dashboard (Vercel: state-lift-state)
interface TenantProviderProps {
  children: React.ReactNode;
  tenant: TenantContextValue;
}

export function TenantProvider({ children, tenant }: TenantProviderProps) {
  return (
    <TenantContext value={tenant}>
      {children}
    </TenantContext>
  );
}

// Hook com React 19 use() (Vercel: react19-no-forwardref)
export function useTenant(): TenantContextValue {
  const context = use(TenantContext);
  if (!context) {
    // Fallback quando tenant não configurado (Vercel: graceful degradation)
    return {
      id: "default",
      name: "Sistema de Reservas",
    };
  }
  return context;
}
```

> **Nota:** Interface `TenantContextValue` contém apenas `{ id, name }`. Não expor `TenantConfig` inteiro (com `googleClientSecret`, `espacos`, etc.) para client components. Isso segue Vercel: `server-serialization`.

#### 1.2 Adicionar TenantProvider no DashboardLayout

**Arquivo:** `src/components/Layouts/DashboardLayout.tsx` (ou `src/app/(dashboard)/layout.tsx`)

```tsx
import { TenantProvider } from "@/lib/tenant/use-tenant";
import { getCurrentTenant } from "@/lib/tenant/config";

// Server Component — obtém tenant uma única vez
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obter tenant no servidor (Vercel: server component by default)
  const tenant = getCurrentTenant();

  // Filtrar apenas campos necessários (Vercel: server-serialization)
  const tenantSafe = {
    id: tenant.id,
    name: tenant.name || "Sistema de Reservas", // Fallback se vazio
  };

  return (
    <TenantProvider tenant={tenantSafe}>
      {/* ... resto do layout (sidebar, header, etc.) */}
      {children}
    </TenantProvider>
  );
}
```

> **Nota:** O tenant é obtido **uma única vez** no server e passado via provider. Isso garante consistência entre server e client, evitando hydration mismatch (Vercel: `rendering-hydration-suppress-warning`).

---

### Fase 2: Header Dinâmico ✅ Prioridade Alta

#### 2.1 Atualizar `Header.tsx`

**Arquivo:** `src/components/Layouts/header/index.tsx`

```tsx
// ANTES (hardcoded):
<h1 className="...">Oitava Igreja Agenda</h1>

// DEPOIS (dinâmico com React 19):
"use client";

import { useTenant } from "@/lib/tenant/use-tenant";
// ...

export function Header() {
  const { name } = useTenant();  // ← React 19: use() internamente

  return (
    <header className="...">
      {/* ... */}
      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
          {name}
        </h1>
        <p className="font-medium">Sistema de Reserva de Espaços</p>
      </div>
      {/* ... */}
    </header>
  );
}
```

---

### Fase 3: Metadata Dinâmica ✅ Prioridade Alta

#### 3.1 Atualizar `layout.tsx`

**Arquivo:** `src/app/layout.tsx`

```tsx
// ANTES (estático):
export const metadata: Metadata = {
  title: {
    template: "%s | Oitava Igreja Agenda",
    default: "Oitava Igreja Agenda",
  },
};

// DEPOIS (dinâmico com generateMetadata):
import { getCurrentTenant } from "@/lib/tenant/config";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = getCurrentTenant();
  const name = tenant.name || "Sistema de Reservas"; // Fallback

  return {
    title: {
      template: `%s | ${name}`,
      default: name,
    },
    description: `Sistema de Reserva de Espaços - ${name}`,
  };
}
```

> **Nota:** `generateMetadata()` é executado no servidor. O nome é obtido **uma única vez** e usado para gerar metadata. Isso garante consistência com o client (Vercel: `rendering-hydration-suppress-warning`).

---

### Fase 4: Logo Alt Text Dinâmico ✅ Prioridade Média

#### 4.1 Atualizar `Logo.tsx`

**Arquivo:** `src/components/Logo.tsx`

```tsx
// ANTES (hardcoded):
<Image alt="Oitava Igreja Agenda" ... />

// DEPOIS (dinâmico com React 19):
"use client";

import { useTenant } from "@/lib/tenant/use-tenant";
import mainLogo from "@/assets/logos/main.png";
import darkLogo from "@/assets/logos/dark.png";
import Image from "next/image";

export function Logo() {
  const { name } = useTenant();  // ← Mesmo hook global

  return (
    <div className="relative h-[50px] w-[50px]">
      <Image
        src={mainLogo}
        fill
        className="dark:hidden"
        alt={name}  // ← Dinâmico
        role="presentation"
        quality={100}
      />
      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt={name}  // ← Dinâmico
        role="presentation"
        quality={100}
      />
    </div>
  );
}
```

> **Nota:** O mesmo hook `useTenant()` é reutilizado. Não precisamos de múltiplos providers ou hooks. Isso segue Vercel: `state-decouple-implementation`.

---

### Fase 5: Manifest Dinâmico (Opcional) ✅ Prioridade Baixa

#### 5.1 Opção A: Manter genérico (Recomendado para MVP)

```json
{
  "name": "Sistema de Reserva de Espaços",
  "short_name": "Reserva",
  "description": "Sistema de reserva para sua igreja"
}
```

#### 5.2 Opção B: Route Handler dinâmico

```typescript
// src/app/manifest.json/route.ts
import { getCurrentTenant } from "@/lib/tenant/config";
import { NextResponse } from "next/server";

export async function GET() {
  const tenant = getCurrentTenant();
  const name = tenant.name || "Sistema de Reservas";

  return NextResponse.json({
    name: `${name} - Reserva de Espaços`,
    short_name: name.split(" ")[0],
    description: `Sistema de Reserva de Espaços - ${name}`,
    // ... resto do manifest
  });
}
```

> **Recomendação:** Opção A (genérico) para MVP. Opção B para produção quando cada igreja tiver seu próprio domínio/subdomínio.

---

## 🔄 Roteiro de Migração

### Estado Atual (ANTES)
```
Header: "Oitava Igreja Agenda" (hardcoded)
Metadata: "Oitava Igreja Agenda" (estático)
Logo alt: "Oitava Igreja Agenda" (hardcoded)
Manifest: "Oitava Igreja Agenda" (estático)

Problema: Todas as igrejas veem o mesmo nome
```

### Estado Proposto (DEPOIS)
```
Header: {tenant.name} (dinâmico via useTenant())
Metadata: {tenant.name} (dinâmico via generateMetadata())
Logo alt: {tenant.name} (dinâmico via useTenant())
Manifest: Genérico ou dinâmico via route handler

Vantagem: Cada igreja vê seu próprio nome
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Hardcoded) | Depois (Dinâmico) |
|---------|-------------------|-------------------|
| **Header** | "Oitava Igreja Agenda" | `{tenant.name}` via `useTenant()` |
| **Metadata** | Estático | `generateMetadata()` no servidor |
| **Logo alt** | "Oitava Igreja Agenda" | `{tenant.name}` via `useTenant()` |
| **Manifest** | Estático | Genérico ou route handler |
| **Provider** | Nenhum | `TenantProvider` global no `DashboardLayout` |
| **React API** | N/A | `use()` do React 19 (não `useContext()`) |
| **Serialização** | N/A | Apenas `{ id, name }` (não `TenantConfig` inteiro) |
| **Manutenção** | Alterar código para mudar nome | Apenas config do tenant |

---

## 🔍 Revisão Vercel Best Practices

Esta seção documenta as correções aplicadas com base nas skills Vercel:

### ✅ Correções Aplicadas

| Regra Vercel | Problema no Plano Original | Correção |
|--------------|---------------------------|----------|
| `react19-no-forwardref` | Usava `useContext()` | Usar `use()` do React 19 |
| `state-lift-state` | Provider no form | Provider global no `DashboardLayout` |
| `server-serialization` | Passar `TenantConfig` inteiro | Passar apenas `{ id, name }` |
| `state-decouple-implementation` | Múltiplos providers/hooks | Um único `useTenant()` reutilizado |
| `rendering-hydration-suppress-warning` | Risco de mismatch | Tenant obtido uma vez no server |

### 📚 Referências Vercel

- [React 19: No forwardRef](https://vercel.com/guides/react-composition-patterns#react19-apis)
- [Lift State](https://vercel.com/guides/react-composition-patterns#state-lift-state)
- [Minimize RSC Serialization](https://vercel.com/guides/react-best-practices#server-serialization)
- [Hydration Warning Suppression](https://vercel.com/guides/react-best-practices#rendering-hydration-suppress-warning)

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| `useTenant()` fora do Provider | Erro em runtime | Fallback embutido no hook: `{ name: "Sistema de Reservas" }` |
| Hydration mismatch (server vs client) | Warning no console | Tenant obtido **uma vez** no server, passado via provider |
| Metadata não atualiza em produção | SEO incorreto | Testar `generateMetadata()` em build |
| Tenant não configurado | Nome vazio | Fallback: `tenant.name \|\| "Sistema de Reservas"` |
| Serializar `TenantConfig` inteiro | Vazar secrets no client | Passar apenas `{ id, name }` (filtrar no server) |

---

## 🎯 Critérios de Aceite

- [ ] Header exibe nome do tenant atual (via `useTenant()`)
- [ ] Título do navegador mostra nome do tenant (via `generateMetadata()`)
- [ ] Logo alt text usa nome do tenant
- [ ] Manifest genérico ou dinâmico
- [ ] Build passa sem erros
- [ ] Hydration sem warnings
- [ ] Fallback funciona quando tenant não configurado
- [ ] Nenhum `TenantConfig` inteiro serializado para client (apenas `{ id, name }`)
- [ ] `use()` do React 19 usado (não `useContext()`)

---

## 📝 Próximos Passos

1. **Validar esta análise** com o time
2. **Executar Fase 1** (Criar `useTenant()` hook + `TenantProvider` global)
3. **Executar Fase 2** (Header dinâmico)
4. **Executar Fase 3** (Metadata dinâmica via `generateMetadata()`)
5. **Executar Fase 4** (Logo alt dinâmico)
6. **Executar Fase 5** (Manifest - opcional)
7. **Testar build** e validar hydration
8. **Verificar** que nenhum `TenantConfig` inteiro é serializado para client

---

**Criado em:** 9 de abril de 2026
**Revisado em:** 9 de abril de 2026 (com Vercel Best Practices)
**Status:** Aguardando aprovação
**Prioridade:** Alta (identidade visual por tenant)
**Estimativa:** 1-2 horas de implementação
