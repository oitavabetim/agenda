# Plan 17 — Ajuste Descrição do Evento no Google Calendar

## Contexto

Atualmente, ao salvar uma reserva no Google Calendar, o campo `description` recebe **apenas** o conteúdo de `observacoes`. Diáconos e equipe de cozinha precisam visualizar **quem é o responsável** e **como entrar em contato** diretamente no descritivo do evento.

### Problema

- `description` do evento = apenas `dados.observacoes`
- Diáconos e cozinha não veem responsável/telefone no calendário
- Informações de contato ficam apenas em `extendedProperties` (invisível no Google Calendar UI)

### Solução

Construir o `description` do evento combinando **responsável + telefone + observações** em formato legível, extraindo a lógica para uma **função pura** (não-inline), seguindo princípios de separação de responsabilidades.

---

## Princípios Aplicados (Vercel Best Practices)

### 1. Funções Puras e Testáveis
- Lógica de formatação extraída em função pura `buildEventDescription()`
- Sem side effects, sem I/O — facilmente testável unitariamente
- Segue o princípio de **state decoupled**: formatação não depende do fluxo de reserva

### 2. Cheap Condition Before Async ([async-cheap-condition-before-await](.agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md))
- Construir a description é uma operação síncrona e barata
- Deve ser feita **antes** de qualquer chamada assíncrona (`createEvent`, `processarRecorrencia`)
- Evita reprocessamento desnecessário se validação falhar

### 3. Server Action Security ([server-auth-actions](.agents/skills/vercel-react-best-practices/rules/server-auth-actions.md))
- A formatação acontece dentro da server action já autenticada
- Não expõe dados sensíveis — apenas monta string para o description
- Input já validado pelo Zod antes deste ponto

### 4. DRY — Don't Repeat Yourself
- Lógica inline duplicada em 2 pontos (reserva simples + recorrente)
- Extração para função pura elimina duplicação
- Facilita manutenção futura (ex: adicionar novo campo ao description)

---

## Estado Atual

### Onde o `description` é definido

**Arquivo:** `src/app/(dashboard)/reserva/_components/actions.ts`

**Reserva Simples (linha ~189):**
```typescript
const evento = await createEvent({
  calendarId,
  summary: dados.programacao,
  description: dados.observacoes || undefined,  // ← APENAS observações
  startDateTime,
  endDateTime,
  responsibleEmail: session.user.email,
});
```

**Reserva Recorrente (linha ~113):**
```typescript
const resultado = await processarRecorrencia({
  // ...
  summary: dados.programacao,
  description: dados.observacoes || undefined,  // ← APENAS observações
  // ...
});
```

### Dados disponíveis no formulário

O `ReservaFormData` já contém todos os campos necessários:
- `responsavel: string` — Nome do responsável (pré-preenchido com `usuarioNome`)
- `telefone: string` — Telefone formatado (ex: `(11) 99999-9999`)
- `observacoes?: string` — Informações adicionais

---

## Plano de Implementação

### Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(dashboard)/reserva/_components/actions.ts` | **Modificar** | Usar função `buildEventDescription` nos 2 pontos |

> **Nota:** Diferente do plano original, **NÃO criar arquivo utilitário separado**. A função será definida no topo de `actions.ts` porque:
> 1. É usada apenas dentro deste módulo
> 2. Evita importação extra para uma função de 8 linhas
> 3. Mantém coesão — formatação e envio de eventos no mesmo arquivo
> 4. Segue [async-cheap-condition-before-await](.agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md): condição barata antes do async

---

### Passo 1: Adicionar função `buildEventDescription` no topo de `actions.ts`

Adicionar após os imports, antes da função `criarReserva`:

```typescript
/**
 * Constrói descrição formatada para evento no Google Calendar.
 * Inclui responsável, telefone e observações em formato legível
 * para diáconos e equipe de cozinha.
 *
 * Função pura — sem side effects, facilmente testável.
 */
function buildEventDescription(params: {
  responsavel: string;
  telefone: string;
  observacoes?: string;
}): string | undefined {
  const partes: string[] = [];

  if (params.responsavel.trim()) {
    partes.push(`Responsável: ${params.responsavel.trim()}`);
  }
  if (params.telefone.trim()) {
    partes.push(`Telefone: ${params.telefone.trim()}`);
  }
  if (params.observacoes?.trim()) {
    partes.push(`Observações: ${params.observacoes.trim()}`);
  }

  return partes.length > 0 ? partes.join("\n") : undefined;
}
```

---

### Passo 2: Usar função na Reserva Recorrente

**Antes:**
```typescript
const resultado = await processarRecorrencia({
  dataInicio: dados.dataInicio,
  horarioInicio: dados.horarioInicio,
  horarioFim: dados.horarioFim,
  tipo: dados.recorrenciaTipo,
  dataTermino: dados.recorrenciaDataTermino!,
  espacosCalendarIds,
  summary: dados.programacao,
  description: dados.observacoes || undefined,
  responsibleEmail: session.user.email,
});
```

