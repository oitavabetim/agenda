# Plan 20 — Criação da Página de Termos de Uso

## Contexto

Além da Política de Privacidade, o Google OAuth e boas práticas de aplicações web exigem uma página de **Termos de Uso** (Terms of Service) acessível publicamente. Esta página define as regras, responsabilidades e condições de uso do sistema de reservas.

### Requisitos

- Página acessível publicamente (sem login)
- Mesma estrutura visual da Política de Privacidade (consistência de UI)
- Server Component estático (sem interatividade)
- Regras claras de uso, cancelamento, responsabilidades

---

## Princípios Aplicados (Vercel Best Practices)

### 1. Server Components por Padrão ([react-best-practices](.agents/skills/vercel-react-best-practices/))
- Página **100% estática** — sem `"use client"`, sem hooks
- Renderizada como static content no build

### 2. Route Group Reutilizado ([composition-patterns](.agents/skills/vercel-composition-patterns/))
- Usa o mesmo `(public)` route group criado para a Política de Privacidade
- Reutiliza o `PublicLayout` existente — sem criar layout novo

### 3. Consistência Visual com Página Existente
- Mesma estrutura, espaçamentos, tipografia e dark mode da Política de Privacidade
- Componente espelhado em estrutura — apenas conteúdo muda

### 4. Auth Callback como Gate de Rotas ([state-decouple-implementation](.agents/skills/vercel-composition-patterns/rules/state-decouple-implementation.md))
- Adicionar `/termos-uso` às rotas públicas no callback `authorized`

---

## Plano de Implementação

### Arquivos a Criar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(public)/termos-uso/page.tsx` | **Criar** | Server Component estático com texto completo dos termos de uso |

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/lib/auth/auth.config.ts` | **Modificar** | Adicionar `/termos-uso` como rota pública no callback `authorized` |

---

### Passo 1: Adicionar rota pública no auth callback

**Arquivo:** `src/lib/auth/auth.config.ts`

**Antes:**
```typescript
const isOnPrivacyPage = nextUrl.pathname.startsWith("/politica-privacidade");
const isOnDashboard =
  nextUrl.pathname.startsWith("/") &&
  !isOnAuthPage &&
  !isOnPrivacyPage;

if (isOnPrivacyPage) {
  return true;
}
```

**Depois:**
```typescript
const isOnPrivacyPage = nextUrl.pathname.startsWith("/politica-privacidade");
const isOnTermsPage = nextUrl.pathname.startsWith("/termos-uso");
const isOnDashboard =
  nextUrl.pathname.startsWith("/") &&
  !isOnAuthPage &&
  !isOnPrivacyPage &&
  !isOnTermsPage;

