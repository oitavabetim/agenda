# Plano 14: Controle de Andamento - Revisão Multi-Tenant

## 📊 Status Geral

| Fase | Status | Progresso |
|------|--------|-----------|
| Fase 1: Refatorar Configuração de Tenants | ✅ Concluída | 100% |
| Fase 2: Atualizar Componentes | ✅ Concluída | 100% |
| Fase 3: Limpeza | ✅ Concluída | 100% |
| Fase 4: Documentação | ✅ Concluída | 100% |
| Extra: Mapa Dinâmico por Tenant | ✅ Concluída | 100% |

---

## Build Final ✅

```
✓ Compiled successfully in 14.9s
✓ Generating static pages using 7 workers (8/8) in 316.4ms
```

**Nota:** Warning "Dynamic server usage" em `/minhas-reservas` é esperado (usa `headers()`) e não relacionado às mudanças do Plano 14.

---

## Log de Alterações

### Data: 09/04/2026

**Fases executadas:** 1, 2, 3, 4 + Extra (Mapa Dinâmico)

**Arquivos modificados:**
- `src/lib/tenant/tenant-context.tsx` — Adicionado `EspacoConfig`, `mapaUrl`
- `src/lib/tenant/config.ts` — Espaços migrados para dentro de tenants
- `src/app/(dashboard)/reserva/_components/ReservaFormContext.tsx` — Provider com `tenantId`, `mapaUrl`, `espacosDisponiveis`
- `src/app/(dashboard)/reserva/_components/EspacosSelector.tsx` — Usa contexto (sem prop drilling)
- `src/app/(dashboard)/reserva/_components/ReservaFormEspacos.tsx` — Removido Controller
- `src/app/(dashboard)/reserva/_components/actions.ts` — Validação por tenant
- `src/app/(dashboard)/reserva/_components/MapaIgreja.tsx` — `mapaUrl` dinâmico
- `src/app/(dashboard)/reserva/_components/ReservaFormMapa.tsx` — Usa contexto
- `src/app/(dashboard)/reserva/page.tsx` — Paralelização + server-serialization
- `src/app/(dashboard)/minhas-reservas/actions.ts` — Usa `getEspacosDoTenant()`
- `.env.local.example` — Documentação atualizada

**Arquivos removidos:**
- `src/config/espacos.ts` — Lista hardcoded removida
- `src/config/` — Diretório removido (vazio)

**Arquivos movidos:**
- `public/images/mapa.jpg` → `public/images/mapas/mapa-oitava.jpg`

**Documentação criada:**
- `doc/plan-14-andamento.md` — Controle de andamento
- `doc/guia-adicionando-nova-igreja.md` — Guia completo

**Regras Vercel aplicadas:**
- ✅ `state-context-interface` — Interface genérica state/actions/meta
- ✅ `state-decouple-implementation` — UI desacoplada do estado
- ✅ `architecture-compound-components` — Componentes compostos
- ✅ `server-auth-actions` — Auth dentro das Server Actions
- ✅ `server-serialization` — Minimização de dados serializados
- ✅ `async-parallel` — Operações independentes paralelizadas

---

## Fase 1: Refatorar Configuração de Tenants ✅ CONCLUÍDA

### 1.1 Criar tipo `EspacoConfig` e contexto genérico ✅

**Arquivo:** `src/lib/tenant/tenant-context.tsx`

- [x] Adicionar `EspacoConfig`
- [x] Atualizar `TenantConfig.espacos` de `string[]` para `EspacoConfig[]`
- [x] Remover `calendarIds: Record<string, string>` (agora dentro de cada espaco)

**Regras Vercel aplicadas:**
- `state-context-interface` — Interface genérica com state/actions/meta
- `state-decouple-implementation` — UI não conhece implementação do estado

### 1.2 Migrar espaços para dentro de cada tenant ✅

**Arquivo:** `src/lib/tenant/config.ts`

- [x] Mover definição de espaços de `src/config/espacos.ts` para dentro de cada tenant
- [x] Cada tenant tem seus próprios espaços com `calendarId` embutido
- [x] Adicionar helpers: `getEspacosDoTenant()`, `getCalendarId()`
- [x] Remover `getCalendarIds()` function (hardcoded)

**Regras Vercel aplicadas:**
- `server-serialization` — Não expor secrets em dados serializados

### 1.3 Atualizar `ReservaFormProvider` ✅

**Arquivo:** `src/app/(dashboard)/reserva/_components/ReservaFormContext.tsx`

- [x] Aceitar `tenantId` e `espacosDisponiveis` como props
- [x] Incluir `tenantId` e `espacosDisponiveis` no `meta` do contexto
- [x] Adicionar `toggleEspaco` nas actions
- [x] Passar `tenantId` para Server Action `criarReserva`

**Regras Vercel aplicadas:**
- `architecture-compound-components` — Provider com contexto compartilhado
- `state-decouple-implementation` — Provider isola gerenciamento de estado

---

## Fase 2: Atualizar Componentes ✅ CONCLUÍDA

### 2.1 Refatorar `EspacosSelector.tsx` ✅

**Arquivo:** `src/app/(dashboard)/reserva/_components/EspacosSelector.tsx`

