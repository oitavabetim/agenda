# PRD – Sistema de Reserva de Espaços da Igreja

## 1. Visão Geral

### 1.1 Objetivo

Construir uma aplicação web responsiva para **reserva de espaços da igreja**, integrada ao **Google Calendar**, utilizando **SSO com Google**, permitindo reservas simples e recorrentes, com controle de conflitos, notificações e suporte a **multi-tenant (múltiplas igrejas/unidades)**.

A solução deve reduzir complexidade operacional, evitar conflitos de agenda e facilitar a gestão pelas equipes ministeriais.

---

### 1.2 Público-alvo

- Membros da igreja
- Líderes de ministérios
- Coordenadores de eventos

---

### 1.3 Premissas

- Cada **espaço físico = uma agenda no Google Calendar**
- O Google Calendar é a **fonte da verdade** para conflitos e disponibilidade
- Não haverá cadastro dinâmico de espaços (lista fixa por configuração)
- A aplicação será **instalável (PWA)** via `manifest.json`
- Aplicação monolita usando Next.js (App Router) Server Actions (sem REST)

---

## 2. Escopo Funcional

### 2.1 Requisitos Funcionais (RF)

#### RF-01 – Autenticação

- Login via **SSO Google**
- Identificação do usuário por:
  - Nome
  - E-mail
- Após login, redirecionar automaticamente para a **Tela de Reserva**

---

#### RF-02 – Tela de Reserva

Campos obrigatórios:

- Nome da Programação
- Responsável (pré-preenchido com nome do usuário logado)
- Telefone para contato
- Observações
- Data de início
- Horário de início
- Horário de fim
- Checkbox: Programação recorrente?

Campos condicionais (quando recorrente):

- Tipo de recorrência:
  - Semanal
  - Mensal
- Data prevista para término da recorrência

Campos adicionais:

- Seleção múltipla de espaços
- Visualização do mapa da igreja (imagem fornecida)
- Botão **Reservar**

---

#### RF-03 – Lista fixa de espaços

Os espaços devem ser definidos via configuração:

- Templo – Espaço principal para cultos
- Salão Social – Eventos e reuniões
- Sala A – 15 pessoas
- Sala B – 15 pessoas
- Sala 01 – 35 pessoas
- Sala 02 – 15 pessoas
- Sala 03 – 20 pessoas
- Sala 04 – 15 pessoas
- Sala 05 – 15 pessoas
- Sala 07 – 20 pessoas
- Sala Apoio Ministerial – Reuniões ministeriais

---

#### RF-04 – Regra de Reserva (Evento Simples)

Para eventos **sem recorrência**:

1. Para cada espaço selecionado:
   - Consultar a agenda correspondente no Google Calendar
   - Verificar conflitos na mesma data e intervalo de horário
2. Caso **qualquer espaço esteja indisponível**:
   - Abortamento total da reserva
   - Informar ao usuário **quais espaços estão indisponíveis**
3. Caso todos estejam disponíveis:
   - Criar evento individual em cada agenda

---

#### RF-05 – Regra de Reserva (Evento Recorrente)

Para eventos **com recorrência**:

1. Calcular todas as datas futuras com base em:
   - Data inicial
   - Tipo de recorrência (semanal ou mensal)
   - Data final da recorrência
2. Para cada data calculada:
   - Verificar disponibilidade de **todos os espaços**
3. Caso exista conflito em **qualquer data ou espaço**:
   - Abortamento total do processo
   - Informar data(s) e espaço(s) indisponíveis
4. Caso não haja conflitos:
   - Criar **eventos individuais** no Google Calendar (não usar evento recorrente nativo)

Justificativa:

- Permitir cancelamento de ocorrências individuais
- Evitar confirmação manual de exceções no Google Calendar

---

#### RF-06 – Propriedades customizadas no Google Calendar

- Todo evento criado deve conter uma **propriedade customizada**:
  - E-mail do responsável
- Essa propriedade será usada para:
  - Filtrar eventos do usuário logado
  - Listagem de "Minhas Reservas"

---

#### RF-07 – Tela Minhas Reservas

Listar apenas eventos cujo responsável = e-mail do usuário logado

Campos exibidos:

- Nome da programação
- Espaço
- Data
- Horário de início e fim

Ações:

- Botão **Cancelar**
- Modal de confirmação antes do cancelamento

---

#### RF-08 – Tela Visualizar Agenda Geral

- Tela simples
- Incorporação de **iframe do Google Calendar**
- URL do iframe definida via variável de ambiente

---

#### RF-09 – Notificações (OneSignal)

- Integração com OneSignal
- Enviar notificações quando:
  - Evento estiver próximo do horário
- Objetivo:
  - Lembrar o responsável
  - Facilitar cancelamento antecipado

---

#### RF-10 – Suporte Multi-Tenant (Múltiplas Igrejas)

A aplicação deve suportar múltiplas unidades, com configuração isolada por tenant:

- Credenciais Google OAuth
- Chaves Google Calendar
- IDs das agendas
- Iframe da agenda geral
- Configuração de espaços
- Configuração do OneSignal

Isolamento por:

- Subdomínio ou
- Identificador de tenant

---

## 3. Regras de Negócio (RN)

### RN-01 – Validação de horário

- Horário final deve ser maior que o horário inicial

---

### RN-02 – Data mínima

- Não permitir reservas em datas anteriores ao dia atual

---

### RN-03 – Duração mínima

- Reservas devem ter **no mínimo 30 minutos**

---

### RN-04 – Janela permitida para reserva

As reservas devem respeitar a regra de bloqueio baseada no dia atual:

- Segunda a Quinta:
  - Só é permitido reservar a partir da **próxima semana**
- Sexta a Domingo:
  - Só é permitido reservar a partir da **semana subsequente**

Objetivo:

- Garantir tempo hábil para organização das escalas de diáconos e cozinha

Mensagem padrão:

> "Agenda bloqueada para registro de eventos antes do dia X, garantindo que as equipes tenham tempo hábil para se organizar e melhor atender às programações."

---

## 4. Requisitos Não Funcionais (RNF)

### RNF-01 – Responsividade

- Aplicação deve funcionar corretamente em desktop, tablet e celular

---

### RNF-02 – PWA

- `manifest.json` configurado
- Permitir instalação no celular

---

### RNF-03 – Segurança

- Tokens e credenciais Google nunca expostos no client
- Uso exclusivo de variáveis de ambiente no backend

---

### RNF-04 – Performance

- Validações de conflito realizadas no backend
- UI deve exibir feedback de carregamento

---

### RNF-05 – Escalabilidade

- Arquitetura preparada para múltiplos tenants
- Sem dependência de banco de dados no MVP

### RNF-06 – Loadings

- Sempre que uma ação demorada acontecer, mostrar um spinner e congelar para evitar que o usuário fique acionando o botão de ação multiplas vezes.

---

## 5. Fora de Escopo (MVP)

- Gestão de usuários
- Aprovação de reservas
- Relatórios avançados
- Permissões por ministério
- Integração com outros calendários

---

## 6. Critérios de Sucesso

- Usuário consegue reservar múltiplos espaços sem conflitos
- Nenhuma reserva parcial é criada
- Usuário consegue listar e cancelar suas próprias reservas
- Sistema reduz conflitos operacionais da igreja

