# Plano de Ajuste: Mensagem de Erro Duplicada no Campo de Espaços

## Problema Identificado

Ao submeter o formulário de reserva sem selecionar nenhum espaço, a mensagem **"Selecione pelo menos um espaço"** é exibida **duas vezes**.

## Causa Raiz

A mensagem de erro está sendo renderizada em **dois locais diferentes**:

### 1. Validação do Hook Form (Zod Schema)
- **Arquivo**: `src/lib/validation/reserva.ts` (linha 27)
- **Código**:
  ```typescript
  espacos: z
    .array(z.string())
    .min(1, "Selecione pelo menos um espaço"),
  ```
- **Comportamento**: Quando o formulário é submetido sem espaços selecionados, o Zod retorna este erro e o `react-hook-form` o armazena em `errors.espacos.message`

### 2. Validação Visual no Componente EspacosSelector
- **Arquivo**: `src/components/reserva/espacos-selector.tsx` (linha 115)
- **Código**:
  ```typescript
  {selectedEspacos.length === 0 && (
    <p className="text-sm text-red-600 dark:text-red-400">
      Selecione pelo menos um espaço
    </p>
  )}
  ```
- **Comportamento**: Sempre que `selectedEspacos.length === 0`, a mensagem é exibida, **independentemente** de submissão do formulário

## Conflito

Quando o usuário submete o formulário sem selecionar espaços:
1. O `react-hook-form` executa a validação do schema Zod
2. A validação falha e define `errors.espacos.message`
3. O formulário exibe o erro via `{errors.espacos && (...)}`
4. **Simultaneamente**, o `EspacosSelector` continua exibindo sua mensagem condicional baseada em `selectedEspacos.length === 0`
5. Resultado: **mensagem duplicada**

## Solução Proposta

### Opção Recomendada: Remover Validação Visual do EspacosSelector

**Justificativa**: Com a implementação do `react-hook-form` + Zod, toda a validação deve ser centralizada no schema. A validação visual no componente é redundante e causa o conflito.

#### Ajustes Necessários

**Arquivo**: `src/components/reserva/espacos-selector.tsx`

**Alteração**: Remover a exibição condicional da mensagem de erro quando `selectedEspacos.length === 0`

```typescript
// REMOVER este bloco (linhas ~114-117):
{selectedEspacos.length === 0 && (
  <p className="text-sm text-red-600 dark:text-red-400">
    Selecione pelo menos um espaço
  </p>
)}

// MANTER apenas o feedback positivo:
{selectedEspacos.length > 0 && (
  <p className="text-sm text-green-600 dark:text-green-400">
    {selectedEspacos.length} espaço(s) selecionado(s)
  </p>
)}
```

### Benefícios desta Abordagem

1. **Validação centralizada**: Toda a lógica de validação fica no schema Zod
2. **Consistência**: Mensagens de erro padronizadas em todos os campos
3. **Controle do Hook Form**: O `react-hook-form` gerencia quando exibir erros (após submissão ou conforme configuração)
4. **Sem redundância**: Elimina duplicidade de mensagens
5. **UX melhorada**: O erro só aparece após tentativa de submissão ou quando o campo é tocado (dependendo da configuração de `mode`)

## Tarefas de Implementação

- [ ] **1. Editar `espacos-selector.tsx`**
  - Remover o bloco condicional que exibe erro quando `selectedEspacos.length === 0`
  - Manter apenas o feedback positivo para espaços selecionados

- [ ] **2. Verificar comportamento do formulário**
  - Testar submissão sem espaços selecionados (deve exibir erro **uma única vez**)
  - Testar seleção/deseleção de espaços (não deve exibir erro prematuramente)
  - Testar fluxo completo de reserva

- [ ] **3. Validar integração com Hook Form**
  - Confirmar que `errors.espacos.message` é exibido corretamente
  - Verificar se o erro é limpo ao selecionar um espaço

## Configuração Atual do Hook Form

No arquivo `reserva-form.tsx`:
```typescript
const form = useForm<ReservaFormData>({
  resolver: zodResolver(reservaSchema),
  // ...
  mode: "onSubmit",        // Validação apenas na submissão
  reValidateMode: "onChange", // Revalida a cada mudança após primeira submissão
});
```

Esta configuração está adequada e deve ser mantida.

## Testes Sugeridos

1. **Cenário 1**: Submeter formulário vazio
   - Esperado: Exibir erro "Selecione pelo menos um espaço" **uma única vez**

2. **Cenário 2**: Selecionar um espaço após erro
   - Esperado: Erro deve desaparecer

3. **Cenário 3**: Deselecionar todos os espaços após seleção
   - Esperado: Erro só deve aparecer na próxima submissão (devido ao `mode: "onSubmit"`)

4. **Cenário 4**: Submeter com dados válidos
   - Esperado: Reserva criada com sucesso, sem erros

## Referências

- Arquivo do formulário: `src/components/reserva/reserva-form.tsx`
- Componente de seleção: `src/components/reserva/espacos-selector.tsx`
- Schema de validação: `src/lib/validation/reserva.ts`
- Página: `src/app/(dashboard)/reserva/page.tsx`

---
**Data de criação**: 2026-04-02  
**Status**: Pendente de aprovação
