# Plan 22 — Service Worker Mínimo para PWA

## Contexto

O botão "Instalar Aplicativo" (Plan 21) **não aparece** porque o `beforeinstallprompt` nunca dispara. O motivo: **não existe Service Worker registrado** na aplicação.

O Edge/Chrome exige um Service Worker para permitir instalação PWA. Sem ele:
- `beforeinstallprompt` nunca dispara
- Botão de instalar nunca aparece
- Banner nativo nunca aparece
- O dev server mostra `GET /sw.js 404` no console

### Critérios do `beforeinstallprompt`

| Critério | Status |
|---|---|
| Manifest válido (`manifest.json`) | ✅ Já existe |
| HTTPS (ou localhost) | ✅ Sim |
| **Service Worker registrado** | ❌ **FALTANDO** |
| Não instalado | ✅ Sim |

---

## Princípios Aplicados (Vercel Best Practices)

### 1. Server-First Static Asset ([react-best-practices](.agents/skills/vercel-react-best-practices/))
- Service Worker é arquivo estático em `public/` — sem build, sem bundle
- Servido diretamente pelo Next.js como static file

### 2. Defer Non-Critical Third-Party ([bundle-defer-third-party](.agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md))
- Registro do SW é feito **após hidratação** via `useEffect`
- Não bloqueia renderização inicial nem interactive readiness

### 3. Hook Pattern (Consistente com projeto)
- Projeto já usa `src/hooks/` (`useClickOutside`, `useMobile`)
- Criar `useRegisterSW` hook — padrão consistente

### 4. Avoid Barrel Imports ([bundle-barrel-imports](.agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md))
- Import direto do hook — sem barrel file em `src/lib/pwa/`

---

## Plano de Implementação

### Arquivos a Criar

| Arquivo | Ação | Descrição |
|---|---|---|
| `public/sw.js` | **Criar** | Service Worker mínimo — registra sem cache agressivo |
| `src/hooks/useRegisterSW.ts` | **Criar** | Hook para registrar SW após hidratação |

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/layout.tsx` | **Modificar** | Usar hook `useRegisterSW` no layout raiz (via Client Component wrapper) |

> **Nota:** Como `layout.tsx` é Server Component, criar um wrapper client `src/app/sw-register.tsx` que usa o hook. Isso segue o padrão de **defer non-critical** — SW registra após hidratação sem bloquear render.

---

### Passo 1: Criar Service Worker mínimo (sem cache agressivo)

**Arquivo:** `public/sw.js`

Service Worker simples que:
1. Instala e ativa
2. **Não faz cache de nada** — apenas garante registro para `beforeinstallprompt`
3. Não interfere em requests de desenvolvimento
4. Fácil de evoluir para cache estratégico no futuro

```javascript
// public/sw.js
// Service Worker mínimo — necessário para PWA install prompt
// Sem cache agressivo — apenas garante registro

self.addEventListener("install", (event) => {
  // Pula etapa de waiting — ativa imediatamente
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Garante controle imediato de todos os clients
  event.waitUntil(self.clients.claim());
});

// Não intercepta requests — apenas serve como SW registrado
// Futuramente: adicionar estratégia de cache aqui conforme necessidade
self.addEventListener("fetch", (event) => {
  // Sem intervenção — browser faz request normalmente
  // Quando adicionar cache, usar: event.respondWith(...)
});
```

> **Por que sem cache?** Este SW existe apenas para satisfazer o critério de `beforeinstallprompt`. Adicionar cache agora sem análise de necessidades pode causar conteúdo stale. Quando houver necessidade de funcionamento offline, adicionar estratégia de cache incrementalmente.

---

### Passo 2: Criar hook de registro

**Arquivo:** `src/hooks/useRegisterSW.ts`

```typescript
import { useEffect } from "react";

/**
 * Hook para registrar o Service Worker da aplicação.
 * Necessário para:
 * - Prompt de instalação PWA (beforeinstallprompt)
 * - Funcionamento offline (quando cache for adicionado)
 *
 * Registro feito após hidratação (useEffect) — não bloqueia render.
 */
