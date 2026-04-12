# Plano 14: Revisão do Multi-Tenant - Configuração Dinâmica de Espaços

## 📋 Análise do Problema

### Contexto Atual

O sistema foi projetado com suporte **multi-tenant** para hospedar diferentes igrejas/unidades. Porém, a implementação atual tem uma limitação crítica:

**Problema:** A lista de espaços é **HARDCODED** no código, não sendo configurável por tenant.

### Evidências do Código

#### 1. **Lista fixa em `src/config/espacos.ts`**

```typescript
export const ESPACOS: Espaco[] = [
  { id: "templo", nome: "Templo", descricao: "...", capacidade: null },
  { id: "salao-social", nome: "Salão Social", descricao: "...", capacidade: null },
  { id: "sala-a", nome: "Sala A", capacidade: 15 },
  { id: "sala-b", nome: "Sala B", capacidade: 15 },
  { id: "sala-01", nome: "Sala 01", capacidade: 35 },
  // ... mais 7 salas
];
```

**Problema:** Esta lista é **global e fixa**. Se uma igreja diferente tem apenas "Templo + 2 Salas", não há como configurar.

#### 2. **Calendar IDs hardcoded por espaço**

```typescript
// src/config/espacos.ts
function getCalendarIdByEspacoId(espacoId: string, tenantId: string) {
  const calendarIds: Record<string, Record<string, string>> = {
    "oitava-agenda": {
      templo: process.env.CALENDAR_ID_TEMPLO || "",
      "salao-social": process.env.CALENDAR_ID_SALAO_SOCIAL || "",
      "sala-a": process.env.CALENDAR_ID_SALA_A || "",
      // ... mais 7 salas
    },
  };
  return calendarIds[tenantId]?.[espacoId];
}
```

**Problema:** Cada espaço precisa de uma variável de ambiente específica. Para adicionar/remover espaços, precisa alterar código.

#### 3. **Tenant config referencia espaços fixos**

```typescript
// src/lib/tenant/config.ts
export const TENANTS: Record<string, Omit<TenantConfig, "calendarIds">> = {
  "oitava-agenda": {
    id: "oitava-agenda",
    name: "Oitava Igreja Betim",
    espacos: [
      "templo", "salao-social", "sala-a", "sala-b",
      "sala-01", "sala-02", "sala-03", "sala-04",
      "sala-05", "sala-07", "sala-apoio"
    ],
  },
};
```

**Problema:** A lista de espaços do tenant é apenas um array de strings que referencia IDs fixos. Não define os espaços em si.

#### 4. **EspacosSelector usa lista global**

```typescript
// src/app/(dashboard)/reserva/_components/EspacosSelector.tsx
import { ESPACOS } from "@/config/espacos";  // ← Lista GLOBAL e FIXA

export function EspacosSelector({ selectedEspacos, onChange }) {
  return (
    <div>
      {ESPACOS.map((espaco) => (  // ← Itera lista FIXA
        <button key={espaco.id}>{espaco.nome}</button>
      ))}
    </div>
  );
}
```

**Problema:** O componente de seleção de espaços **não conhece o tenant atual**, exibe TODOS os espaços da lista global.

---

## 🔍 Impacto da Arquitetura Atual

### Cenário: Nova Igreja "Primeira Igreja de São Paulo"

**Espaços desejados:**
- Templo
- Sala Infantil
- Auditório

**O que precisa fazer HOJE:**

1. ❌ Adicionar novos espaços em `src/config/espacos.ts` (alterar código)
2. ❌ Adicionar variáveis de ambiente para cada espaço (`.env.local`)
3. ❌ Adicionar espaços no tenant config (código)
4. ❌ Atualizar `getCalendarIds()` com novos IDs (código)
5. ❌ Rebuild e redeploy da aplicação

**Problemas:**
- Espaços da "Oitava Igreja" aparecem para TODOS os tenants
- Se remover espaços para um tenant, remove para TODOS
- Não é escalável para 10+ igrejas com espaços diferentes

---

