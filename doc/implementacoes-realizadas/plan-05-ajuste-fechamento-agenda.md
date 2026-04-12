# Planejamento: Correção da Regra RN-04 (Fechamento da Agenda)

**Data:** 22 de março de 2026  
**Status:** ✅ IMPLEMENTADO

---

## 📋 Problema Identificado

A implementação anterior da **RN-04** estava com a lógica **INCORRETA**, não correspondendo ao exemplo fornecido pelo usuário.

### Exemplo do Usuário (CORRETO)
```
Hoje: 27/03/2026 (Sexta-feira)
Pode reservar a partir de: 06/04/2026 (Segunda-feira da semana subsequente)
```

### Implementação Anterior (ERRADA)
```typescript
// Calcula próxima sexta-feira
const diasParaSexta = (5 - hoje.getDay() + 7) % 7 || 7;
const proximaSexta = new Date(hoje);
proximaSexta.setDate(hoje.getDate() + diasParaSexta);

// +3 dias da próxima sexta
const dataMinimaPermitida = new Date(proximaSexta);
dataMinimaPermitida.setDate(proximaSexta.getDate() + 3);
```

**Problema:** Esta lógica não produzia o resultado esperado (06/04 para Sexta 27/03).

---

## ✅ Regra Correta (Baseada no Código de Referência)

### Lógica JavaScript Funcional
```javascript
if (dateNowDay >= 0 && dateNowDay <= 4) { 
    // Domingo (0) a Quinta (4): Próxima semana
    startDateAllowedReservation.setDate(dateNow.getDate() + (8 - dateNowDay));
} else { 
    // Sexta (5) e Sábado (6): Semana subsequente
    startDateAllowedReservation.setDate(dateNow.getDate() + (8 - dateNowDay) + 7);
}
```

### Regra de Negócio Correta

| Dia da Semana | `getDay()` | Período Permitido |
|---------------|------------|-------------------|
| **Domingo** | 0 | Próxima semana (segunda em diante) |
| **Segunda** | 1 | Próxima semana (segunda em diante) |
| **Terça** | 2 | Próxima semana (segunda em diante) |
| **Quarta** | 3 | Próxima semana (segunda em diante) |
| **Quinta** | 4 | Próxima semana (segunda em diante) |
| **Sexta** | 5 | Semana subsequente (segunda em diante) |
| **Sábado** | 6 | Semana subsequente (segunda em diante) |

**Fórmula:**
- **Domingo a Quinta**: `hoje + (8 - diaSemana)` = Segunda da próxima semana
- **Sexta e Sábado**: `hoje + (8 - diaSemana) + 7` = Segunda da semana subsequente

---

## 📁 Arquivos Modificados

### Modificado:
- `src/lib/validation/reserva.ts` - Validação RN-04 corrigida

---

## 🔧 Implementação

### Código Atual (CORRETO)
```typescript
// RN-04: Janela permitida para reserva
// Domingo a Quinta: próxima semana (segunda em diante)
// Sexta e Sábado: semana subsequente (segunda em diante)

const hoje = new Date();
const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

const dataReserva = new Date(data.dataInicio);
dataReserva.setHours(0, 0, 0, 0);

// Calcula segunda-feira da semana permitida
const diasParaSegunda = 8 - diaSemana;
const segundaProximaSemana = new Date(hoje);
segundaProximaSemana.setDate(hoje.getDate() + diasParaSegunda);
segundaProximaSemana.setHours(0, 0, 0, 0);

let dataMinimaPermitida: Date;

if (diaSemana >= 0 && diaSemana <= 4) {
  // Domingo a Quinta: próxima semana
  dataMinimaPermitida = segundaProximaSemana;
} else {
  // Sexta e Sábado: semana subsequente (+7 dias)
  dataMinimaPermitida = new Date(segundaProximaSemana);
  dataMinimaPermitida.setDate(segundaProximaSemana.getDate() + 7);
}

return dataReserva >= dataMinimaPermitida;
```

### Mensagem de Erro
```
"Agenda bloqueada para registro de eventos antes da próxima semana, garantindo que as equipes de diáconos e cozinha tenham tempo hábil para se organizar e melhor atender às programações."
```

---

## 🧪 Testes Manuais

### Cenário 1: Quinta-feira (26/03/2026) ✅
```
Data: 26/03/2026 (Quinta, dia 4)
Cálculo: 26/03 + (8 - 4) = 26/03 + 4 = 30/03/2026 (Segunda)
Pode reservar: A partir de 30/03/2026
Validação: ✅ Aprovado para semana seguinte
```

### Cenário 2: Sexta-feira (27/03/2026) ⭐ EXEMPLO DO USUÁRIO ✅
```
Data: 27/03/2026 (Sexta, dia 5)
Cálculo: 27/03 + (8 - 5) + 7 = 27/03 + 3 + 7 = 06/04/2026 (Segunda)
Pode reservar: A partir de 06/04/2026
Validação: ❌ Bloqueado até 05/04/2026
```

