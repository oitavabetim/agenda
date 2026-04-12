# Plano de Ajuste: Remover Link e Página de Perfil do Usuário

## Problema Identificado

A aplicação possui uma feature de **"Ver perfil"** que não será utilizada no sistema de reserva de espaços da igreja. Esta feature inclui:

1. **Link no dropdown do usuário**: No header, ao clicar na foto do perfil, aparece o link "Ver perfil" que redireciona para `/profile`
2. **Página de perfil completa**: Uma página com funcionalidades de rede social (posts, followers, following, about me, etc.) que não faz sentido para o contexto da aplicação

## Estado Atual

### Link "Ver perfil"
**Arquivo**: `src/components/Layouts/header/user-info/index.tsx`

```typescript
<Link
  href={"/profile"}
  onClick={() => setIsOpen(false)}
  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
>
  <UserIcon />

  <span className="mr-auto text-base font-medium">Ver perfil</span>
</Link>
```

### Página de Perfil
**Localização**: `src/app/profile/`

**Estrutura**:
```
src/app/profile/
├── _components/
│   ├── icons.tsx
│   └── social-accounts.tsx
├── layout.tsx
└── page.tsx
```

**Funcionalidades da página** (não utilizadas):
- Upload de foto de perfil
- Upload de foto de capa
- Estatísticas de rede social (Posts, Followers, Following)
- Seção "About Me" com texto placeholder
- Contas de redes sociais
- Dados hardcoded (nome "Danish Heilium", profissão "Ui/Ux Designer")

## Solução Proposta

### Abordagem: Remoção Completa

Remover tanto o link quanto a página inteira, pois:
1. A aplicação não terá feature de perfil de usuário
2. A página atual é genérica (template de dashboard) com dados placeholder
3. Não há funcionalidade relevante para o sistema de reservas

## Tarefas de Implementação

### Tarefa 1: Remover Link "Ver perfil" do Dropdown

**Arquivo**: `src/components/Layouts/header/user-info/index.tsx`

**Alteração**: Remover o bloco `<Link>` que aponta para `/profile`

**Antes**:
```typescript
<div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
  <Link
    href={"/profile"}
    onClick={() => setIsOpen(false)}
    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
  >
    <UserIcon />

    <span className="mr-auto text-base font-medium">Ver perfil</span>
  </Link>

  <Link
    href={"/admin/configuracoes"}
    onClick={() => setIsOpen(false)}
    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
  >
    <SettingsIcon />

    <span className="mr-auto text-base font-medium">
      Configurações
    </span>
  </Link>
</div>
```

**Depois**:
```typescript
<div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
  <Link
    href={"/admin/configuracoes"}
    onClick={() => setIsOpen(false)}
    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
  >
    <SettingsIcon />

    <span className="mr-auto text-base font-medium">
      Configurações
    </span>
  </Link>
</div>
```

**Nota**: O ícone `UserIcon` pode ser removido dos imports se não for utilizado em outro lugar.

### Tarefa 2: Remover Pasta Completa `/profile`

**Ação**: Deletar diretório `src/app/profile/` inteiro

**Arquivos a remover**:
- `src/app/profile/layout.tsx`
- `src/app/profile/page.tsx`
- `src/app/profile/_components/icons.tsx`
- `src/app/profile/_components/social-accounts.tsx`

**Comando** (executar manualmente se necessário):
```bash
rm -rf src/app/profile
```

### Tarefa 3: Verificar Imports Não Utilizados

**Arquivo**: `src/components/Layouts/header/user-info/index.tsx`

**Verificação**: Checar se `UserIcon` ainda é necessário após remover o link

**Ação**: Se `UserIcon` não for usado em outro lugar, remover do import:

**Antes**:
```typescript
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
```

**Depois** (se não utilizado):
```typescript
import { LogOutIcon, SettingsIcon } from "./icons";
```

## Impacto

### O que será removido
- ✅ Link "Ver perfil" do dropdown do usuário
- ✅ Página `/profile` completa
- ✅ Componentes auxiliares da página de perfil
- ✅ Ícones específicos da página de perfil (se não utilizados)

### O que será mantido
- ✅ Link "Configurações" no dropdown
- ✅ Link "Sair" no dropdown
- ✅ Avatar e informações básicas do usuário no dropdown
- ✅ Demais funcionalidades da aplicação

## Benefícios

1. **Código mais limpo**: Remove código não utilizado
2. **Menos manutenção**: Menos arquivos para manter
3. **UX mais clara**: Usuário não vê links para features inexistentes
4. **Performance marginal**: Menos código para carregar
5. **Consistência**: Interface reflete apenas features reais da aplicação

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Link referenciado em outro lugar | Buscar por `/profile` em todo o código antes de remover |
| Ícone UserIcon usado em outro componente | Verificar imports antes de remover |
| Cache do Next.js manter página | Limpar `.next` após remoção |
| Quebra de build | Testar build após alterações |

## Verificações Pós-Remoção

1. **Buscar referências a `/profile`**:
   ```bash
   grep -r "/profile" src/
   ```

2. **Verificar se UserIcon é usado em outro lugar**:
   ```bash
   grep -r "UserIcon" src/
   ```

3. **Testar dropdown do usuário**:
   - Confirmar que "Configurações" e "Sair" funcionam
   - Confirmar que não há erros no console

4. **Testar build**:
   ```bash
   npm run build
   ```

5. **Limpar cache do Next.js** (se necessário):
   ```bash
   rm -rf .next
   ```

## Testes Sugeridos

1. **Cenário 1**: Clicar na foto do perfil no header
   - Esperado: Dropdown abre sem link "Ver perfil"
   - Esperado: Apenas "Configurações" e "Sair" visíveis

2. **Cenário 2**: Acessar `/profile` diretamente no navegador
   - Esperado: Página 404 (após remoção)

3. **Cenário 3**: Navegar pela aplicação
   - Esperado: Nenhuma quebra de funcionalidade
   - Esperado: Nenhum erro no console

4. **Cenário 4**: Executar build de produção
   - Esperado: Build sem erros

## Referências

- Componente do dropdown: `src/components/Layouts/header/user-info/index.tsx`
- Página de perfil: `src/app/profile/`
- Ícones do dropdown: `src/components/Layouts/header/user-info/icons.tsx`

---
**Data de criação**: 2026-04-02  
**Status**: Implementado