## 📐 Arquitetura Proposta

### Princípios de Design

1. **Espaços são configuração de tenant, não código**
2. **Código deve ser agnóstico aos espaços específicos**
3. **Adicionar nova igreja = apenas configuração, zero código**
4. **Server Components por padrão, Client Components apenas quando necessário** (Vercel: Server Components by Default)
5. **Minimizar serialização nos limites RSC** (Vercel: `server-serialization`)
6. **Autenticar Server Actions como API Routes** (Vercel: `server-auth-actions`)
7. **Paralelizar operações independentes** (Vercel: `async-parallel`)
8. **Compound Components com contexto compartilhado** (Vercel: `architecture-compound-components`)
9. **Interface genérica de contexto: state, actions, meta** (Vercel: `state-context-interface`)
10. **Decouplar estado da UI** (Vercel: `state-decouple-implementation`)

### Estrutura Ideal

#### **Tipos e Contexto (Vercel: Generic Context Interface)**

```typescript
// src/lib/tenant/tenant-context.ts

export interface EspacoConfig {
  id: string;
  nome: string;
  descricao: string;
  capacidade: number | null;
  calendarId: string;
  ativo: boolean;
}

export interface TenantConfig {
  id: string;
  name: string;
  googleClientId: string;
  googleClientSecret: string;
  calendarIframeUrl: string;
  espacos: EspacoConfig[];
  onesignalAppId?: string;
  onesignalRestApiKey?: string;
}

// Interface genérica do contexto (Vercel: state, actions, meta)
// Permite que qualquer provider implemente o mesmo contrato
interface ReservaFormState {
  programacao: string;
  responsavel: string;
  telefone: string;
  observacoes: string;
  dataInicio: string;
  horarioInicio: string;
  horarioFim: string;
  espacos: string[];
  recorrente: boolean;
  tipoRecorrencia: "semanal" | "mensal" | null;
  dataTermino: string | null;
  isSubmitting: boolean;
}

interface ReservaFormActions {
  setField: <K extends keyof ReservaFormState>(
    field: K,
    value: ReservaFormState[K]
  ) => void;
  toggleEspaco: (espacoId: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

interface ReservaFormMeta {
  tenant: { id: string; name: string };  // ← Apenas campos usados (Vercel: server-serialization)
  espacosDisponiveis: {
    id: string;
    nome: string;
    descricao: string;
    capacidade: number | null;
  }[];  // ← Apenas campos usados, não o EspacoConfig inteiro
}

export interface ReservaFormContextValue {
  state: ReservaFormState;
  actions: ReservaFormActions;
  meta: ReservaFormMeta;
}
```

> **Nota:** A interface `ReservaFormMeta.tenant` contém apenas `{ id, name }` — não o `TenantConfig` inteiro. Isso minimiza serialização no limite RSC (Vercel: `server-serialization`).

#### **Configuração de Tenants**