export function useRegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[PWA] Service Worker registrado:", registration.scope);
        }
      })
      .catch((error) => {
        console.error("[PWA] Erro ao registrar Service Worker:", error);
      });
  }, []);
}
```

---

### Passo 3: Criar wrapper client para o layout

**Arquivo:** `src/app/sw-register.tsx`

Como `layout.tsx` é Server Component, precisamos de um wrapper client para usar o hook.

```tsx
"use client";

import { useRegisterSW } from "@/hooks/useRegisterSW";

export function SWRegister() {
  useRegisterSW();
  return null;
}
```

---

### Passo 4: Adicionar no layout raiz

**Arquivo:** `src/app/layout.tsx`

Adicionar import e componente:

```tsx
import { SWRegister } from "./sw-register";

// ... dentro do body, após children
<Providers>
  <NextTopLoader color="#5750F1" showSpinner={false} />
  {children}
  <SWRegister />
</Providers>
```

Posicionar **após** `{children}` para garantir que a hidratação ocorra primeiro (defer non-critical).

---

## Como Verificar Funcionamento

### No DevTools (Edge/Chrome)

1. Abrir DevTools → **Application** → **Service Workers**
2. Deverá mostrar `sw.js` registrado com status "activated and running"
3. **Application** → **Manifest** → verificar que não há erros
4. Na barra de endereço, deve aparecer ícone de instalação (➕)

### No Console

```
[PWA] Service Worker registrado: /
```

### Para testar `beforeinstallprompt`

1. Abrir app em `localhost:3000`
2. Esperar ~30 segundos (browser delay mínimo)
3. Abrir dropdown do perfil → botão "Instalar Aplicativo" deve aparecer

---

## Checklist de Validação

- [ ] `public/sw.js` existe e é acessível via `/sw.js`
- [ ] DevTools mostra Service Worker registrado e ativo
- [ ] `beforeinstallprompt` dispara após ~30s
- [ ] Botão "Instalar Aplicativo" aparece no dropdown
- [ ] App instala corretamente ao clicar no botão
- [ ] Após instalação, botão desaparece
- [ ] Dev server não quebra com SW (sem 404 em `/sw.js`)
- [ ] SW não interfere em requests de desenvolvimento
- [ ] Build passa sem erros
- [ ] Sem erro de hidratação (SSR mismatch)

---

## Riscos e Considerações

| Risco | Mitigação |
|---|---|
| SW não registra em localhost | Deve funcionar — browsers permitem SW em localhost |
| `beforeinstallprompt` demora | Browser exige delay mínimo de 30s + interação do usuário |
| iOS Safari não suporta `beforeinstallprompt` | Botão não aparece — sem erro, graceful degradation |
| SW vazio não faz nada útil | Objetivo é apenas registro — cache pode ser adicionado depois |
| Hot reload interfere SW | SW em dev mode é inócuo (não intercepta fetch) |

---

## Arquivos de Referência

| Arquivo | Caminho |
|---|---|
| InstallPWA | `src/components/Layouts/header/user-info/install-pwa.tsx` |
| Manifest | `public/manifest.json` |
| Root layout | `src/app/layout.tsx` |
| Providers | `src/app/providers.tsx` |
| Hook existente | `src/hooks/useClickOutside.ts` (padrão) |

---

## Regras Vercel Aplicadas

| Regra | Skill | Onde Aplicada |
|---|---|---|
| Server-First Static Asset | react-best-practices | SW em `public/` — sem build |
| Defer Non-Critical Third-Party | react-best-practices | SW registra após hidratação via `useEffect` |
| Hook pattern consistente | composition-patterns | `useRegisterSW` em `src/hooks/` (mesmo padrão de `useClickOutside`) |
| Avoid Barrel Imports | react-best-practices | Import direto do hook — sem `src/lib/pwa/index.ts` |
