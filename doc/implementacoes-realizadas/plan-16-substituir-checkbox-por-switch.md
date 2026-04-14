# Plan 16 — Substituir Checkbox por Switch com Ícones

## Contexto

Substituir o checkbox HTML padrão do `RecorrenciaToggle` (formulário de reserva de espaço) pelo componente `Switch` reutilizável do tema (`src-tema`), mantendo toda a lógica existente de recorrência e exibição condicional dos campos.

---

## Análise das Dependências

### Componente Switch Original (`src-tema/components/FormElements/switch.tsx`)

```tsx
import { CheckIcon, XIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useId } from "react";

type PropsType = {
  withIcon?: boolean;
  background?: "dark" | "light";
  backgroundSize?: "sm" | "default";
  name?: string;
};
```

### Mapa de Dependências

| Dependência | Status | Origem |
|---|---|---|
| `clsx` + `tailwind-merge` | ✅ Já instalado | `package.json` |
| `cn` utility | ✅ Já existe | `src/lib/utils.ts` (idêntico ao `src-tema`) |
| `CheckIcon` (SVG check) | ❌ Precisa copiar | `src-tema/assets/icons.tsx` (linhas 130-147) |
| `XIcon` (SVG x) | ❌ Precisa copiar | `src-tema/assets/icons.tsx` (linhas 149-170) |
| `shadow-switcher` | ✅ Já existe | `tailwind.config.ts` linha 292 |
| `shadow-switch-1` | ✅ Já existe | `tailwind.config.ts` linha 294 |
| `shadow-switch-2` | ✅ Já existe | `tailwind.config.ts` linha 295 |
| `useId` (React) | ✅ Nativo | React 19 |

### Nenhuma dependência nova necessária

Todas as bibliotecas (`clsx`, `tailwind-merge`) já estão no `package.json`.

---

## Estado Atual do Formulário de Reserva

### Estrutura de Componentes

```
src/app/(dashboard)/reserva/
├── page.tsx                          # Página principal
├── _components/
│   ├── ReservaFormContext.tsx        # Contexto + react-hook-form
│   ├── ReservaFormCompound.tsx       # Re-exportação compound
│   ├── ReservaFormFrame.tsx          # Container do formulário
│   ├── ReservaFormProgramacao.tsx    # Campo programação
│   ├── ReservaFormDataHorario.tsx    # Data e horário
│   ├── RecorrenciaToggle.tsx         # ← CHECKBOX ATUAL (será substituído)
│   ├── ReservaFormRecorrencia.tsx    # Campos de recorrência (NÃO muda)
│   ├── ReservaFormMapa.tsx           # Mapa
│   ├── ReservaFormEspacos.tsx        # Seleção de espaços
│   └── ReservaFormFooter.tsx         # Botões de ação
```

### `RecorrenciaToggle.tsx` (atual)

- Usa `<input type="checkbox">` HTML padrão
- Classes Tailwind: `h-4 w-4 rounded border-gray-300 text-blue-600`
- Registrado via `register("recorrente")`
- Handler `onChange` chama `updateField("recorrente", checked)`
- Exibe erros quando `formData.recorrente === true`

### `ReservaFormRecorrencia.tsx` (NÃO será alterado)

- Renderização condicional: `if (!recorrente) return null`
- Campo **Tipo de Recorrência**: select com "semanal" e "mensal"
- Campo **Data de Término**: input date
- Informações de ajuda sobre recorrência

### Schema de Validação (`reservaSchema`)

- `recorrente: boolean` (default: `false`)
- `recorrenciaTipo: string` (validado quando recorrente=true)
- `recorrenciaDataTermino: string` (validado quando recorrente=true)

---

## Plano de Implementação

### Arquivos a Criar/Modificar

| Ação | Arquivo | Descrição |
|---|---|---|
| **Criar** | `src/components/FormElements/switch.tsx` | Componente Switch reutilizável |
| **Criar** | `src/components/FormElements/index.ts` | Re-exportação (opcional) |
| **Modificar** | `src/app/(dashboard)/reserva/_components/RecorrenciaToggle.tsx` | Substituir checkbox pelo Switch |

### Passo 1: Criar ícones `CheckIcon` e `XIcon`

**Opção A:** Adicionar ao arquivo existente `src/assets/icons.tsx` (se existir)
**Opção B:** Criar arquivo dedicado `src/components/FormElements/switch-icons.tsx`

Ícones a copiar do `src-tema/assets/icons.tsx`:
- `CheckIcon`: SVG 11x8, checkmark com fillRule/clipRule
- `XIcon`: SVG 11x11, X com clipPath

### Passo 2: Criar componente `Switch`

Adaptar de `src-tema/components/FormElements/switch.tsx` para:

