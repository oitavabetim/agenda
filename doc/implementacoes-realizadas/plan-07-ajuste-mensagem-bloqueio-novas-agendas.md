# Plano de Ajuste: Mensagem de Bloqueio de Agenda com Data Específica

## Problema Identificado

A mensagem de erro atual informa:
> "Agenda bloqueada para registro de eventos antes da próxima semana, garantindo que as equipes de diáconos e cozinha tenham tempo hábil para se organizar e melhor atender às programações."

Esta mensagem é **genérica** e não informa ao usuário **qual é a data exata** a partir da qual ele pode fazer reservas.

## Contexto Técnico

### Lógica Atual de Bloqueio

No arquivo `src/lib/validation/reserva.ts`, existe a regra **RN-04** que calcula dinamicamente a data mínima permitida:

```typescript
// RN-04: Janela permitida para reserva
// Domingo a Quinta: próxima semana (segunda em diante)
// Sexta e Sábado: semana subsequente (segunda em diante)

const hoje = getTodayInBrazil();
const diaSemana = getDayInBrazil(hoje); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

// Calcula segunda-feira da semana permitida
const diasParaSegunda = 8 - diaSemana;
const dataMinimaPermitida = new Date(hoje);
dataMinimaPermitida.setUTCDate(hoje.getUTCDate() + diasParaSegunda);

// Sexta (5) e Sábado (6): semana subsequente (+7 dias)
if (diaSemana >= 5) {
  dataMinimaPermitida.setUTCDate(dataMinimaPermitida.getUTCDate() + 7);
}
```

### Problema

A variável `dataMinimaPermitida` é calculada corretamente, mas a mensagem de erro é **estática**:
```typescript
{
  message: "Agenda bloqueada para registro de eventos antes da próxima semana, garantindo que as equipes de diáconos e cozinha tenham tempo hábil para se organizar e melhor atender às programações.",
  path: ["dataInicio"],
}
```

## Solução Proposta

### Abordagem: Mensagem Dinâmica com Data Formatada

Utilizar a variável `dataMinimaPermitida` (que já é calculada) para gerar uma mensagem dinâmica com a data específica.

#### Implementação

**Arquivo**: `src/lib/validation/reserva.ts`

**Alteração**: Modificar o `.refine()` da RN-04 para usar função que retorna mensagem dinâmica.

**Antes**:
```typescript
.refine(
  (data) => {
    // ... lógica de validação ...
    return dataReserva >= dataMinimaPermitida;
  },
  {
    message: "Agenda bloqueada para registro de eventos antes da próxima semana, garantindo que as equipes de diáconos e cozinha tenham tempo hábil para se organizar e melhor atender às programações.",
    path: ["dataInicio"],
  }
)
```

**Depois**:
```typescript
.refine(
  (data) => {
    // ... lógica de validação (mantida) ...
    return dataReserva >= dataMinimaPermitida;
  },
  (data) => {
    // Calcula data mínima (mesma lógica)
    const hoje = getTodayInBrazil();
    const diaSemana = getDayInBrazil(hoje);
    const diasParaSegunda = 8 - diaSemana;
    const dataMinimaPermitida = new Date(hoje);
    dataMinimaPermitida.setUTCDate(hoje.getUTCDate() + diasParaSegunda);
    
    if (diaSemana >= 5) {
      dataMinimaPermitida.setUTCDate(dataMinimaPermitida.getUTCDate() + 7);
    }
    
    // Formata data para padrão brasileiro (DD/MM/YYYY)
    const dia = dataMinimaPermitida.getUTCDate().toString().padStart(2, '0');
    const mes = (dataMinimaPermitida.getUTCMonth() + 1).toString().padStart(2, '0');
    const ano = dataMinimaPermitida.getUTCFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;
    
    return {
      message: `Agenda bloqueada para registro de eventos antes do dia ${dataFormatada}, garantindo que as equipes de diáconos e cozinha tenham tempo hábil para se organizar e melhor atender às programações.`,
      path: ["dataInicio"],
    };
  }
)
```

### Justificativa da Abordagem

1. **Zod suporta mensagens dinâmicas**: O segundo parâmetro do `.refine()` pode ser uma função que recebe os dados e retorna o objeto de erro
2. **Sem dependências externas**: Usa formatação manual de data, sem necessidade de importar bibliotecas adicionais
3. **Cálculo já existe**: A lógica de cálculo da data já está implementada, apenas será reutilizada na função de mensagem
4. **Manutenção simples**: Alteração pontual em um único local do código

## Tarefas de Implementação

- [x] **1. Editar `src/lib/validation/reserva.ts`**
  - Localizar o `.refine()` da RN-04 (linha ~108-113)
  - Substituir objeto estático por função que gera mensagem dinâmica
  - Formatar data no padrão brasileiro DD/MM/YYYY
  - Manter restante da lógica de validação inalterada

- [ ] **2. Testar cenários de validação**
  - Testar em diferentes dias da semana para verificar cálculo correto da data
  - Cenários:
    - **Segunda-feira**: deve permitir a partir da próxima segunda
    - **Quarta-feira**: deve permitir a partir da próxima segunda
    - **Sexta-feira**: deve permitir a partir da segunda da semana subsequente
    - **Sábado**: deve permitir a partir da segunda da semana subsequente
    - **Domingo**: deve permitir a partir da próxima segunda

- [ ] **3. Verificar formatação da data**
  - Confirmar que data aparece no formato DD/MM/YYYY
  - Verificar que dias/meses com um dígito têm zero à esquerda (ex: 06/04/2026)

## Exemplos de Mensagens Geradas

### Cenário 1: Usuário tenta reservar na segunda-feira (02/04/2026)
- **Data mínima permitida**: 06/04/2026 (próxima segunda)
- **Mensagem gerada**: 
  > "Agenda bloqueada para registro de eventos antes do dia 06/04/2026, garantindo que as equipes de diáconos e cozinha tenham tempo hábil para se organizar e melhor atender às programações."

### Cenário 2: Usuário tenta reservar na sexta-feira (03/04/2026)
- **Data mínima permitida**: 13/04/2026 (segunda da semana subsequente)
- **Mensagem gerada**: 
  > "Agenda bloqueada para registro de eventos antes do dia 13/04/2026, garantindo que as equipes de diáconos e cozinha tenham tempo hábil para se organizar e melhor atender às programações."

## Benefícios

1. **Melhor UX**: Usuário sabe exatamente quando poderá fazer reserva
2. **Transparência**: Informação clara e específica
3. **Redução de frustração**: Usuário entende o motivo do bloqueio e quando tentar novamente
4. **Consistência**: Mensagem alinhada com PRD original que já previa "antes do dia X"
5. **Sem quebra de funcionalidade**: Alteração apenas na mensagem, lógica de validação permanece

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Erro no cálculo da data na mensagem | Reutilizar mesma lógica já testada da validação |
| Formatação de data incorreta | Usar padStart(2, '0') para garantir DD/MM/YYYY |
| Problema com fuso horário | Usar métodos UTC já empregados na lógica existente |
| Mensagem muito longa | Manter estrutura atual, apenas substituir "próxima semana" por data |

## Referências

- Arquivo de validação: `src/lib/validation/reserva.ts`
- Utilitários de timezone: `src/lib/utils/timezone.ts`
- PRD original: `doc/prd_sistema_de_reserva_de_espacos_da_igreja.md` (linha 229)
- Planejamento relacionado: `doc/plan-05-ajuste-fechamento-agenda.md`

---
**Data de criação**: 2026-04-02  
**Status**: Implementado