- [x] Remover import de `ESPACOS` global
- [x] Remover props `selectedEspacos` e `onChange` (era prop drilling)
- [x] Usar `useReservaFormContext()` para acessar estado e ações
- [x] Usar `meta.espacosDisponiveis` do contexto

**Regras Vercel aplicadas:**
- `architecture-compound-components` — Componente acessa contexto, não props
- `state-decouple-implementation` — UI não sabe de onde vêm os dados

### 2.2 Atualizar Server Page (`reserva/page.tsx`) ✅

**Arquivo:** `src/app/(dashboard)/reserva/page.tsx`

- [x] Obter tenant e espaços no servidor
- [x] Paralelizar com `Promise.all()` (Vercel: `async-parallel`)
- [x] Filtrar campos sensíveis antes de passar para provider (Vercel: `server-serialization`)

**Regras Vercel aplicadas:**
- `async-parallel` — Promise.all para operações independentes
- `server-serialization` — Filtrar campos antes de serializar

### 2.3 Atualizar Server Action `criarReserva` ✅

**Arquivo:** `src/app/(dashboard)/reserva/_components/actions.ts`

- [x] Adicionar `tenantId` na interface `CriarReservaInput`
- [x] Usar `getEspacosDoTenant()` para validar espaços
- [x] Usar `getCalendarId()` para obter calendar ID correto do tenant
- [x] Validar se espaços pertencem ao tenant antes de processar

**Regras Vercel aplicadas:**
- `server-auth-actions` — Auth dentro da Server Action
- `server-serialization` — Minimizar dados transferidos

### 2.4 Atualizar `minhas-reservas/actions.ts` ✅

**Arquivo:** `src/app/(dashboard)/minhas-reservas/actions.ts`

- [x] Remover import de `ESPACOS` e `getCalendarIdByEspacoId`
- [x] Usar `getEspacosDoTenant()` e `getCalendarId()`

### 2.5 Atualizar validações ✅

- [x] Validações agora usam espaços do tenant, não lista global

---

## Fase 2: Atualizar Componentes

### 2.1 Refatorar `EspacosSelector.tsx`

- [ ] Remover props `selectedEspacos` e `onChange` (prop drilling)
- [ ] Usar `useReservaFormContext()` para acessar estado e ações
- [ ] Usar `meta.espacosDisponiveis` do contexto (não import global)

**Regras Vercel aplicadas:**
- `architecture-compound-components` — Componente acessa contexto, não props
- `architecture-avoid-boolean-props` — Sem props booleanas para customizar comportamento

### 2.2 Atualizar Server Page (`reserva/page.tsx`)

- [ ] Obter tenant e espaços no servidor
- [ ] Paralelizar com `Promise.all()` (Vercel: `async-parallel`)
- [ ] Filtrar campos sensíveis antes de passar para provider (Vercel: `server-serialization`)

**Regras Vercel aplicadas:**
- `async-parallel` — Promise.all para operações independentes
- `server-serialization` — Filtrar campos antes de serializar

### 2.3 Atualizar Server Action `criarReserva`

- [ ] Adicionar `await auth()` no início (Vercel: `server-auth-actions`)
- [ ] Usar `getEspacosDoTenant()` para validar espaços
- [ ] Usar `getCalendarId()` para obter calendar ID correto do tenant

**Regras Vercel aplicadas:**
- `server-auth-actions` — Auth dentro da Server Action
- `server-serialization` — Minimizar dados transferidos

### 2.4 Atualizar `MapaIgreja.tsx`

- [ ] Receber espaços do contexto (não import global)

### 2.5 Atualizar validações

- [ ] `validarEspacos()` usa espaços do tenant, não lista global

---

## Fase 3: Limpeza

### 3.1 Remover `src/config/espacos.ts`

- [ ] Mover tipos para `src/lib/tenant/tenant-context.ts`
- [ ] Remover funções que usam lista global
- [ ] Remover `getCalendarIdByEspacoId()` hardcoded

### 3.2 Atualizar `.env.local.example`

- [ ] Adicionar seção de exemplo para nova igreja
- [ ] Documentar variáveis por tenant

---

## Fase 4: Documentação

### 4.1 Criar guia "Adicionando Nova Igreja"

- [ ] Documentar passos para adicionar nova igreja
- [ ] Incluir exemplo de configuração

---

## 📝 Log de Alterações

### Data: ___/___/____

**Fase executada:**
**Arquivos modificados:**
**Notas:**

---

## ✅ Checklist Final

- [ ] `EspacosSelector` exibe apenas espaços do tenant atual
- [ ] Nova igreja pode ser adicionada SEM alterar código
- [ ] Cada tenant tem espaços independentes
- [ ] Server Actions verificam autenticação internamente
- [ ] Server Actions validam espaços do tenant correto
- [ ] Mapa da igreja usa espaços do tenant
- [ ] Nenhum secret serializado no limite RSC
- [ ] Operações de fetch paralelizadas com `Promise.all()`
- [ ] Build passa sem erros
- [ ] Documentação criada

---

**Criado em:** 9 de abril de 2026
**Última atualização:** 9 de abril de 2026
