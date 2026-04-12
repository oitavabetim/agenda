# Plano de Revisão de Arquitetura: React + Next.js

## Objetivo

Realizar uma revisão completa da arquitetura da aplicação **Oitava Igreja Agenda** (Next.js 16 + React 19 + TypeScript), aplicando as melhores práticas da **Vercel Engineering** para React, Next.js e padrões de composição.

## Referências Base

- **Vercel React Best Practices** (v1.0.0, Jan 2026)
- **Vercel Composition Patterns** (v1.0.0, Jan 2026)
- **Next.js App Router Documentation**
- **React 19 Documentation**

---

## Fase 1: Estrutura de Diretórios e Organização

### 1.1 Convenções de Nomenclatura de Arquivos

**Regras Next.js App Router**:

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Páginas | `page.tsx` | `app/reserva/page.tsx` |
| Layouts | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Loading | `loading.tsx` | `app/(dashboard)/loading.tsx` |
| Error | `error.tsx` | `app/(dashboard)/error.tsx` |
| Not Found | `not-found.tsx` | `app/(dashboard)/not-found.tsx` |
| Route Handlers | `route.ts` | `app/api/auth/route.ts` |
| Componentes | **PascalCase** | `ReservaForm.tsx` |
| Hooks | camelCase com prefixo `use` | `useReserva.ts` |
| Utilitários | **kebab-case** | `format-phone.ts` |
| Configurações | camelCase | `espacos.ts` |
| Tipos | camelCase | `reserva.ts` |

**Regras de Pastas**:
- ✅ Pastas de rota: **kebab-case** (`minhas-reservas/`) ou **route groups** (`(dashboard)/`)
- ✅ Componentes privados de rota: `_components/`
- ✅ Componentes compartilhados: `src/components/`
- ❌ Evitar: `reserva-form.tsx` (deveria ser `ReservaForm.tsx`)

### 1.2 Co-localização de Componentes

**Princípio**: Manter componentes próximos das rotas que os utilizam.

**Antes** (componentes distantes):
```
src/
├── app/(dashboard)/reserva/page.tsx
└── components/reserva/
    ├── reserva-form.tsx
    ├── espacos-selector.tsx
    └── mapa-igreja.tsx
```

**Depois** (co-localizados):
```
src/
└── app/(dashboard)/reserva/
    ├── page.tsx
    └── _components/
        ├── ReservaForm.tsx
        ├── EspacosSelector.tsx
        └── MapaIgreja.tsx
```

**Exceções** (manter em `src/components/`):
- Componentes reutilizados em múltiplas rotas
- Componentes UI genéricos (botões, inputs, modais, dropdowns)
- Componentes de layout global (header, sidebar)

### 1.3 Evitar Barrel File Imports

**Impacto: CRÍTICO** (200-800ms de custo de importação)

**Regra Vercel 2.1**: Não importar de barrel files (`index.ts` que re-exporta múltiplos módulos).

**Incorreto**:
```tsx
// Carrega todos os ícones, mesmo usando apenas 3
import { CalendarIcon, UserIcon, SettingsIcon } from "@/components/icons";
```

**Correto**:
```tsx
// Importa diretamente do arquivo fonte
import { CalendarIcon } from "@/components/icons/calendar-icon";
import { UserIcon } from "@/components/icons/user-icon";
```

**Configuração Next.js 13.5+** (recomendado):
```typescript
// next.config.mjs
export default {
  optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
};
```

**Checklist**:
- [ ] Identificar barrel files em `src/components/`, `src/lib/`, `src/types/`
- [ ] Migrar imports para caminhos diretos
- [ ] Configurar `optimizePackageImports` no `next.config.mjs`
- [ ] Verificar imports de bibliotecas externas (`lucide-react`, `@radix-ui`, `date-fns`)

---

## Fase 2: Padrões de Composição React

### 2.1 Evitar Proliferação de Props Booleanas

**Impacto: CRÍTICO** (previne componentes impossíveis de manter)

**Regra Vercel Composition 1.1**: Não adicionar props booleanas como `isEditing`, `isRecurrent`, `showMap` para customizar comportamento.

**Incorreto**:
```tsx
function ReservaForm({
  isEditing,
  isRecurrent,
  showMap,
  showEspacos,
}: Props) {
  return (
    <form>
      {isRecurrent && <RecorrenciaFields />}
      {showMap && <MapaIgreja />}
      {showEspacos && <EspacosSelector />}
      {isEditing ? <EditActions /> : <DefaultActions />}
    </form>
  );
}
```