### Cenário 3: Sábado (28/03/2026) ✅
```
Data: 28/03/2026 (Sábado, dia 6)
Cálculo: 28/03 + (8 - 6) + 7 = 28/03 + 2 + 7 = 06/04/2026 (Segunda)
Pode reservar: A partir de 06/04/2026
Validação: ❌ Bloqueado até 05/04/2026
```

### Cenário 4: Domingo (29/03/2026) ✅
```
Data: 29/03/2026 (Domingo, dia 0)
Cálculo: 29/03 + (8 - 0) = 29/03 + 8 = 06/04/2026 (Segunda)
Pode reservar: A partir de 06/04/2026
Validação: ❌ Bloqueado até 05/04/2026
```

### Cenário 5: Segunda-feira (30/03/2026) ✅
```
Data: 30/03/2026 (Segunda, dia 1)
Cálculo: 30/03 + (8 - 1) = 30/03 + 7 = 06/04/2026 (Segunda)
Pode reservar: A partir de 06/04/2026
Validação: ❌ Bloqueado até 05/04/2026
```

### Cenário 6: Quarta-feira (01/04/2026) ✅
```
Data: 01/04/2026 (Quarta, dia 3)
Cálculo: 01/04 + (8 - 3) = 01/04 + 5 = 06/04/2026 (Segunda)
Pode reservar: A partir de 06/04/2026
Validação: ❌ Bloqueado até 05/04/2026
```

### Cenário 7: Quinta-feira (02/04/2026) ✅
```
Data: 02/04/2026 (Quinta, dia 4)
Cálculo: 02/04 + (8 - 4) = 02/04 + 4 = 06/04/2026 (Segunda)
Pode reservar: A partir de 06/04/2026
Validação: ✅ Aprovado para semana seguinte
```

### Cenário 8: Sexta-feira (03/04/2026) ✅
```
Data: 03/04/2026 (Sexta, dia 5)
Cálculo: 03/04 + (8 - 5) + 7 = 03/04 + 3 + 7 = 13/04/2026 (Segunda)
Pode reservar: A partir de 13/04/2026
Validação: ❌ Bloqueado até 12/04/2026
```

---

## 📊 Tabela de Comportamento

| Dia | Data | diaSemana | Cálculo | Data Mínima |
|-----|------|-----------|---------|-------------|
| **Domingo** | 29/03 | 0 | 29/03 + 8 | 06/04 |
| **Segunda** | 30/03 | 1 | 30/03 + 7 | 06/04 |
| **Terça** | 31/03 | 2 | 31/03 + 6 | 06/04 |
| **Quarta** | 01/04 | 3 | 01/04 + 5 | 06/04 |
| **Quinta** | 02/04 | 4 | 02/04 + 4 | 06/04 |
| **Sexta** | 03/04 | 5 | 03/04 + 3 + 7 | 13/04 |
| **Sábado** | 04/04 | 6 | 04/04 + 2 + 7 | 13/04 |

---

## 🎯 Resumo da Regra

### Regra Correta:
```
Domingo a Quinta → Próxima semana (segunda em diante)
Sexta e Sábado → Semana subsequente (segunda em diante)
```

### Fórmula:
```
diasParaSegunda = 8 - diaSemana
segundaProximaSemana = hoje + diasParaSegunda

if (diaSemana <= 4) {  // Domingo a Quinta
  dataMinima = segundaProximaSemana
} else {  // Sexta e Sábado
  dataMinima = segundaProximaSemana + 7
}
```

---

## 🚀 Build Status

```
✓ Compiled successfully
✓ Finished TypeScript
✓ Generating static pages (19/19)
```

---

## 📝 Notas Técnicas

### Por Que `8 - diaSemana`?

**Explicação:**
- Queremos chegar na **próxima segunda-feira**
- Segunda-feira é dia `1` no `getDay()`
- Fórmula: `(1 - diaSemana + 7) % 7` funciona, mas `8 - diaSemana` é mais simples

**Exemplos:**
- Domingo (0): `8 - 0 = 8` dias → Segunda da próxima semana
- Segunda (1): `8 - 1 = 7` dias → Segunda da próxima semana
- Quinta (4): `8 - 4 = 4` dias → Segunda da próxima semana
- Sexta (5): `8 - 5 = 3` dias → Sexta + 3 = Segunda (próxima semana)
- Sábado (6): `8 - 6 = 2` dias → Sábado + 2 = Segunda (próxima semana)

### Por Que `+ 7` para Sexta e Sábado?

**Explicação:**
- Sexta e Sábado estão "perto" do fim de semana
- Próximasegunda-feira já é a semana que vem
- Precisamos da semana **subsequente** (+7 dias adicionais)

**Exemplo (Sexta 27/03):**
- `27/03 + 3 = 30/03` (Segunda da semana que vem)
- `30/03 + 7 = 06/04` (Segunda da semana subsequente) ✅

---

**Implementação concluída e validada! ✅**

**Regra RN-04 agora corresponde ao exemplo do usuário! 🎉**