**Depois:**
```typescript
// Construir descrição antes de operação async (cheap condition before await)
const descricao = buildEventDescription({
  responsavel: dados.responsavel,
  telefone: dados.telefone,
  observacoes: dados.observacoes,
});

const resultado = await processarRecorrencia({
  dataInicio: dados.dataInicio,
  horarioInicio: dados.horarioInicio,
  horarioFim: dados.horarioFim,
  tipo: dados.recorrenciaTipo,
  dataTermino: dados.recorrenciaDataTermino!,
  espacosCalendarIds,
  summary: dados.programacao,
  description: descricao,
  responsibleEmail: session.user.email,
});
```

---

### Passo 3: Usar função na Reserva Simples

**Antes:**
```typescript
// 7b. Criar eventos para cada espaço
const eventIds: string[] = [];

for (const calendarId of espacosCalendarIds) {
  const evento = await createEvent({
    calendarId,
    summary: dados.programacao,
    description: dados.observacoes || undefined,
    startDateTime,
    endDateTime,
    responsibleEmail: session.user.email,
  });

  eventIds.push(evento.id);
}
```

**Depois:**
```typescript
// 7b. Criar eventos para cada espaço
// Construir descrição antes do loop async (cheap condition before await)
const descricao = buildEventDescription({
  responsavel: dados.responsavel,
  telefone: dados.telefone,
  observacoes: dados.observacoes,
});

const eventIds: string[] = [];

for (const calendarId of espacosCalendarIds) {
  const evento = await createEvent({
    calendarId,
    summary: dados.programacao,
    description: descricao,
    startDateTime,
    endDateTime,
    responsibleEmail: session.user.email,
  });

  eventIds.push(evento.id);
}
```

---

## Formato Esperado do Description

**Exemplo completo:**
```
Responsável: João Silva
Telefone: (11) 99999-1234
Observações: Precisar de projetor e microfone adicional
```

**Sem observações:**
```
Responsável: Maria Santos
Telefone: (21) 98888-5678
```

**Apenas responsável e telefone (observações vazias):**
```
Responsável: Pedro Oliveira
Telefone: (31) 97777-4321
```

**Todos vazios:**
```
undefined  (nenhuma descrição)
```

---

## Checklist de Validação

- [ ] Reserva simples: description contém responsável + telefone + observações
- [ ] Reserva recorrente: cada evento da recorrência tem description correto
- [ ] Formato legível no Google Calendar UI (quebras de linha `\n` preservadas)
- [ ] Diáconos veem informações no calendário
- [ ] Cozinha vê informações no calendário
- [ ] Campos vazios/whitespace não geram linhas desnecessárias
- [ ] Telefone formatado corretamente (já vem formatado do formulário)
- [ ] `buildEventDescription` é função pura (sem side effects)
- [ ] Description construído antes de chamadas async (cheap condition)
- [ ] Build passa sem erros (`npx next build`)
- [ ] TypeScript compila sem erros

---

## Riscos e Considerações

| Risco | Mitigação |
|---|---|
| Quebras de linha não preservadas no Google Calendar | Google Calendar suporta `\n` em description |
| `processarRecorrencia` não repassar description | Verificar em `src/lib/google-calendar/recurrence.ts` |
| Campos com apenas whitespace | Função usa `.trim()` antes de verificar |
| Função definida no mesmo arquivo | Intencional — usada apenas aqui, evita barrel import |

---

## Comparação: Inline vs Função Local

| Critério | Inline (original) | Função Local (revisado) |
|---|---|---|
| Duplicação de código | ❌ Repete lógica 2x | ✅ Função única |
| Testabilidade | ❌ Embutida no fluxo | ✅ Função pura isolada |
| Legibilidade | ❌ 8 linhas em cada ponto | ✅ 1 linha de chamada |
| Manutenção futura | ❌ Mudar em 2 lugares | ✅ Mudar em 1 lugar |
| Barrel imports | N/A | ✅ Não cria arquivo novo |
| Coesão | ✅ Mesmo domínio | ✅ Mesmo arquivo |

---

## Arquivos de Referência

| Arquivo | Caminho |
|---|---|
| Server action (principal) | `src/app/(dashboard)/reserva/_components/actions.ts` |
| Formulário (UI) | `src/app/(dashboard)/reserva/_components/ReservaFormProgramacao.tsx` |
| Contexto | `src/app/(dashboard)/reserva/_components/ReservaFormContext.tsx` |
| Schema de validação | `src/lib/validation/reserva.ts` |
| createEvent | `src/lib/google-calendar/events.ts` |
| processarRecorrencia | `src/lib/google-calendar/recurrence.ts` |
| Tipagem | `src/types/google-calendar.ts` |

---

## Regras Vercel Aplicadas

| Regra | Skill | Onde Aplicada |
|---|---|---|
| Cheap Condition Before Async | react-best-practices | Description montado antes de `createEvent`/`processarRecorrencia` |
| Server Action Security | react-best-practices | Formatação dentro de server action já autenticada |
| Decouple State from UI | composition-patterns | Função pura não depende de contexto ou estado |
| DRY (Don't Repeat Yourself) | Geral | Função única elimina duplicação inline |
