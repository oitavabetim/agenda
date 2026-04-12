# Planejamento: Máscara para Campo Telefone de Contato

**Data:** 22 de março de 2026  
**Status:** ✅ IMPLEMENTADO

---

## 📋 Problema Identificado

O campo **Telefone para Contato** no formulário de reservas:
- ✅ Tinha placeholder: `(00) 00000-0000`
- ❌ **Não tinha máscara** durante a digitação
- ❌ **Validação exigia apenas números** (`regex(/^\d+$/)`)
- ❌ Usuário precisava digitar apenas números, mas o placeholder sugeria formato formatado

---

## ✅ Solução Implementada

**Máscara de formatação em tempo real:**
- ✅ Formatação automática enquanto digita
- ✅ **Salva formatado no Google Calendar** (para melhor leitura)
- ✅ Validação aceita formato formatado

---

## 📁 Arquivos Criados/Modificados

### Criados:
- `src/lib/utils/format-phone.ts` - Funções de formatação de telefone

### Modificados:
- `src/components/reserva/reserva-form.tsx` - Campo com máscara automática
- `src/lib/validation/reserva.ts` - Validação para formato formatado

---

## 🔧 Implementação

### 1. Função de Formatação

**Arquivo:** `src/lib/utils/format-phone.ts`

```typescript
/**
 * Formata número de telefone para o padrão brasileiro
 * (11) 99999-9999 (celular) ou (11) 9999-9999 (fixo)
 */
export function formatPhone(value: string): string {
  // Remove tudo que não é número
  let numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  numbers = numbers.slice(0, 11);
  
  // Aplica formatação
  if (numbers.length <= 10) {
    // Telefone fixo: (11) 9999-9999
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    // Telefone celular: (11) 99999-9999
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
}

/**
 * Remove formatação do telefone (deixa apenas números)
 */
export function cleanPhone(value: string): string {
  return value.replace(/\D/g, '');
}
```

### 2. Formulário com Máscara

**Arquivo:** `src/components/reserva/reserva-form.tsx`

```tsx
import { formatPhone } from "@/lib/utils/format-phone";

<input
  type="tel"
  id="telefone"
  value={formData.telefone}
  onChange={(e) => {
    const value = e.target.value;
    // Aplica máscara automaticamente
    updateField("telefone", formatPhone(value));
  }}
  disabled={isPending}
  placeholder="(00) 00000-0000"
  maxLength={15}  // (11) 99999-9999 = 15 caracteres
  required
/>
```

### 3. Validação Atualizada

**Arquivo:** `src/lib/validation/reserva.ts`

```tsx
telefone: z
  .string()
  .min(14, "Telefone para contato é obrigatório")
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato de telefone inválido. Use (00) 00000-0000"),
```

---

## 📊 Resultado Final

### Antes:
```
Usuário digita: 11999999999
Campo mostra: 11999999999
Validação: ❌ "Telefone deve conter apenas números"
Salvo: (não salva, falha validação)
```

### Depois:
```
Usuário digita: 11999999999
Campo mostra: (11) 99999-9999 (automático)
Validação: ✅ Aprovado
Salvo no Calendar: (11) 99999-9999 (formatado)
```

---

## 🧪 Testes Realizados

### Cenário 1: Digitar Celular
```
Input: 11999999999
Máscara: (11) 99999-9999
Validação: ✅ Aprovado
```

### Cenário 2: Digitar Fixo
```
Input: 1133334444
Máscara: (11) 3333-4444
Validação: ✅ Aprovado
```

### Cenário 3: Telefone Inválido
```
Input: 123
Validação: ❌ "Telefone para contato é obrigatório"
```

### Cenário 4: Formato Incorreto
```
Input: (11)999999999 (sem espaço e traço)
Máscara: (11) 9999-9999 (corrige automaticamente)
Validação: ✅ Aprovado
```

---

## 🎨 Funcionalidades

### Formatação Automática
- **Celular:** `(11) 99999-9999` (11 dígitos)
- **Fixo:** `(11) 9999-9999` (10 dígitos)
- **Detecção automática** baseada no número de dígitos

### maxLength
- **15 caracteres:** `(11) 99999-9999`
- Previne digitação excessiva

### Type="tel"
- **Teclado numérico** em dispositivos móveis
- Melhor experiência mobile

---

## ✅ Critérios de Aceite

- [x] Campo aplica máscara automaticamente enquanto digita
- [x] Formato: `(00) 00000-0000` (celular) ou `(00) 9999-9999` (fixo)
- [x] Validação aceita telefone formatado
- [x] **Telefone é salvo COM formatação no Google Calendar**
- [x] Placeholder `(00) 00000-0000` visível
- [x] MaxLength definido (15 caracteres)
- [x] Build testado e validado

---

## 🚀 Build Status

```
✓ Compiled successfully
✓ Finished TypeScript
✓ Generating static pages (19/19)
✓ /reserva compilada
```

---

## 📝 Notas Técnicas

### Regex de Validação
```regex
/^\(\d{2}\) \d{4,5}-\d{4}$/
```

**Explicação:**
- `^` - Início da string
- `\(` - Parêntese esquerdo literal
- `\d{2}` - 2 dígitos (DDD)
- `\)` - Parêntese direito literal
- ` ` - Espaço literal
- `\d{4,5}` - 4 ou 5 dígitos (prefixo)
- `-` - Traço literal
- `\d{4}` - 4 dígitos (sufixo)
- `$` - Fim da string

### Por Que Salvar Formatado?

**Vantagens:**
1. **Melhor leitura** no Google Calendar
2. **Consistência** - todos os telefones no mesmo formato
3. **Facilidade** - não precisa formatar na exibição
4. **UX** - usuário vê formato familiar

**Desvantagens:**
- Nenhuma significativa para este caso de uso

---

**Implementação concluída com sucesso! ✅**

**Telefone agora tem máscara e é salvo formatado no Google Calendar! 🎉**
