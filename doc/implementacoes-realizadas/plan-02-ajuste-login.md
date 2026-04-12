# Planejamento: Ajustes na Tela de Login

**Data:** 22 de março de 2026  
**Status:** ✅ IMPLEMENTADO

---

## 🐛 Problema Identificado

A tela de `/login` estava exibindo:
- ❌ Menu lateral esquerdo (Sidebar)
- ❌ Barra superior com pesquisa, alertas e usuário (Header)

Quando deveria estar:
- ✅ Apenas formulário centralizado
- ✅ Sem Sidebar
- ✅ Sem Header

---

## 🔍 Causa Raiz

**Arquivo:** `src/app/layout.tsx` (layout raiz)

O layout raiz estava aplicando Sidebar e Header para **todas** as rotas, incluindo `/login`:

```tsx
// ANTES (Problema)
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />  {/* ❌ Aparecia em todas as páginas */}
            <div className="w-full">
              <Header />  {/* ❌ Aparecia em todas as páginas */}
              <main>{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

O layout `(auth)/layout.tsx` **não funcionava** porque o layout raiz envolve primeiro.

---

## ✅ Solução Implementada

### 1. Criar Componente DashboardLayout

**Arquivo:** `src/components/Layouts/dashboard-layout.tsx`

Componente client que usa `usePathname` para verificar a rota atual e condicionalmente renderizar Sidebar/Header:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";

export function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Rotas que não devem ter Sidebar e Header
  const authRoutes = ["/login"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Se for rota de auth, renderiza apenas o children
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Caso contrário, renderiza com Sidebar e Header
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />
        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 2. Atualizar Layout Raiz

**Arquivo:** `src/app/layout.tsx`

Substituir a lógica inline pelo componente `DashboardLayout`:

```tsx
import { DashboardLayout } from "@/components/Layouts/dashboard-layout";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          <DashboardLayout>{children}</DashboardLayout>
        </Providers>
      </body>
    </html>
  );
}
```

### 3. Atualizar Texto do Login

**Arquivo:** `src/app/(auth)/login/page.tsx`

**Mudança:**
```diff
- "Use sua conta Google institucional para acessar o sistema de reservas"
+ "Use sua conta Google para acessar o sistema de reservas."
```

---

## 📁 Arquivos Modificados/Criados

### Criados:
- `src/components/Layouts/dashboard-layout.tsx` - Wrapper condicional

### Modificados:
- `src/app/layout.tsx` - Usa DashboardLayout
- `src/app/(auth)/login/page.tsx` - Texto atualizado

---

## ✅ Critérios de Aceite

- [x] `/login` aparece sem Sidebar
- [x] `/login` aparece sem Header
- [x] `/login` aparece centralizada na tela
- [x] Texto atualizado para "Use sua conta Google para acessar o sistema de reservas."
- [x] Demais páginas mantêm Sidebar e Header normalmente
- [x] Build testado e validado

---

## 🧪 Instruções de Teste

### 1. Reiniciar servidor

```bash
# Parar servidor atual (Ctrl+C)
npm run dev
```

### 2. Limpar cache do navegador

- Chrome: `Ctrl+Shift+Delete` ou usar aba anônima
- Firefox: `Ctrl+Shift+Delete`
- Ou simplesmente recarregar com `Ctrl+F5`

### 3. Acessar tela de login

- URL: `http://localhost:3000/login`
- **Deve ver:**
  - ✅ Logo centralizado
  - ✅ Botão "Entrar com Google"
  - ✅ Texto: "Use sua conta Google para acessar o sistema de reservas."
  - ❌ Sem menu lateral
  - ❌ Sem barra superior

### 4. Testar outras rotas

- `/reserva` - Deve ter Sidebar e Header normais
- `/minhas-reservas` - Deve ter Sidebar e Header normais
- `/agenda-geral` - Deve ter Sidebar e Header normais

---

## 🎯 Resultado Final

### Antes:
```
┌─────────────────────────────────────────┐
│ Header (pesquisa, alertas, usuário)    │
├─────────┬───────────────────────────────┤
│ Sidebar │                               │
│         │   Formulário de Login         │
│         │   (centralizado, mas com      │
│         │    sidebar e header)          │
│         │                               │
└─────────┴───────────────────────────────┘
```

### Depois:
```
┌─────────────────────────────────────────┐
│                                         │
│         Formulário de Login             │
│         (centralizado, limpo)           │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📝 Notas Técnicas

### Por que Client Component?

O `usePathname` do Next.js só funciona em **Client Components**. Por isso o `DashboardLayout` tem a diretiva `"use client"`.

### Route Groups

O uso de `(auth)` e `(dashboard)` como route groups ajuda a organizar, mas **não resolve** o problema porque o layout raiz (`src/app/layout.tsx`) ainda envolve tudo.

### Alternativa Não Usada

Poderíamos ter movido `/login` para dentro de `(auth)` e criado um `layout.tsx` específico lá, mas a solução com componente condicional é mais:
- ✅ Explícita
- ✅ Fácil de manter
- ✅ Escalável (basta adicionar rotas ao array `authRoutes`)

---

## 🚀 Próximos Passos (Opcional)

Se quiser expandir a solução:

1. **Adicionar mais rotas de auth:**
   ```tsx
   const authRoutes = ["/login", "/registro", "/recuperar-senha"];
   ```

2. **Criar layout específico para dashboard:**
   ```tsx
   const dashboardRoutes = ["/reserva", "/minhas-reservas", "/agenda-geral"];
   ```

3. **Adicionar transições:**
   ```tsx
   <Transition>
     {isAuthRoute ? children : <FullLayout />}
   </Transition>
   ```

---

**Implementação concluída com sucesso! ✅**
