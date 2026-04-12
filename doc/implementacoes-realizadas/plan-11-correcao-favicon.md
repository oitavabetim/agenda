# Plano de Correção: Favicon Não Aparece

## Problema Identificado

O favicon não está sendo exibido porque `favicon.png` **não é uma convenção suportada** pelo Next.js App Router.

Analisando o HTML gerado, não há nenhuma tag `<link rel="icon">` sendo injetada, confirmando que o Next.js não detectou o arquivo.

## Convenções Válidas do Next.js App Router

O Next.js suporta automaticamente os seguintes arquivos na raiz de `app/`:

| Arquivo | Descrição |
|---------|-----------|
| `favicon.ico` | Favicon tradicional (ICO) |
| `icon.png` | Ícone PNG (gera favicon automaticamente) |
| `icon.ico` | Ícone ICO |
| `apple-icon.png` | Apple Touch Icon |

**`favicon.png` NÃO é suportado** - por isso não funcionou.

## Solução

### Renomear `favicon.png` para `icon.png`

**Arquivo atual**: `src/app/favicon.png`
**Novo nome**: `src/app/icon.png`

O Next.js detectará automaticamente `icon.png` e:
1. Gerará o favicon.ico automaticamente
2. Criará tags `<link rel="icon">` no `<head>`
3. Gerará Apple Touch Icons

## Tarefas

### Tarefa 1: Renomear arquivo

**Comando**:
```bash
ren src\app\favicon.png icon.png
```

### Tarefa 2: Reiniciar servidor

Parar e reiniciar o servidor de desenvolvimento para que o Next.js detecte o novo arquivo.

### Tarefa 3: Verificar

Acessar `http://localhost:3000` e confirmar que:
- Favicon aparece na aba do navegador
- Tag `<link rel="icon" href="/icon?...">` existe no HTML

## Referências

- Documentação Next.js: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
- Arquivo: `src/app/favicon.png` → `src/app/icon.png`

---
**Data de criação**: 2026-04-02  
**Status**: Pendente de aprovação