```typescript
// src/lib/tenant/config.ts

const TENANTS: Record<string, TenantConfig> = {
  "oitava-agenda": {
    id: "oitava-agenda",
    name: "Oitava Igreja Betim",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    calendarIframeUrl: process.env.CALENDAR_IFRAME_URL || "",
    espacos: [
      {
        id: "templo",
        nome: "Templo",
        descricao: "Espaço principal para cultos",
        capacidade: null,
        calendarId: process.env.CALENDAR_ID_TEMPLO || "",
        ativo: true,
      },
      {
        id: "salao-social",
        nome: "Salão Social",
        descricao: "Eventos e reuniões",
        capacidade: null,
        calendarId: process.env.CALENDAR_ID_SALAO_SOCIAL || "",
        ativo: true,
      },
      // ... outros espaços
    ],
  },

  // NOVA IGREJA: Apenas adicionar configuração, sem alterar código!
  "primeira-igreja-sp": {
    id: "primeira-igreja-sp",
    name: "Primeira Igreja de São Paulo",
    googleClientId: process.env.PRIMEIRA_IGREJA_GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.PRIMEIRA_IGREJA_GOOGLE_CLIENT_SECRET || "",
    calendarIframeUrl: process.env.PRIMEIRA_IGREJA_CALENDAR_IFRAME_URL || "",
    espacos: [
      {
        id: "templo",
        nome: "Templo",
        descricao: "Espaço principal",
        capacidade: null,
        calendarId: process.env.PRIMEIRA_IGREJA_CALENDAR_ID_TEMPLO || "",
        ativo: true,
      },
      {
        id: "sala-infantil",
        nome: "Sala Infantil",
        descricao: "Espaço para crianças",
        capacidade: 20,
        calendarId: process.env.PRIMEIRA_IGREJA_CALENDAR_ID_SALA_INFANTIL || "",
        ativo: true,
      },
      {
        id: "auditorio",
        nome: "Auditório",
        descricao: "Auditório para eventos",
        capacidade: 100,
        calendarId: process.env.PRIMEIRA_IGREJA_CALENDAR_ID_AUDITORIO || "",
        ativo: true,
      },
    ],
  },
};

export function getTenantConfig(tenantId?: string): TenantConfig {
  const id = tenantId || process.env.DEFAULT_TENANT_ID || "oitava-agenda";
  return TENANTS[id] || TENANTS["oitava-agenda"];
}

export function getEspacosDoTenant(tenantId?: string): EspacoConfig[] {
  const tenant = getTenantConfig(tenantId);
  return tenant.espacos.filter((e) => e.ativo);
}

export function getCalendarId(tenantId: string, espacoId: string): string {
  const tenant = TENANTS[tenantId];
  const espaco = tenant.espacos.find((e) => e.id === espacoId);
  return espaco?.calendarId || "";
}
```

#### **Server Component (Vercel: async-parallel + server-serialization)**

```tsx
// src/app/(dashboard)/reserva/page.tsx
// Server Component - obtém dados do tenant no servidor

import { getCurrentTenant, getEspacosDoTenant } from "@/lib/tenant/config";
import { ReservaFormProvider } from "./_components/ReservaFormContext";
import { ReservaForm } from "./_components/ReservaFormCompound";

export default async function ReservaPage() {
  // Vercel: async-parallel - operações independentes executadas concorrentemente
  const tenantPromise = getCurrentTenant();
  const espacosPromise = tenantPromise.then((t) => getEspacosDoTenant(t.id));

  const [tenant, espacos] = await Promise.all([tenantPromise, espacosPromise]);

  // Vercel: server-serialization - passar apenas campos necessários
  // Não serializar TenantConfig inteiro (com googleClientSecret!)
  const tenantSafe = { id: tenant.id, name: tenant.name };
  const espacosSafe = espacos.map((e) => ({
    id: e.id,
    nome: e.nome,
    descricao: e.descricao,
    capacidade: e.capacidade,
  }));

  return (
    <ReservaFormProvider tenant={tenantSafe} espacosDisponiveis={espacosSafe}>
      <ReservaForm />
    </ReservaFormProvider>
  );
}
```

> **⚠️ Importante:** Nunca passar `googleClientSecret` ou campos sensíveis para client components. O objeto `tenantSafe` filtra apenas o que o client precisa.

#### **Provider (Vercel: Decouple State from UI)**

