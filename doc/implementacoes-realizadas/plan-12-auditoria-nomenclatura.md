# Auditoria de Nomenclatura - Fase 1.4

## Status

Auditoria realizada em todo o diretório `src/`

---

## Componentes (devem ser PascalCase)

| Arquivo Atual | Deve Ser | Localização |
|---------------|----------|-------------|
| `logo.tsx` | `Logo.tsx` | `src/components/` |
| `period-picker.tsx` | `PeriodPicker.tsx` | `src/components/` |
| `dropdown.tsx` | `Dropdown.tsx` | `src/components/ui/` |
| `skeleton.tsx` | `Skeleton.tsx` | `src/components/ui/` |
| `table.tsx` | `Table.tsx` | `src/components/ui/` |
| `button.tsx` | `Button.tsx` | `src/components/ui-elements/` |
| `checkbox.tsx` | `Checkbox.tsx` | `src/components/FormElements/` |
| `radio.tsx` | `Radio.tsx` | `src/components/FormElements/` |
| `select.tsx` | `Select.tsx` | `src/components/FormElements/` |
| `switch.tsx` | `Switch.tsx` | `src/components/FormElements/` |
| `dashboard-layout.tsx` | `DashboardLayout.tsx` | `src/components/Layouts/` |
| `showcase-section.tsx` | `ShowcaseSection.tsx` | `src/components/Layouts/` |
| `LoadingSpinner.tsx` | ✅ Correto | `src/components/ui/` |

---

## Hooks (devem ser camelCase com prefixo `use`)

| Arquivo Atual | Deve Ser |
|---------------|----------|
| `use-click-outside.ts` | `useClickOutside.ts` |
| `use-mobile.ts` | `useMobile.ts` |

---

## Nomes de Pastas (devem ser kebab-case)

| Pasta Atual | Deve Ser |
|-------------|----------|
| `src/components/FormElements` | `src/components/form-elements` |
| `src/components/CalenderBox` | `src/components/calendar-box` (typo: "Calender" → "Calendar") |
| `src/components/Charts` | `src/components/charts` |
| `src/components/Tables` | `src/components/tables` |
| `src/components/Auth` | `src/components/auth` |
| `src/components/Breadcrumbs` | `src/components/breadcrumbs` |
| `src/components/Checkboxes` | `src/components/form-elements/checkboxes` |
| `src/components/DatePicker` | `src/components/form-elements/date-picker` |
| `src/components/InputGroup` | `src/components/form-elements/input-group` |
| `src/components/Switchers` | `src/components/form-elements/switchers` |

---

## Serviços

| Arquivo Atual | Deve Ser |
|---------------|----------|
| `charts.services.ts` | `chart-service.ts` ou `charts.service.ts` |

---

## ✅ O que está correto

- **Utils**: `format-phone.ts`, `timezone.ts`, `format-message-time.ts`, `format-number.ts` ✅ (kebab-case)
- **Config**: `espacos.ts` ✅ (camelCase)
- **Types**: `reserva.ts`, `google-calendar.ts`, `icon-props.ts` ✅ (camelCase)
- **Lib**: `utils.ts` ✅ (aceitável para arquivo genérico)
- **App routes**: `(dashboard)`, `(auth)`, `agenda-geral`, `minhas-reservas` ✅ (convenções Next.js)

---

## 📊 Resumo da Auditoria

| Categoria | Total | Corretos | Incorretos |
|-----------|-------|----------|------------|
| Componentes | 13 | 1 | 12 |
| Hooks | 2 | 0 | 2 |
| Pastas | 10 | 4 | 6 |
| Serviços | 1 | 0 | 1 |

**Total de ajustes necessários**: ~21 arquivos/pastas

---

**Data de criação**: 2026-04-02  
**Referência**: `plan-12-revisao-arquitetura.md` - Fase 1.4
