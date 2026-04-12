# Plano de Ajuste: Remover Links e Páginas de Configurações

## Problema Identificado

A aplicação possui uma feature de **"Configurações"** que não será utilizada no sistema de reserva de espaços da igreja. Esta feature inclui:

1. **Link no dropdown do usuário**: No header, ao clicar na foto do perfil, aparece o link "Configurações" que redireciona para `/admin/configuracoes`
2. **Link no menu lateral**: Na sidebar, sob a seção "ADMINISTRAÇÃO", existe o item "Configurações"
3. **Página de configurações**: Uma página em `/admin/configuracoes` que exibe informações do tenant, espaços e integrações
4. **Página de settings genérica**: Uma página em `/pages/settings` (template de dashboard) com formulários de perfil

## Estado Atual

### Link no Dropdown do Usuário
**Arquivo**: `src/components/Layouts/header/user-info/index.tsx`

```typescript
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
```

### Link no Menu Lateral (Sidebar)
**Arquivo**: `src/components/Layouts/sidebar/data/index.ts`

```typescript
{
  label: "ADMINISTRAÇÃO",
  items: [
    {
      title: "Configurações",
      url: "/admin/configuracoes",
      icon: Icons.Settings,
      items: [],
    },
  ],
}
```

### Página de Configurações
**Localização**: `src/app/(dashboard)/admin/configuracoes/`

**Estrutura**:
```
src/app/(dashboard)/admin/configuracoes/
└── page.tsx
```

**Funcionalidades da página**:
- Informações do tenant (nome, ID)
- Lista de espaços disponíveis (tabela)
- Seção de integrações (Google Calendar, OneSignal)
- Dados estáticos/hardcoded

### Página de Settings Genérica
**Localização**: `src/app/pages/settings/`

**Estrutura**:
```
src/app/pages/settings/
├── _components/
│   ├── personal-info.tsx
│   └── upload-photo.tsx
└── page.tsx
```

**Funcionalidades da página**:
- Formulário de informações pessoais
- Upload de foto
- Componentes genéricos de template de dashboard

## Solução Proposta

### Abordagem: Remoção Completa

Remover todos os links e páginas relacionadas a configurações, pois:
1. A aplicação não terá feature de configurações administrativas
2. As páginas atuais são genéricas (templates de dashboard) com dados placeholder
3. Não há funcionalidade relevante para o sistema de reservas no MVP
4. Informações de tenant e espaços são configuradas via código/variáveis de ambiente

## Tarefas de Implementação

### Tarefa 1: Remover Link "Configurações" do Dropdown

**Arquivo**: `src/components/Layouts/header/user-info/index.tsx`

**Alteração**: Remover o bloco `<Link>` que aponta para `/admin/configuracoes` e o import de `SettingsIcon`

**Antes**:
```typescript
import { LogOutIcon, SettingsIcon } from "./icons";

// ...

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

**Depois**:
```typescript
import { LogOutIcon } from "./icons";

// ...