```tsx
// src/app/(dashboard)/reserva/_components/ReservaFormContext.tsx
"use client";

import { createContext, use, useState, useCallback } from "react";
import type { ReservaFormContextValue } from "@/lib/tenant/tenant-context";

const ReservaFormContext = createContext<ReservaFormContextValue | null>(null);

interface ReservaFormProviderProps {
  children: React.ReactNode;
  tenant: { id: string; name: string };
  espacosDisponiveis: {
    id: string;
    nome: string;
    descricao: string;
    capacidade: number | null;
  }[];
}

export function ReservaFormProvider({
  children,
  tenant,
  espacosDisponiveis,
}: ReservaFormProviderProps) {
  const [state, setState] = useState<ReservaFormContextValue["state"]>({
    programacao: "",
    responsavel: "",
    telefone: "",
    observacoes: "",
    dataInicio: "",
    horarioInicio: "",
    horarioFim: "",
    espacos: [],
    recorrente: false,
    tipoRecorrencia: null,
    dataTermino: null,
    isSubmitting: false,
  });

  const setField = useCallback(
    <K extends keyof ReservaFormContextValue["state"]>(
      field: K,
      value: ReservaFormContextValue["state"][K]
    ) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleEspaco = useCallback(
    (espacoId: string) => {
      setState((prev) => ({
        ...prev,
        espacos: prev.espacos.includes(espacoId)
          ? prev.espacos.filter((id) => id !== espacoId)
          : [...prev.espacos, espacoId],
      }));
    },
    []
  );

  const submit = useCallback(async () => {
    // Server Action chamada aqui
  }, []);

  const reset = useCallback(() => {
    setState({
      programacao: "",
      responsavel: "",
      telefone: "",
      observacoes: "",
      dataInicio: "",
      horarioInicio: "",
      horarioFim: "",
      espacos: [],
      recorrente: false,
      tipoRecorrencia: null,
      dataTermino: null,
      isSubmitting: false,
    });
  }, []);

  const value: ReservaFormContextValue = {
    state,
    actions: { setField, toggleEspaco, submit, reset },
    meta: { tenant, espacosDisponiveis },
  };

  return (
    <ReservaFormContext value={value}>
      {children}
    </ReservaFormContext>
  );
}

// Hook helper com React 19 use()
export function useReservaFormContext() {
  const context = use(ReservaFormContext);
  if (!context) {
    throw new Error(
      "useReservaFormContext must be used within ReservaFormProvider"
    );
  }
  return context;
}
```

#### **EspacosSelector (Vercel: Compound Components + No Prop Drilling)**

```tsx
// src/app/(dashboard)/reserva/_components/EspacosSelector.tsx
"use client";

import { useReservaFormContext } from "./ReservaFormContext";

interface EspacosSelectorProps {
  disabled?: boolean;
}

export function EspacosSelector({ disabled = false }: EspacosSelectorProps) {
  // Vercel: state-decouple-implementation
  // Componente acessa contexto, não sabe de onde vêm os dados
  // Sem props de selectedEspacos/onChange (era prop drilling)
  const {
    state: { espacos: selecionados },
    actions: { toggleEspaco },
    meta: { espacosDisponiveis },
  } = useReservaFormContext();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Espaços *
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Selecione um ou mais espaços para sua programação
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {espacosDisponiveis.map((espaco) => {
          const isSelected = selecionados.includes(espaco.id);
          return (
            <button
              key={espaco.id}
              type="button"
              onClick={() => toggleEspaco(espaco.id)}
              disabled={disabled}
              className={`relative flex flex-col items-start rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    isSelected
                      ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`font-medium ${
                    isSelected
                      ? "text-blue-700 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {espaco.nome}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {espaco.descricao}
              </p>

              {espaco.capacidade && (
                <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {espaco.capacidade} pessoas
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selecionados.length > 0 && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {selecionados.length} espaço(s) selecionado(s)
        </p>
      )}
    </div>
  );
}
```

> **Nota:** Sem props `selectedEspacos` ou `onChange`. O componente acessa tudo via contexto. Segue Vercel: Compound Components — sem prop drilling, sem boolean props.

#### **Server Action (Vercel: server-auth-actions)**

