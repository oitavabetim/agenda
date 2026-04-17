# Plan 22 — Revisão do Salvamento de Data/Hora da Reserva no Google Calendar

## Contexto

Foi reportado um erro no fluxo de reserva em alguns celulares: o usuário seleciona, por exemplo, **19:00 no horário do Brasil** e o evento é salvo no **Google Calendar com 3 horas a menos**.

O projeto usa:

- `input type="date"` e `input type="time"` no formulário
- composição manual de `Date` no servidor
- integração com Google Calendar via API
- timezone padrão `America/Sao_Paulo` no envio do evento

O sintoma indica forte possibilidade de **conversão dupla de fuso** ou **interpretação inconsistente entre horário local, UTC e timezone explícito do Google Calendar**.

---

## Diagnóstico Inicial Confirmado no Código

Durante a revisão inicial, foram encontrados estes pontos relevantes:

### 1. Criação do evento envia `toISOString()` com `timeZone`

Em `src/lib/google-calendar/events.ts`, o evento é montado assim:

```ts
start: {
  dateTime: startDateTime.toISOString(),
  timeZone: timezone,
},
end: {
  dateTime: endDateTime.toISOString(),
  timeZone: timezone,
},
```

Isso é um ponto crítico porque:

- `toISOString()` sempre serializa em **UTC**
- ao mesmo tempo o payload informa `timeZone: "America/Sao_Paulo"`
- dependendo da interpretação da API e da origem do `Date`, isso pode deslocar o horário real

### 2. A server action monta `Date` a partir de strings do formulário

Em `src/app/(dashboard)/reserva/_components/actions.ts`, a data/hora é criada com `dayjs(dados.dataInicio)` e depois recebe `.hour()` e `.minute()`.

Isso precisa ser auditado com cuidado porque:

- `dados.dataInicio` chega como string `YYYY-MM-DD`
- esse formato pode ser interpretado de forma diferente entre runtime, fuso local e parsing implícito
- depois o valor é convertido para `Date` nativo com `.toDate()`

### 3. A recorrência repete a mesma estratégia

Em `src/lib/google-calendar/recurrence.ts`, as datas recorrentes também são montadas com `dayjs(dataInicio)` + `.hour()` + `.minute()` + `.toDate()`.

Ou seja:

- se a base estiver errada, o problema se replica em todas as ocorrências
- a correção precisa ser centralizada para não haver divergência entre reserva simples e recorrente

### 4. O formulário usa `new Date().toISOString()` no client

Em `src/app/(dashboard)/reserva/_components/ReservaFormDataHorario.tsx`, o `min` do campo de data está assim:

```ts
min={new Date().toISOString().split("T")[0]}
```

Isso também merece revisão porque:

- `toISOString()` usa UTC
- em certos horários/dispositivos, a data mínima exibida pode ficar desalinhada do dia local do Brasil
- não é necessariamente a causa do erro de 3 horas no salvamento, mas é um sintoma da mesma classe de problema

### 5. Já existem utilitários de timezone, mas o fluxo principal não está padronizado neles

Em `src/lib/utils/timezone.ts` há tentativa de tratar Brasil manualmente, mas o fluxo de criação do evento não está plenamente centralizado nesses helpers.

Isso sugere:

- lógica de timezone espalhada
- chance alta de comportamento inconsistente entre validação, UI e payload da API

---

## Hipótese Principal

O bug provavelmente acontece por esta combinação:

1. o formulário coleta **data** e **hora** como valores locais
2. o servidor reconstrói isso como `Date`
3. o código serializa com `toISOString()` em UTC
4. o payload ainda informa `America/Sao_Paulo`

Resultado provável:

- um horário que deveria representar `19:00 -03:00`
- acaba chegando ao Google Calendar como um instante UTC e depois é reinterpretado com timezone explícito
- em alguns cenários isso produz o deslocamento de **3 horas para trás**

---

## Objetivo da Revisão