{/* Remover seção inteira do div que continha o link */}
```

**Nota**: Remover também o `<hr>` que separava esta seção do botão "Sair" se ficar órfão.

### Tarefa 2: Remover Link "Configurações" do Menu Lateral

**Arquivo**: `src/components/Layouts/sidebar/data/index.ts`

**Alteração**: Remover a seção "ADMINISTRAÇÃO" inteira ou apenas o item "Configurações"

**Antes**:
```typescript
{
  label: "ADMINISTRAÇÃO",
  items: [
    {
      title: "Configurações",
      url: "/admin/configuracoes",
      icon: Icons.Settings,
      items: [],
    },
  ],
}
```

**Depois**:
```typescript
// Remover seção ADMINISTRAÇÃO inteira (se não houver outros itens)
// OU deixar array vazio se a estrutura exigir
```

**Nota**: Se a seção "ADMINISTRAÇÃO" ficar vazia, remover a seção inteira do `NAV_DATA`.

### Tarefa 3: Remover Pasta `/admin/configuracoes`

**Ação**: Deletar diretório `src/app/(dashboard)/admin/configuracoes/` inteiro

**Arquivos a remover**:
- `src/app/(dashboard)/admin/configuracoes/page.tsx`

**Comando**:
```bash
rm -rf src/app/(dashboard)/admin/configuracoes
```

### Tarefa 4: Remover Pasta `/pages/settings`

**Ação**: Deletar diretório `src/app/pages/settings/` inteiro

**Arquivos a remover**:
- `src/app/pages/settings/page.tsx`
- `src/app/pages/settings/_components/personal-info.tsx`
- `src/app/pages/settings/_components/upload-photo.tsx`

**Comando**:
```bash
rm -rf src/app/pages/settings
```

### Tarefa 5: Limpar Imports Não Utilizados

**Arquivo**: `src/components/Layouts/header/user-info/index.tsx`

**Verificação**: Remover `SettingsIcon` dos imports

**Arquivo**: `src/components/Layouts/sidebar/data/index.ts`

**Verificação**: Remover `Icons.Settings` dos imports se não for usado em outro lugar

## Impacto

### O que será removido
- ✅ Link "Configurações" do dropdown do usuário
- ✅ Link "Configurações" do menu lateral (sidebar)
- ✅ Página `/admin/configuracoes` completa
- ✅ Página `/pages/settings` completa
- ✅ Componentes auxiliares de settings
- ✅ Seção "ADMINISTRAÇÃO" do menu lateral (se vazia)

### O que será mantido
- ✅ Link "Sair" no dropdown
- ✅ Avatar e informações básicas do usuário no dropdown
- ✅ Demais itens do menu lateral (Reservar Espaço, Minhas Reservas, Agenda Geral)
- ✅ Demais funcionalidades da aplicação

## Benefícios

1. **Código mais limpo**: Remove código não utilizado
2. **Menos manutenção**: Menos arquivos para manter
3. **UX mais clara**: Usuário não vê links para features inexistentes
4. **Interface simplificada**: Menu lateral mais enxuto
5. **Consistência**: Interface reflete apenas features reais da aplicação
6. **Performance marginal**: Menos código para carregar

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Links referenciados em outro lugar | Buscar por `/admin/configuracoes` e `/pages/settings` em todo o código |
| Ícone Settings usado em outro componente | Verificar imports antes de remover |
| Cache do Next.js manter páginas | Limpar `.next` após remoção |
| Quebra de build | Testar build após alterações |
| Seção ADMINISTRAÇÃO vazia causar erro | Remover seção inteira do NAV_DATA |

## Verificações Pós-Remoção

1. **Buscar referências a `/admin/configuracoes`**:
   ```bash
   grep -r "/admin/configuracoes" src/
   ```

2. **Buscar referências a `/pages/settings`**:
   ```bash
   grep -r "pages/settings" src/
   ```

3. **Verificar se Icons.Settings é usado em outro lugar**:
   ```bash
   grep -r "Icons.Settings" src/
   ```

4. **Testar navegação**:
   - Confirmar que dropdown do usuário tem apenas "Sair"
   - Confirmar que menu lateral tem apenas itens de reservas
   - Confirmar que não há erros no console

5. **Testar build**:
   ```bash
   npm run build
   ```

6. **Limpar cache do Next.js** (se necessário):
   ```bash
   rm -rf .next
   ```

## Testes Sugeridos

1. **Cenário 1**: Clicar na foto do perfil no header
   - Esperado: Dropdown abre sem link "Configurações"
   - Esperado: Apenas "Sair" visível

2. **Cenário 2**: Verificar menu lateral
   - Esperado: Seção "ADMINISTRAÇÃO" removida ou vazia
   - Esperado: Apenas seção "RESERVAS" visível

3. **Cenário 3**: Acessar `/admin/configuracoes` diretamente no navegador
   - Esperado: Página 404 (após remoção)

4. **Cenário 4**: Acessar `/pages/settings` diretamente no navegador
   - Esperado: Página 404 (após remoção)

5. **Cenário 5**: Navegar pela aplicação
   - Esperado: Nenhuma quebra de funcionalidade
   - Esperado: Nenhum erro no console

6. **Cenário 6**: Executar build de produção
   - Esperado: Build sem erros

## Estrutura do Menu Após Remoção

### Menu Lateral (Sidebar)
```
RESERVAS
├── Reservar Espaço (/reserva)
├── Minhas Reservas (/minhas-reservas)
└── Agenda Geral (/agenda-geral)

[ADMINISTRAÇÃO - removida]
```

### Dropdown do Usuário
```
[Avatar + Nome + Email]
───────────────────────
Sair
```

## Referências

- Dropdown do usuário: `src/components/Layouts/header/user-info/index.tsx`
- Dados do menu lateral: `src/components/Layouts/sidebar/data/index.ts`
- Página de configurações: `src/app/(dashboard)/admin/configuracoes/page.tsx`
- Página de settings: `src/app/pages/settings/page.tsx`
- Componentes de settings: `src/app/pages/settings/_components/`
- Ícones do header: `src/components/Layouts/header/user-info/icons.tsx`
- Ícones da sidebar: `src/components/Layouts/sidebar/icons.tsx`

---
**Data de criação**: 2026-04-02  
**Status**: Pendente de aprovação