```typescript
// src/app/(dashboard)/reserva/_components/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { getEspacosDoTenant, getCalendarId } from "@/lib/tenant/config";
import { criarEventoNoCalendar } from "@/lib/google-calendar/events";
import { reservaSchema } from "@/lib/validation/reserva";

export async function criarReserva(data: unknown) {
  // Vercel: server-auth-actions - SEMPRE verificar auth dentro da action
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  // Validar input primeiro (Vercel: validate before authorize)
  const validated = reservaSchema.parse(data);

  // Obter tenant e espaços do contexto do servidor
  const tenantId = session.user.tenantId; // assumindo que está no session
  const espacosDoTenant = getEspacosDoTenant(tenantId);

  // Autorizar: validar se espaços pertencem ao tenant
  const espacosValidos = validated.espacos.filter((id) =>
    espacosDoTenant.some((e) => e.id === id)
  );

  if (espacosValidos.length !== validated.espacos.length) {
    throw new Error("Um ou mais espaços não estão disponíveis para este tenant");
  }

  // Verificar disponibilidade em todos os espaços
  for (const espacoId of espacosValidos) {
    const calendarId = getCalendarId(tenantId, espacoId);
    const disponivel = await verificarDisponibilidade(
      calendarId,
      validated.dataInicio,
      validated.horarioInicio,
      validated.horarioFim
    );

    if (!disponivel) {
      throw new Error(`Espaço indisponível: ${espacoId}`);
    }
  }

  // Criar eventos no Google Calendar
  for (const espacoId of espacosValidos) {
    const calendarId = getCalendarId(tenantId, espacoId);
    await criarEventoNoCalendar(calendarId, {
      ...validated,
      responsibleEmail: session.user.email,
    });
  }

  return { success: true };
}
```

> **Nota:** Server Action verifica autenticação **dentro** da função (não confia apenas em middleware). Valida input antes de autorizar. Segue Vercel: `server-auth-actions`.

---

## 🎯 Plano de Implementação

### Fase 1: Refatorar Configuração de Tenants ✅ Prioridade Alta

#### 1.1 Criar tipo `EspacoConfig` e contexto genérico

**Arquivo:** `src/lib/tenant/tenant-context.ts`

- Adicionar `EspacoConfig`
- Atualizar `TenantConfig.espacos` de `string[]` para `EspacoConfig[]`
- Adicionar interface `ReservaFormContextValue` com `state`, `actions`, `meta`

#### 1.2 Migrar espaços para dentro de cada tenant

**Arquivo:** `src/lib/tenant/config.ts`

- Mover definição de espaços de `src/config/espacos.ts` para dentro de cada tenant
- Cada tenant tem seus próprios espaços com `calendarId` embutido
- Adicionar helpers: `getEspacosDoTenant()`, `getCalendarId()`

#### 1.3 Atualizar `ReservaFormProvider`

- Aceitar `tenant` e `espacosDisponiveis` como props
- Incluir no `meta` do contexto (apenas campos seguros, sem secrets)

---

### Fase 2: Atualizar Componentes ✅ Prioridade Alta

#### 2.1 Refatorar `EspacosSelector.tsx`

- Remover props `selectedEspacos` e `onChange` (prop drilling)
- Usar `useReservaFormContext()` para acessar estado e ações
- Usar `meta.espacosDisponiveis` do contexto (não import global)

#### 2.2 Atualizar Server Page (`reserva/page.tsx`)

- Obter tenant e espaços no servidor
- Paralelizar com `Promise.all()` (Vercel: `async-parallel`)
- Filtrar campos sensíveis antes de passar para provider (Vercel: `server-serialization`)

#### 2.3 Atualizar Server Action `criarReserva`

- Adicionar `await auth()` no início (Vercel: `server-auth-actions`)
- Usar `getEspacosDoTenant()` para validar espaços
- Usar `getCalendarId()` para obter calendar ID correto do tenant

#### 2.4 Atualizar `MapaIgreja.tsx`

- Receber espaços do contexto (não import global)

#### 2.5 Atualizar validações

- `validarEspacos()` usa espaços do tenant, não lista global

---

### Fase 3: Limpeza ✅ Prioridade Média

#### 3.1 Remover `src/config/espacos.ts`

- Mover tipos para `src/lib/tenant/tenant-context.ts`
- Remover funções que usam lista global
- Remover `getCalendarIdByEspacoId()` hardcoded

#### 3.2 Atualizar `.env.local.example`