Garantir que uma reserva escolhida como **19:00 no Brasil** seja salva e lida como **19:00 em `America/Sao_Paulo`**, independentemente de:

- celular Android
- iPhone
- navegador mobile
- timezone do dispositivo do usuário
- timezone do servidor

---

## Estratégia da Revisão

A revisão será feita em 4 frentes:

### Frente 1 — Mapear o contrato de data/hora ponta a ponta

Levantar exatamente:

- como `dataInicio` e `horarioInicio` saem do formulário
- como esses valores são transformados no client
- como entram na server action
- como viram `Date`
- como são enviados ao Google Calendar
- como são lidos depois nas telas de listagem e conflito

Objetivo:

- definir um contrato único e explícito para data/hora

### Frente 2 — Eliminar parsing implícito e conversão ambígua

Revisar todos os pontos em que há:

- `new Date(string)`
- `dayjs("YYYY-MM-DD")`
- `toISOString()` para horários locais
- ajustes manuais de UTC

Objetivo:

- substituir por uma estratégia determinística para `America/Sao_Paulo`

### Frente 3 — Centralizar timezone em utilitário único

Criar ou refinar helpers para:

- montar datetime local do Brasil a partir de `YYYY-MM-DD` + `HH:mm`
- gerar payload correto para o Google Calendar
- evitar duplicação entre reserva simples, recorrente e disponibilidade

Objetivo:

- impedir que cada módulo trate data/hora de um jeito

### Frente 4 — Validar comportamento real nos cenários críticos

Conferir se a correção protege:

- reserva simples
- reserva recorrente
- verificação de disponibilidade
- listagem de reservas
- conflito entre eventos

Objetivo:

- corrigir a gravação sem introduzir regressão nos demais fluxos

---

## Plano de Execução

### Passo 1 — Revisar todos os pontos de transformação de data/hora

Arquivos prioritários:

- `src/app/(dashboard)/reserva/_components/actions.ts`
- `src/lib/google-calendar/events.ts`
- `src/lib/google-calendar/availability.ts`
- `src/lib/google-calendar/recurrence.ts`
- `src/lib/validation/reserva.ts`
- `src/lib/utils/timezone.ts`
- `src/app/(dashboard)/reserva/_components/ReservaFormDataHorario.tsx`

Entregável:

- mapa do fluxo atual com origem, transformação e destino de data/hora

### Passo 2 — Definir o contrato correto de datetime

Decisão técnica a validar na implementação:

- tratar `dataInicio` + `horarioInicio` como **horário civil do Brasil**
- gerar payload para Google Calendar sem ambiguidade
- evitar usar `toISOString()` quando a intenção for preservar hora local do calendário

Entregável:

- regra técnica documentada no código e aplicada de forma uniforme

### Passo 3 — Refatorar a criação de eventos

Revisar `createEvent()` para garantir que:

- o horário enviado ao Google Calendar represente a hora local correta
- a serialização não converta implicitamente para UTC de forma incompatível
- `start` e `end` usem o mesmo padrão

Entregável:

- payload consistente para eventos simples

### Passo 4 — Refatorar a composição de datas na reserva simples

Revisar `criarReserva()` para:

- remover parsing implícito ambíguo
- montar `startDateTime` e `endDateTime` com semântica explícita de Brasil
- usar helper central em vez de lógica inline

Entregável:

- reserva simples salva corretamente no fuso esperado

### Passo 5 — Refatorar a recorrência com a mesma base

Revisar `calcularDatasRecorrencia()` e `processarRecorrencia()` para:

- usar a mesma estratégia da reserva simples
- garantir que todas as ocorrências preservem o horário local correto

Entregável:

- recorrência consistente com o fluxo simples

### Passo 6 — Revisar disponibilidade e conflito

Conferir se `checkAvailability()` e `checkBulkAvailability()` continuam corretos após a mudança, especialmente em:

- janela de busca no Google Calendar
- comparação de conflitos
- datas formatadas em mensagens de erro

Entregável:

