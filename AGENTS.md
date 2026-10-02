# Diretrizes do Repositório

## Estrutura do Projeto e Organização de Módulos

Aplicação de reservas usa Next.js, React e TypeScript. Rotas e páginas ficam em `src/app/`; a interface de reserva é co-localizada em `src/app/(dashboard)/reserva/_components/`. Coloque componentes reutilizáveis em `src/components/`, domínio e integrações em `src/lib/` e tipos em `src/types/`. Arquivos PWA e imagens ficam em `public/`; logos, fontes e estilos em `src/assets/`, `src/fonts/` e `src/css/`. PRDs e guias ficam em `doc/`.

## Comandos de Desenvolvimento, Build e Teste

Instale as dependências com `npm install`. Copie `.env.local.example` para `.env.local` e preencha as variáveis locais de Google, NextAuth e tenants; nunca versione `.env.local`.

- `npm run dev` — inicia o servidor de desenvolvimento.
- `npm run lint` — executa as regras ESLint de Core Web Vitals do Next.js.
- `npm run build` — gera o build de produção e valida tipos/build.
- `npm run start` — serve um build de produção concluído.

Ainda não há script de testes automatizados. Em mudanças de comportamento, execute lint e build e teste manualmente datas, conflitos, recorrências e configuração de tenant.

## Estilo de Código e Convenções de Nomes

Escreva TypeScript estrito e use o alias `@/` para importações de `src/`. Siga a convenção existente: quatro espaços, aspas duplas, ponto e vírgula. Formate com Prettier e seu plugin Tailwind para ordenar as classes utilitárias.

Use PascalCase para componentes e seus arquivos (por exemplo, `ReservaFormMapa.tsx`), camelCase para funções e variáveis, e kebab-case para rotas ou ativos. Declare componentes de cliente com `"use client"`; mantenha credenciais e operações do Google Calendar no servidor. Modele validações com Zod em `src/lib/validation/`.

## Commits e Pull Requests

O histórico recente usa resumos concisos e imperativos em português, como `Ajuste normalização datas timezone São Paulo` e `Atualização service work`. Mantenha esse estilo: descreva primeiro a alteração visível ao usuário e preserve um foco por commit.

Pull requests devem explicar o fluxo afetado, impacto em tenant e validações. Vincule a issue ou plano em `doc/` quando houver. Inclua capturas antes/depois em alterações visuais e destaque novas variáveis ou permissões do Google Calendar.

## README, Segurança e Configuração

Considere o [README.md](README.md) como referência obrigatória: mantenha arquitetura, regras de negócio, comandos, documentação e fluxos atualizados e consistentes. Atualize-o quando uma alteração modificar essas informações.

Não exponha tokens ou segredos no cliente, logs, capturas ou commits. Preserve autenticação no servidor e validação Zod em reservas e calendário. Atualize `.env.local.example` e `doc/guia-adicionando-nova-igreja.md` quando a configuração de tenant mudar.
