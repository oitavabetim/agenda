# Plano de Ajuste: Reposicionamento e Accordion do Mapa da Igreja

## Problema Identificado

A seção **"Mapa da Igreja"** atualmente está posicionada **após** a seção "Seleção de Espaços", o que não é ideal para o fluxo do usuário. O usuário deveria ver o mapa **antes** de selecionar os espaços, para usar como referência visual.

Além disso, o mapa ocupa espaço visual significativo e nem sempre o usuário precisa vê-lo. Um comportamento de **accordion** (colapsável) permitiria que o mapa venha minimizado por padrão, expandindo apenas quando o usuário desejar.

## Estado Atual

### Estrutura Atual do Formulário
```
1. Dados da Programação
2. Data e Horário
3. Programação Recorrente
4. Seleção de Espaços
5. Mapa da Igreja ← Posição atual (incorreta)
6. Botões de Submit
```

### Componente Atual (`mapa-igreja.tsx`)
- Exibe placeholder com ícone genérico
- Não carrega imagem real do mapa
- Sempre visível (sem colapso)
- Recebe `espacosSelecionados` como prop

## Solução Proposta

### Nova Estrutura do Formulário
```
1. Dados da Programação
2. Data e Horário
3. Programação Recorrente
4. Mapa da Igreja ← Nova posição (com accordion)
5. Seleção de Espaços
6. Botões de Submit
```

### Comportamento do Accordion

**Estado Inicial**: Mapa **minimizado** (colapsado)

**Interação**:
- Usuário clica no cabeçalho "Mapa da Igreja" → expande
- Clica novamente → minimiza
- Ícone de seta (▼/▲) indica estado atual

**Justificativa**:
- Não polui visualmente o formulário
- Usuário acessa quando precisar de referência visual
- Mantém foco na seleção de espaços

## Tarefas de Implementação

### Tarefa 1: Reimplementar Componente MapaIgreja com Accordion

**Arquivo**: `src/components/reserva/mapa-igreja.tsx`

**Alterações**:
1. Adicionar estado `isOpen` para controlar accordion
2. Implementar botão clicável no cabeçalho
3. Adicionar ícone de seta rotacionável (▼/▲)
4. Carregar imagem real do mapa (`/images/mapa.jpg`)
5. Usar `Image` do Next.js para otimização
6. Manter prop `espacosSelecionados` para legenda

**Estrutura do Componente**:
```typescript
"use client";

import { useState } from "react";
import Image from "next/image";

interface MapaIgrejaProps {
  espacosSelecionados?: string[];
  onEspacoClick?: (espacoId: string) => void;
}

export function MapaIgreja({
  espacosSelecionados = [],
  onEspacoClick,
}: MapaIgrejaProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Cabeçalho clicável */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mapa da Igreja
        </h4>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Conteúdo colapsável */}
      {isOpen && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          {/* Imagem do mapa */}
          <div className="relative w-full overflow-hidden rounded-lg">
            <Image
              src="/images/mapa.jpg"
              alt="Mapa da Igreja - Disposição dos espaços"
              width={1200}
              height={800}
              className="h-auto w-full"
              priority={false}
            />
          </div>

          {/* Legenda de espaços selecionados */}
          {espacosSelecionados.length > 0 && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <p>
                {espacosSelecionados.length} espaço(s) selecionado(s)
              </p>
            </div>
          )}

          {/* Instruções */}
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <p>
              Use o mapa como referência para selecionar os espaços mais
              adequados para sua programação.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Tarefa 2: Reposicionar Componente no Formulário

**Arquivo**: `src/components/reserva/reserva-form.tsx`

**Alteração**: Mover `<MapaIgreja />` de após "Seleção de Espaços" para antes.

**Antes**:
```typescript
{/* Seleção de Espaços */}
<div className="bg-white rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
  <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
    Seleção de Espaços
  </h3>
  <Controller
    name="espacos"
    control={control}
    render={({ field }) => (
      <EspacosSelector
        selectedEspacos={field.value}
        onChange={field.onChange}
        disabled={isSubmitting}
      />
    )}
  />
  {errors.espacos && (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
      {errors.espacos.message}
    </p>
  )}