**Correto - Variantes Explícitas**:
```tsx
// Variante: Nova reserva
function NovaReservaForm() {
  return (
    <ReservaForm.Frame>
      <ReservaForm.Programacao />
      <ReservaForm.DataHorario />
      <ReservaForm.Espacos />
      <ReservaForm.Footer>
        <ReservaForm.Cancel />
        <ReservaForm.Submit />
      </ReservaForm.Footer>
    </ReservaForm.Frame>
  );
}

// Variante: Reserva recorrente
function ReservaRecorrenteForm() {
  return (
    <ReservaForm.Frame>
      <ReservaForm.Programacao />
      <ReservaForm.DataHorario />
      <ReservaForm.Recorrencia />
      <ReservaForm.Espacos />
      <ReservaForm.Footer>
        <ReservaForm.Cancel />
        <ReservaForm.Submit />
      </ReservaForm.Footer>
    </ReservaForm.Frame>
  );
}
```

**Checklist**:
- [ ] Identificar componentes com mais de 3 props booleanas
- [ ] Refatorar para variantes explícitas ou compound components
- [ ] Eliminar condicionais aninhados no JSX

### 2.2 Usar Compound Components com Contexto Compartilhado

**Impacto: ALTO** (permite composição flexível sem prop drilling)

**Regra Vercel Composition 1.2**: Estruturar componentes complexos como compound components com contexto compartilhado.

**Padrão Recomendado**:
```tsx
// Contexto genérico com 3 partes: state, actions, meta
interface ReservaFormContextValue {
  state: ReservaFormState;
  actions: ReservaFormActions;
  meta: ReservaFormMeta;
}

const ReservaFormContext = createContext<ReservaFormContextValue | null>(null);

// Provider isola gerenciamento de estado
function ReservaFormProvider({ children, initialValues }: Props) {
  const form = useForm({ /* ... */ });
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ReservaFormContext value={{
      state: { ...form.watch(), isSubmitting },
      actions: { submit: form.handleSubmit, reset: form.reset },
      meta: { form },
    }}>
      {children}
    </ReservaFormContext>
  );
}

// Subcomponentes acessam via contexto, não props
function ReservaFormEspacos() {
  const { state, actions } = use(ReservaFormContext);
  return <EspacosSelector selected={state.espacos} onChange={...} />;
}

// Export como compound component
const ReservaForm = {
  Provider: ReservaFormProvider,
  Frame: ReservaFormFrame,
  Programacao: ReservaFormProgramacao,
  DataHorario: ReservaFormDataHorario,
  Recorrencia: ReservaFormRecorrencia,
  Espacos: ReservaFormEspacos,
  Footer: ReservaFormFooter,
  Cancel: ReservaFormCancel,
  Submit: ReservaFormSubmit,
};
```

**Uso**:
```tsx
<ReservaForm.Provider initialValues={...}>
  <ReservaForm.Frame>
    <ReservaForm.Programacao />
    <ReservaForm.Espacos />
    <ReservaForm.Footer>
      <ReservaForm.Submit />
    </ReservaForm.Footer>
  </ReservaForm.Frame>
</ReservaForm.Provider>
```

**Checklist**:
- [ ] Identificar componentes monolíticos (>150 linhas)
- [ ] Refatorar para compound components
- [ ] Definir interfaces genéricas de contexto (state, actions, meta)
- [ ] Usar `use()` do React 19 ao invés de `useContext()`

### 2.3 Desacoplar Gerenciamento de Estado da UI

**Impacto: MÉDIO** (permite trocar implementação de estado sem mudar UI)

**Regra Vercel Composition 2.1**: O provider deve ser o único lugar que sabe como o estado é gerenciado.

**Incorreto** (UI acoplada ao estado):
```tsx
function ReservaForm() {
  // Componente UI sabe sobre react-hook-form
  const form = useForm<ReservaFormData>({ /* ... */ });
  const espacos = watch("espacos");

  return <form>{/* ... */}</form>;
}
```

**Correto** (estado isolado no provider):
```tsx
// Provider gerencia estado
function ReservaFormProvider({ children }: Props) {
  const form = useForm<ReservaFormData>({ /* ... */ });
  return (
    <ReservaFormContext value={{ state: form.watch(), actions: { submit: form.handleSubmit }, meta: { form } }}>
      {children}
    </ReservaFormContext>
  );
}

// UI só conhece a interface do contexto
function ReservaFormUI() {
  return (
    <ReservaForm.Frame>
      <ReservaForm.Programacao />
      <ReservaForm.Espacos />
    </ReservaForm.Frame>
  );
}
```

---

## Fase 3: Padrões Next.js e Performance

### 3.1 Eliminar Waterfalls

**Impacto: CRÍTICO** (2-10× melhoria)