// Páginas públicas não requerem autenticação
if (isOnPrivacyPage || isOnTermsPage) {
  return true;
}
```

---

### Passo 2: Criar página de Termos de Uso

**Arquivo:** `src/app/(public)/termos-uso/page.tsx`

**Server Component estático** — mesma estrutura da Política de Privacidade, conteúdo de termos.

Conteúdo cobrindo:

1. **Aceitação dos Termos** — Ao usar o sistema, concorda com estas regras
2. **Elegibilidade** — Quem pode usar (membros da igreja, autorizados)
3. **Reservas** — Regras de criação, duração mínima, conflitos, cancelamento
4. **Uso dos Espaços** — Responsabilidade, limpeza, danos, devolução
5. **Conteúdo dos Eventos** — Conformidade com valores da igreja
6. **Propriedade Intelectual** — Dados da igreja, uso do sistema
7. **Limitação de Responsabilidade** — O sistema é fornecido "como está"
8. **Disponibilidade** — O sistema pode ficar indisponível para manutenção
9. **Modificações nos Termos** — Como e quando os termos mudam
10. **Rescisão** — Quando o acesso pode ser revogado
11. **Contato** — E-mail do administrador
12. **Lei Aplicável** — Legislação brasileira

```tsx
export default function TermosUsoPage() {
  const atualizacao = "13 de abril de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Termos de Uso
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Última atualização: {atualizacao}
      </p>

      <div className="mt-8 space-y-8 text-gray-700 dark:text-gray-300">
        {/* 12 seções com mesma estrutura da Política de Privacidade */}
      </div>
    </div>
  );
}
```

> **Nota:** A estrutura é **idêntica** à de `politica-privacidade/page.tsx` — mesmo container, mesmos espaçamentos, mesma tipografia, mesmo dark mode. Apenas o conteúdo das seções muda.

---

## Conteúdo Completo da Página

### Seção 1: Aceitação dos Termos

> Ao acessar e utilizar o Sistema de Reserva de Espaços da igreja, você concorda integralmente com estes Termos de Uso. Se não concordar com alguma parte, não utilize o sistema.

### Seção 2: Elegibilidade

- Ser membro ou colaborador autorizado da igreja
- Ter conta Google válida para autenticação
- Ser maior de idade ou ter autorização de responsável legal

### Seção 3: Regras de Reserva

#### 3.1 Criação de Reservas
- Horário final deve ser maior que horário inicial
- Não são permitidas reservas em datas anteriores ao dia atual
- Duração mínima de 30 minutos por reserva
- Janela de reserva: Seg-Qui → próxima semana; Sex-Dom → semana subsequente

#### 3.2 Conflitos
- O sistema verifica disponibilidade automaticamente
- Conflito em qualquer espaço/data aborta **TODA** a reserva (nenhuma reserva parcial é criada)
- Para reservas recorrentes, conflitos em qualquer data abortam todas as ocorrências

#### 3.3 Cancelamento
- O usuário pode cancelar suas próprias reservas pela seção "Minhas Reservas"
- Cancelamentos devem ser feitos com antecedência mínima de 24 horas
- Cancelamentos tardios devem ser comunicados diretamente à administração

#### 3.4 Recorrência
- Reservas recorrentes criam eventos individuais no Google Calendar (não recorrência nativa)
- Tipo de recorrência: semanal ou mensal
- Data de término é obrigatória para reservas recorrentes

### Seção 4: Uso dos Espaços

- O responsável pela reserva é responsável pelo uso adequado do espaço
- Manter limpeza e organização do espaço utilizado
- Comunicar quaisquer danos à administração imediatamente
- Devolver o espaço nas condições em que foi encontrado
- Respeitar horários definidos na reserva
- Não alterar a configuração do espaço sem autorização

### Seção 5: Conteúdo dos Eventos

- Os eventos realizados devem estar em conformidade com os valores e doutrina da igreja
- A igreja reserva-se o direito de recusar ou cancelar reservas cujo conteúdo não esteja em conformidade
- Informações de contato (responsável e telefone) ficam visíveis no descritivo do evento para diáconos e equipe de cozinha

### Seção 6: Propriedade Intelectual

- O sistema de reservas é de uso interno da igreja
- Dados armazenados no Google Calendar são propriedade da igreja
- É proibido copiar, reproduzir ou distribuir dados do sistema sem autorização

### Seção 7: Limitação de Responsabilidade

- O sistema é fornecido &quot;no estado em que se encontra&quot; (as-is)
- A igreja não garante disponibilidade ininterrupta do sistema
- A igreja não se responsabiliza por falhas na integração com Google Calendar
- O usuário é responsável pela precisão das informações fornecidas nas reservas

### Seção 8: Disponibilidade do Sistema

- O sistema pode ficar indisponível para manutenções programadas
- Interrupções não programadas podem ocorrer por causas técnicas ou de infraestrutura
- A igreja se compromete a comunicar interrupções significativas com antecedência quando possível

### Seção 9: Modificações nos Termos

- Estes termos podem ser atualizados periodicamente
- Notificaremos sobre mudanças significativas através de aviso na aplicação ou por e-mail
- O uso continuado do sistema após modificações constitui aceitação dos novos termos

### Seção 10: Rescisão do Acesso

- O acesso ao sistema pode ser revogado em caso de violação destes termos
- Decisões de rescisão são de responsabilidade da administração da igreja
- O usuário pode deixar de usar o sistema a qualquer momento

### Seção 11: Contato

- Para dúvidas sobre estes termos: **[e-mail da igreja]** (placeholder)

### Seção 12: Lei Aplicável

- Estes termos são regidos pelas leis da República Federativa do Brasil
- Foro da comarca da igreja para resolução de disputas

---

## Checklist de Validação

- [ ] Página acessível sem login (`/termos-uso`)
- [ ] Página é Server Component (sem `"use client"`)
- [ ] Reutiliza `PublicLayout` do grupo `(public)`
- [ ] Mesma estrutura visual da Política de Privacidade
- [ ] Conteúdo cobre regras de reserva (RN-01 a RN-05)
- [ ] Conteúdo menciona cancelamento e recorrência
- [ ] Conteúdo limita responsabilidade do sistema
- [ ] Conteúdo informa e-mail de contato
- [ ] Layout responsivo (desktop e mobile, `sm:`, `lg:`)
- [ ] Dark mode funciona (classes `dark:` em todos os elementos)
- [ ] Auth callback permite acesso público
- [ ] Build passa sem erros
- [ ] Google consegue acessar a página para validação OAuth

---

## Riscos e Considerações

| Risco | Mitigação |
|---|---|
| Termos desatualizados | Incluir data de última atualização no topo |
| Regras de negócio mudarem sem atualizar termos | Revisar termos quando RNs forem alteradas |
| Dados de contato desatualizados | Usar placeholder `[e-mail da igreja]` para substituir depois |
| Página não ser acessível publicamente | Auth callback atualizado para incluir `/termos-uso` |

---

## Arquivos de Referência

| Arquivo | Caminho |
|---|---|
| Política de Privacidade (estrutura espelhada) | `src/app/(public)/politica-privacidade/page.tsx` |
| PublicLayout (reutilizado) | `src/app/(public)/layout.tsx` |
| Auth config | `src/lib/auth/auth.config.ts` |
| Regras de negócio | README.md (RN-01 a RN-05) |
| Reserva form context | `src/app/(dashboard)/reserva/_components/ReservaFormContext.tsx` |
| Reserva actions | `src/app/(dashboard)/reserva/_components/actions.ts` |

---

## Regras Vercel Aplicadas

| Regra | Skill | Onde Aplicada |
|---|---|---|
| Server Components por padrão | react-best-practices | Página 100% estática, sem `"use client"` |
| Route Group reuse | composition-patterns | Mesmo `(public)` group, mesmo layout |
| Consistent UI patterns | composition-patterns | Mesma estrutura visual da Política de Privacidade |
| Cheap Condition Before Auth | react-best-practices | Rota pública excluída do `authorized` guard |