```env
# ==========================================
# CONFIGURAÇÕES - OITAVA IGREJA BETIM
# ==========================================
DEFAULT_TENANT_ID=oitava-agenda
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Espaços - Oitava Igreja
CALENDAR_ID_TEMPLO=
CALENDAR_ID_SALAO_SOCIAL=
CALENDAR_ID_SALA_A=
# ... outros

# ==========================================
# CONFIGURAÇÕES - PRIMEIRA IGREJA SP (exemplo)
# ==========================================
# Para adicionar nova igreja:
# 1. Adicione as variáveis abaixo
# 2. Edite src/lib/tenant/config.ts adicionando novo tenant
PRIMEIRA_IGREJA_GOOGLE_CLIENT_ID=
PRIMEIRA_IGREJA_GOOGLE_CLIENT_SECRET=
PRIMEIRA_IGREJA_CALENDAR_ID_TEMPLO=
PRIMEIRA_IGREJA_CALENDAR_ID_SALA_INFANTIL=
PRIMEIRA_IGREJA_CALENDAR_ID_AUDITORIO=
```

---

### Fase 4: Documentação ✅ Prioridade Média

#### 4.1 Criar guia "Adicionando Nova Igreja"

```markdown
# Como Adicionar Nova Igreja

## Passo 1: Configurar Google Calendar
1. Criar projeto no Google Cloud Console
2. Criar credenciais OAuth
3. Criar agendas para cada espaço
4. Obter calendarId de cada agenda

## Passo 2: Adicionar Variáveis de Ambiente
Copiar bloco no `.env.local`:
```env
NOVA_IGREJA_GOOGLE_CLIENT_ID=
NOVA_IGREJA_GOOGLE_CLIENT_SECRET=
NOVA_IGREJA_CALENDAR_ID_TEMPLO=
NOVA_IGREJA_CALENDAR_ID_SALA_01=
```

## Passo 3: Adicionar Tenant Config
Editar `src/lib/tenant/config.ts`:
```typescript
"nova-igreja": {
  id: "nova-igreja",
  name: "Nome da Igreja",
  googleClientId: process.env.NOVA_IGREJA_GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.NOVA_IGREJA_GOOGLE_CLIENT_SECRET || "",
  calendarIframeUrl: "...",
  espacos: [
    {
      id: "templo",
      nome: "Templo",
      descricao: "...",
      capacidade: null,
      calendarId: process.env.NOVA_IGREJA_CALENDAR_ID_TEMPLO || "",
      ativo: true,
    },
  ],
}
```

## Passo 4: Deploy
Deploy da aplicação e configurar subdomínio (se aplicável).
```

---

## 🔄 Roteiro de Migração

### Estado Atual (ANTES)
```
Código
├── src/config/espacos.ts         ← Lista GLOBAL de 11 espaços
├── src/lib/tenant/config.ts      ← Tenants com lista de IDs
└── componentes                   ← Usam ESPACOS global

Problema: Todos os tenants veem TODOS os espaços
```