**Regra Vercel 1.4-1.5**: Iniciar operações independentes imediatamente, mesmo sem await.

**Incorreto** (waterfall):
```tsx
export default async function ReservaPage() {
  const tenant = await getCurrentTenant(); // Espera tenant
  const espacos = await getEspacos(tenant.id); // Espera espacos
  const reservas = await getReservas(tenant.id); // Espera reservas

  return <ReservaForm espacos={espacos} reservas={reservas} />;
}
```

**Correto** (paralelo):
```tsx
export default async function ReservaPage() {
  const tenantPromise = getCurrentTenant();
  const espacosPromise = tenantPromise.then(t => getEspacos(t.id));
  const reservasPromise = tenantPromise.then(t => getReservas(t.id));

  const [tenant, espacos, reservas] = await Promise.all([
    tenantPromise,
    espacosPromise,
    reservasPromise,
  ]);

  return <ReservaForm espacos={espacos} reservas={reservas} />;
}
```

**Checklist**:
- [ ] Identificar awaits sequenciais desnecessários
- [ ] Paralelizar operações independentes com `Promise.all()`
- [ ] Usar `better-all` para dependências parciais
- [ ] Mover awaits para dentro dos branches onde são usados

### 3.2 Strategic Suspense Boundaries

**Impacto: ALTO** (pintura inicial mais rápida)

**Regra Vercel 1.6**: Usar Suspense para mostrar wrapper UI mais rápido enquanto dados carregam.

**Incorreto** (bloqueia tudo):
```tsx
async function ReservaPage() {
  const espacos = await getEspacos(); // Bloqueia página inteira

  return (
    <div>
      <Header />
      <ReservaForm espacos={espacos} />
      <Footer />
    </div>
  );
}
```

**Correto** (streaming):
```tsx
function ReservaPage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<FormSkeleton />}>
        <ReservaForm />
      </Suspense>
      <Footer />
    </div>
  );
}

async function ReservaForm() {
  const espacos = await getEspacos(); // Só bloqueia este componente
  return <form>{/* ... */}</form>;
}
```

**Checklist**:
- [ ] Adicionar `loading.tsx` em rotas principais
- [ ] Usar Suspense para dados não-críticos
- [ ] Compartilhar promises entre componentes com `use()`
- [ ] Evitar Suspense para dados SEO-críticos acima da dobra

### 3.3 Server Components por Padrão

**Regra**: Server Components por padrão, Client Components apenas quando necessário.

**Checklist**:
- [ ] Identificar `"use client"` desnecessário
- [ ] Mover fetch de dados para Server Components
- [ ] Manter apenas interatividade em Client Components
- [ ] Usar Server Actions para mutations

### 3.4 Autenticar Server Actions como API Routes

**Impacto: CRÍTICO** (previne acesso não autorizado)

**Regra Vercel 3.1**: Server Actions são endpoints públicos. Sempre verificar autenticação e autorização **dentro** de cada Server Action.

**Incorreto**:
```tsx
"use server";

export async function criarReserva(data: ReservaData) {
  // Sem verificação de auth!
  await db.reserva.create({ data });
}
```

**Correto**:
```tsx
"use server";

import { auth } from "@/lib/auth";

export async function criarReserva(data: ReservaData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  // Validar input
  const validated = reservaSchema.parse(data);

  // Autorizar
  if (!canCreateReserva(session.user)) {
    throw new Error("Não autorizado");
  }

  await db.reserva.create({ data: validated });
}
```

**Checklist**:
- [ ] Verificar auth em todas as Server Actions
- [ ] Validar inputs com Zod antes de processar
- [ ] Verificar autorização (não apenas autenticação)
- [ ] Não confiar apenas em middleware ou guards de layout

### 3.5 Otimização de Bundle Size

**Regra Vercel 2.3-2.4**: Deferir bibliotecas não-críticas e usar dynamic imports.

**Checklist**:
- [ ] Usar `next/dynamic` para componentes pesados (editores, gráficos)
- [ ] Carregar analytics/logging após hidratação
- [ ] Preload baseado em intent do usuário (hover/focus)
- [ ] Verificar bundle size com `@next/bundle-analyzer`

### 3.6 React 19 APIs

**Regra Vercel Composition 4.1**: Usar APIs do React 19.

**Mudanças**:
- ✅ `ref` é prop normal (não precisa `forwardRef`)
- ✅ `use()` ao invés de `useContext()`
- ✅ `use()` pode ser chamado condicionalmente

**Incorreto** (React 18):
```tsx
const value = useContext(MyContext);
const Component = forwardRef((props, ref) => { ... });
```