- verificação de conflito alinhada ao novo contrato de horário

### Passo 7 — Revisar o formulário para evitar problemas de UTC no client

Revisar principalmente:

- `min` do campo `date`
- qualquer valor default derivado de `Date` nativo

Entregável:

- UI sem dependência acidental de UTC para regras locais do Brasil

### Passo 8 — Validar manualmente os cenários críticos

Casos mínimos de teste:

- reserva simples às `19:00` salva como `19:00` no Google Calendar
- reserva simples às `08:00`
- reserva próxima à virada do dia
- reserva recorrente semanal às `19:00`
- conflito no mesmo horário
- listagem em "Minhas Reservas" exibindo a hora correta

Entregável:

- checklist de validação concluído

---

## Proposta Técnica de Correção

Durante a implementação, a direção recomendada é:

- adotar **um único formato interno** para montagem do horário de reserva
- representar explicitamente o horário como pertencente a `America/Sao_Paulo`
- evitar misturar:
  - `Date` local do runtime
  - `Date` serializado com `toISOString()`
  - `timeZone` explícito no payload

Direção mais segura:

- criar helper dedicado para montar `start` e `end` do evento com semântica de Brasil
- reutilizar esse helper em:
  - reserva simples
  - recorrência
  - disponibilidade

---

## Riscos da Revisão

### 1. Corrigir gravação e quebrar consulta de disponibilidade

Se o critério de envio mudar, a janela de busca de conflitos também precisa usar o mesmo contrato temporal.

Mitigação:

- revisar criação e leitura em conjunto, não isoladamente

### 2. Corrigir reserva simples e esquecer recorrência

O fluxo recorrente repete a mesma lógica de composição de `Date`.

Mitigação:

- extrair helper compartilhado e remover duplicação

### 3. Ajustar timezone no servidor e manter problema no client

O `input type="date"` com `toISOString()` no `min` já mostra que há dependência de UTC no navegador.

Mitigação:

- revisar também a camada de formulário

### 4. Solução funcionar no desktop e falhar em mobile

O bug foi relatado em alguns celulares, então a validação precisa considerar comportamento real de browser mobile.

Mitigação:

- validar com cenários que não dependam do timezone do dispositivo

---

## Critérios de Sucesso

- Selecionar `19:00` no formulário resulta em evento salvo como `19:00` no Google Calendar
- O horário salvo permanece correto em dispositivos com timezone diferente
- Reserva simples e recorrente usam a mesma lógica temporal
- A verificação de conflito continua funcionando corretamente
- "Minhas Reservas" exibe o mesmo horário que foi reservado
- Não há uso ambíguo de `toISOString()` para horários civis locais do Brasil

---

## Arquivos Provavelmente Envolvidos na Implementação

- `src/app/(dashboard)/reserva/_components/actions.ts`
- `src/lib/google-calendar/events.ts`
- `src/lib/google-calendar/availability.ts`
- `src/lib/google-calendar/recurrence.ts`
- `src/lib/utils/timezone.ts`
- `src/app/(dashboard)/reserva/_components/ReservaFormDataHorario.tsx`
- `src/types/google-calendar.ts`

---

## Checklist da Revisão

- [ ] Mapear fluxo ponta a ponta de data/hora
- [ ] Confirmar causa raiz do deslocamento de 3 horas
- [ ] Definir contrato único de horário em `America/Sao_Paulo`
- [ ] Refatorar criação de evento simples
- [ ] Refatorar criação de recorrência
- [ ] Revisar disponibilidade/conflitos
- [ ] Revisar regras de data no formulário
- [ ] Validar manualmente cenários simples e recorrentes
- [ ] Garantir ausência de regressão na listagem de reservas

---

## Resultado Esperado Após a Implementação

O sistema deve passar a tratar data e hora de reserva como **horário local da igreja em `America/Sao_Paulo`**, do preenchimento do formulário até o payload enviado ao Google Calendar, eliminando o deslocamento de 3 horas relatado em alguns celulares.