### Estado Proposto (DEPOIS)
```
Código
├── src/lib/tenant/config.ts      ← Tenants COM seus espaços
│   ├── "oitava-agenda": { espacos: [...] }
│   └── "outra-igreja": { espacos: [...] }
├── Server Component              ← Obtém tenant + espaços (paralelo)
│   └── ReservaFormProvider       ← Injeta via contexto (state, actions, meta)
│       └── Compound Components   ← Acessam contexto, sem prop drilling
└── Server Actions                ← Auth + validação por tenant

Vantagem: Cada tenant vê APENAS seus espaços
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Hardcoded) | Depois (Configurável) |
|---------|-------------------|----------------------|
| **Adicionar igreja** | Alterar múltiplos arquivos | Adicionar entrada no TENANTS |
| **Espaços diferentes** | ❌ Não suporta | ✅ Cada tenant tem seus espaços |
| **Variáveis de ambiente** | 1 por espaço (global) | 1 por espaço (por tenant) |
| **Código alterado** | Sim (múltiplos arquivos) | Não (apenas config) |
| **Build/Deploy** | Necessário | Opcional (só config mudou) |
| **Escalabilidade** | Baixa (10 igrejas = caos) | Alta (100 igrejas = viável) |
| **Segurança** | Auth no middleware | Auth dentro da Server Action |
| **Serialização** | Objetos inteiros | Apenas campos necessários |
| **Performance** | Await sequencial | Promise.all() paralelo |

---

## 🔍 Revisão Vercel Best Practices

Esta seção documenta as correções aplicadas com base nas skills Vercel:

### ✅ Correções Aplicadas

| Regra Vercel | Problema no Plano Original | Correção |
|--------------|---------------------------|----------|
| `state-decouple-implementation` | Hook `useTenant()` dedicado acopla UI à implementação | Usar `useReservaFormContext()` com interface genérica `state/actions/meta` |
| `architecture-compound-components` | `EspacosSelector` recebia `selectedEspacos` e `onChange` como props | Componente acessa contexto diretamente, sem prop drilling |
| `server-auth-actions` | Server Action sem verificação de auth | Adicionar `const session = await auth()` dentro da action |
| `server-serialization` | Passar `TenantConfig` inteiro (com secrets!) para client | Filtrar para `{ id, name }` e campos seguros de espaços |
| `async-parallel` | Não mencionava paralelização | `Promise.all([tenantPromise, espacosPromise])` |
| `state-context-interface` | Contexto sem interface genérica | Interface com `state`, `actions`, `meta` — qualquer provider pode implementar |
| `architecture-avoid-boolean-props` | N/A (não aplicável aqui) | Componentes compostos sem boolean props |

### 📚 Referências Vercel

- [Compound Components](https://vercel.com/guides/react-composition-patterns#compound-components)
- [Generic Context Interfaces](https://vercel.com/guides/react-composition-patterns#generic-context-interfaces)
- [Decouple State from UI](https://vercel.com/guides/react-composition-patterns#decouple-state)
- [Authenticate Server Actions](https://nextjs.org/docs/app/guides/authentication)
- [Minimize RSC Serialization](https://vercel.com/guides/react-best-practices#server-serialization)
- [Promise.all for Independent Operations](https://vercel.com/guides/react-best-practices#async-parallel)

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Refatorar e quebrar fluxo atual | Alto | Testar manualmente cada etapa |
| `.env.local` ficar muito grande | Médio | Documentar bem, considerar JSON config externo no futuro |
| Tenant sem espaços configurados | Médio | Validação no startup com fallback |
| Calendar ID errado cria evento no calendário errado | Alto | Testar com igreja de staging primeiro |
| Vazar secrets via serialização | **CRÍTICO** | Filtrar explicitamente campos antes de passar para client components |

---

## 🎯 Critérios de Aceite

- [ ] `EspacosSelector` exibe apenas espaços do tenant atual (via contexto, não import global)
- [ ] Nova igreja pode ser adicionada SEM alterar código (apenas config)
- [ ] Cada tenant tem espaços independentes (nomes, quantidades, capacidades)
- [ ] Server Actions verificam autenticação internamente
- [ ] Server Actions validam espaços do tenant correto
- [ ] Mapa da igreja usa espaços do tenant
- [ ] Nenhum secret serializado no limite RSC
- [ ] Operações de fetch paralelizadas com `Promise.all()`
- [ ] Build passa sem erros
- [ ] Documentação de "como adicionar igreja" criada

---

## 📝 Próximos Passos

1. **Validar esta análise** com o time
2. **Aprovar abordagem** (Opção A: arquivo config vs Opção B: banco de dados futuro)
3. **Executar Fase 1** (refatorar config - 1-2h)
4. **Executar Fase 2** (atualizar componentes - 2-3h)
5. **Testar manualmente** com fluxo completo de reserva
6. **Executar Fases 3-4** (limpeza e docs - 1h)

---

**Criado em:** 9 de abril de 2026
**Revisado em:** 9 de abril de 2026 (com Vercel Best Practices)
**Status:** Aguardando aprovação
**Prioridade:** Alta (bloqueia escalabilidade do produto)
**Estimativa:** 4-6 horas de implementação