```tsx
// src/components/FormElements/switch.tsx

import { cn } from "@/lib/utils";
import { useId } from "react";
// Importar ícones (definir na etapa 1)
import { CheckIcon, XIcon } from "./switch-icons";

type SwitchProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  withIcon?: boolean;
  background?: "dark" | "light";
  backgroundSize?: "sm" | "default";
  disabled?: boolean;
  name?: string;
  className?: string;
};

export function Switch({
  checked,
  onChange,
  label,
  withIcon,
  background = "light",
  backgroundSize = "default",
  disabled = false,
  name,
  className,
}: SwitchProps) {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label
        htmlFor={id}
        className={cn("flex cursor-pointer select-none items-center", {
          "cursor-not-allowed opacity-50": disabled,
        })}
      >
        <div className="relative">
          <input
            type="checkbox"
            name={name}
            id={id}
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="peer sr-only"
          />
          <div
            className={cn("h-8 w-14 rounded-full bg-gray-3 dark:bg-[#5A616B]", {
              "h-5": backgroundSize === "sm",
              "bg-[#212B36] dark:bg-primary": background === "dark",
            })}
          />

          <div
            className={cn(
              "absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-white shadow-switch-1 transition peer-checked:right-1 peer-checked:translate-x-full peer-checked:[&_.check-icon]:block peer-checked:[&_.x-icon]:hidden",
              {
                "-top-1 left-0 size-7 shadow-switch-2":
                  backgroundSize === "sm",
                "peer-checked:bg-primary peer-checked:dark:bg-white":
                  background !== "dark",
              },
            )}
          >
            {withIcon && (
              <>
                <CheckIcon className="check-icon hidden fill-white dark:fill-dark" />
                <XIcon className="x-icon" />
              </>
            )}
          </div>
        </div>
      </label>
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
}
```

### Passo 3: Modificar `RecorrenciaToggle.tsx`

**Antes:**
```tsx
<input
  type="checkbox"
  id="recorrente"
  {...register("recorrente")}
  onChange={(e) => {
    const checked = e.target.checked;
    updateField("recorrente", checked);
  }}
  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
/>
<label htmlFor="recorrente" className="text-sm font-medium text-gray-700">
  Programação Recorrente?
</label>
```

**Depois:**
```tsx
import { Switch } from "@/components/FormElements/switch";

// ... dentro do componente

<Switch
  checked={formData.recorrente}
  onChange={(checked) => {
    updateField("recorrente", checked);
    // Limpa os campos de recorrência quando desmarcado
    if (!checked) {
      updateField("recorrenciaTipo", "");
      updateField("recorrenciaDataTermino", "");
    }
  }}
  withIcon
  label="Programação Recorrente?"
  disabled={isSubmitting}
/>
```

---

## Checklist de Validação

- [ ] Switch renderiza corretamente (on/off com ícones)
- [ ] Marcar switch exibe `ReservaFormRecorrencia`
- [ ] Desmarcar switch esconde campos e limpa valores
- [ ] Validação Zod continua funcionando
- [ ] Dark mode funciona (cores do switch)
- [ ] Estado disabled funciona (durante submit)
- [ ] Formulário submete corretamente com recorrência
- [ ] Sem erros no console/terminal

---

## Riscos e Considerações

| Risco | Mitigação |
|---|---|
| `CheckIcon`/`XIcon` conflitar com existentes | Usar namespace ou nomes únicos |
| Switch não controlar pelo react-hook-form | Usar props `checked` + `onChange` (controlado) |
| CSS de shadow não aplicado | Verificar `tailwind.config.ts` e classes `shadow-switch-*` |
| Dark mode quebrado | Testar classes `dark:fill-dark`, `dark:bg-primary` |

---

## Arquivos de Referência

| Arquivo | Caminho |
|---|---|
| Switch original | `src-tema/components/FormElements/switch.tsx` |
| Checkbox original | `src-tema/components/FormElements/checkbox.tsx` |
| Ícones (CheckIcon, XIcon) | `src-tema/assets/icons.tsx` |
| Exemplo de uso | `src-tema/app/forms/form-elements/page.tsx` |
| cn utility | `src-tema/lib/utils.ts` → `src/lib/utils.ts` |
| Tailwind shadows | `tailwind.config.ts` (linhas 292-295) |
| RecorrenciaToggle atual | `src/app/(dashboard)/reserva/_components/RecorrenciaToggle.tsx` |
| ReservaFormRecorrencia | `src/app/(dashboard)/reserva/_components/ReservaFormRecorrencia.tsx` |
| ReservaFormContext | `src/app/(dashboard)/reserva/_components/ReservaFormContext.tsx` |
| Schema de validação | `src/lib/validation/reserva.ts` |