**Correto** (React 19):
```tsx
const value = use(MyContext);
function Component({ ref, ...props }: Props) { ... }
```

---

## Fase 4: Padrões de Código TypeScript

### 4.1 Tipagem Estrita

**Checklist**:
- [ ] Verificar `strict: true` no `tsconfig.json`
- [ ] Eliminar usos de `any`
- [ ] Usar tipos explícitos para props e estado
- [ ] Preferir `interface` para objetos, `type` para uniões

### 4.2 Organização de Tipos

```
src/
├── types/
│   ├── index.ts          # Re-exports
│   ├── reserva.ts
│   └── usuario.ts
└── lib/
    └── validation/
        └── reserva.ts    # Schemas Zod
```

---

## Fase 5: Otimizações de Re-render

### 5.1 Regras de Re-render (Vercel 5.x)

**Checklist**:
- [ ] Não definir componentes dentro de componentes (Regra 5.4)
- [ ] Calcular estado derivado durante renderização (Regra 5.1)
- [ ] Usar `useMemo` apenas para cálculos caros (Regra 5.3)
- [ ] Estreitar dependências de efeitos (Regra 5.7)
- [ ] Usar `useRef` para valores transitórios (Regra 5.15)
- [ ] Usar `useTransition` para updates não-urgentes (Regra 5.13)

### 5.2 Evitar Re-renders Desnecessários

**Incorreto**:
```tsx
function ReservaCard({ reserva }) {
  // Componente definido dentro de componente = re-criado a cada render
  function formatDate(date) { ... }

  return <div>{formatDate(reserva.data)}</div>;
}
```

**Correto**:
```tsx
// Função utilitária fora do componente
function formatDate(date: Date) { ... }

function ReservaCard({ reserva }) {
  return <div>{formatDate(reserva.data)}</div>;
}
```

---

## Fase 6: Acessibilidade e Boas Práticas

### 6.1 Acessibilidade (a11y)

**Checklist**:
- [ ] `alt` em todas as imagens
- [ ] `aria-label` em botões sem texto
- [ ] `aria-expanded` em accordions/dropdowns
- [ ] Navegação por teclado funcional
- [ ] Contraste de cores adequado
- [ ] `role` onde apropriado

### 6.2 Segurança

**Checklist**:
- [ ] Dados sensíveis não expostos no client
- [ ] Validação de inputs no servidor (Zod)
- [ ] Rotas protegidas com autenticação
- [ ] Sanitização de dados antes de renderizar

---

## Cronograma Sugerido

| Fase | Duração | Prioridade | Impacto |
|------|---------|------------|---------|
| Fase 1: Estrutura e Barrel Files | 2-3 dias | 🔴 CRÍTICA | 200-800ms boot time |
| Fase 2: Composição React | 3-4 dias | 🔴 CRÍTICA | Manutenibilidade |
| Fase 3: Next.js Performance | 3-4 dias | 🔴 CRÍTICA | 2-10× faster |
| Fase 4: TypeScript | 1-2 dias | 🟡 MÉDIA | Type safety |
| Fase 5: Re-renders | 2-3 dias | 🟡 MÉDIA | UX fluida |
| Fase 6: A11y e Segurança | 2-3 dias | 🟢 BAIXA | Compliance |

**Total estimado**: 13-19 dias

---

## Métricas de Sucesso

Após a revisão:

1. **Performance**:
   - ✅ Lighthouse Performance > 90
   - ✅ TTI < 3s
   - ✅ Bundle size reduzido em 20%+
   - ✅ Zero waterfalls desnecessários

2. **Código**:
   - ✅ Zero `any` no TypeScript
   - ✅ Server Components por padrão
   - ✅ Zero barrel file imports
   - ✅ Componentes < 200 linhas
   - ✅ Zero props booleanas proliferadas

3. **Arquitetura**:
   - ✅ Compound components onde apropriado
   - ✅ Estado desacoplado da UI
   - ✅ Co-localização correta
   - ✅ Nomenclatura padronizada

4. **Segurança**:
   - ✅ Auth em todas as Server Actions
   - ✅ Validação de inputs no servidor
   - ✅ Lighthouse a11y > 90

---

## Referências

- **Vercel React Best Practices**: `.agents/skills/vercel-react-best-practices/AGENTS.md`
- **Vercel Composition Patterns**: `.agents/skills/vercel-composition-patterns/AGENTS.md`
- **Next.js Docs**: https://nextjs.org/docs
- **React 19 Docs**: https://react.dev

---

**Data de criação**: 2026-04-02  
**Status**: Pendente de aprovação  
**Responsável**: Equipe de Desenvolvimento