</div>

{/* Mapa da Igreja */}
<MapaIgreja espacosSelecionados={espacosSelecionados} />
```

**Depois**:
```typescript
{/* Mapa da Igreja */}
<MapaIgreja espacosSelecionados={espacosSelecionados} />

{/* Seleção de Espaços */}
<div className="bg-white rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
  <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
    Seleção de Espaços
  </h3>
  <Controller
    name="espacos"
    control={control}
    render={({ field }) => (
      <EspacosSelector
        selectedEspacos={field.value}
        onChange={field.onChange}
        disabled={isSubmitting}
      />
    )}
  />
  {errors.espacos && (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
      {errors.espacos.message}
    </p>
  )}
</div>
```

### Tarefa 3: Verificar Imagem do Mapa

**Arquivo**: `public/images/mapa.jpg`

**Verificação**:
- Confirmar que a imagem existe e está acessível
- Verificar dimensões e qualidade
- Ajustar `width` e `height` no componente `Image` se necessário

**Nota**: A imagem atual mostra o layout completo da igreja com:
- Templo (lateral esquerda)
- Salas 1-7, A, B
- Salão Social
- Salas de apoio (Coordenação, Pastoral, etc.)

## Detalhes de Implementação

### Estilo do Accordion

**Cabeçalho**:
- Fundo branco/cinza claro
- Hover com leve mudança de cor
- Cursor pointer
- Borda inferior quando expandido

**Animação**:
- Rotação suave da seta (transition-transform)
- Sem animação de altura (simplicidade)

**Acessibilidade**:
- Botão com `type="button"` para evitar submit
- Ícone indicativo de estado (seta)
- Contraste adequado para texto

### Responsividade

- Imagem do mapa: `w-full` com `h-auto` para manter proporção
- Container: sem padding excessivo em mobile
- Texto legível em todos os tamanhos de tela

### Dark Mode

- Bordas: `dark:border-gray-700`
- Fundo: `dark:bg-gray-800`
- Texto: `dark:text-gray-300` / `dark:text-gray-400`
- Hover: `dark:hover:bg-gray-700/50`

## Benefícios

1. **Melhor UX**: Usuário vê mapa antes de selecionar espaços
2. **Referência visual**: Mapa auxilia na escolha dos espaços adequados
3. **Economia de espaço**: Accordion minimizado não polui visualmente
4. **Controle do usuário**: Expande apenas quando necessário
5. **Imagem real**: Substitui placeholder por mapa real da igreja
6. **Fluxo lógico**: Mapa → Seleção (ordem natural de decisão)

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Imagem muito grande | Usar `width`/`height` adequados no Image do Next.js |
| Accordion não intuitivo | Ícone de seta claro + hover visual |
| Performance da imagem | Next.js Image otimiza automaticamente |
| Quebra de layout | Testar em diferentes tamanhos de tela |
| Estado do accordion perdido | Estado local é suficiente (não precisa persistir) |

## Testes Sugeridos

1. **Cenário 1**: Acessar formulário pela primeira vez
   - Esperado: Mapa minimizado, seta apontando para baixo (▼)

2. **Cenário 2**: Clicar no cabeçalho "Mapa da Igreja"
   - Esperado: Mapa expande, seta rotaciona para cima (▲)

3. **Cenário 3**: Clicar novamente
   - Esperado: Mapa minimiza, seta retorna para baixo (▼)

4. **Cenário 4**: Selecionar espaços com mapa aberto
   - Esperado: Legenda atualiza com quantidade de espaços selecionados

5. **Cenário 5**: Verificar ordem das seções
   - Esperado: Recorrência → Mapa → Seleção de Espaços

6. **Cenário 6**: Testar em mobile
   - Esperado: Imagem responsiva, accordion funcional

## Referências

- Componente atual: `src/components/reserva/mapa-igreja.tsx`
- Formulário: `src/components/reserva/reserva-form.tsx`
- Imagem do mapa: `public/images/mapa.jpg`
- Configuração de espaços: `src/config/espacos.ts`

---
**Data de criação**: 2026-04-02  
**Status**: Implementado
