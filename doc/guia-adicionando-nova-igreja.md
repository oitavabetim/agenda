# Guia: Configurando Nova Igreja (Deploy Separado)

## 📋 Visão Geral

O sistema foi projetado para que **cada igreja tenha seu próprio deploy** com configurações isoladas:

- Cada igreja = 1 deploy separado (Vercel, Railway, etc.)
- Cada deploy tem seu próprio `.env` com credenciais Google independentes
- Espaços configuráveis por deploy (nomes, quantidades, capacidades)
- Google Calendar próprio por igreja
- Mapa da igreja personalizado

**Princípio:** Nova igreja = **novo deploy + novo `.env`**, sem alterar código.

---

## 🚀 Passo a Passo

### Passo 1: Clonar o Repositório

```bash
git clone <url-do-repositorio> minha-igreja-agenda
cd minha-igreja-agenda
```

### Passo 2: Configurar Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um **novo projeto** para sua igreja (ex: `igreja-sao-paulo-agenda`)
3. Habilite a **Google Calendar API**
4. Crie credenciais **Service Account**:
   - Vá em "APIs & Services" > "Credentials"
   - "Create Credentials" > "Service Account"
   - Anote o **Service Account Email**
5. Gere uma **Private Key** (JSON):
   - Clique na Service Account > "Keys" > "Add Key"
   - Salve o JSON (você precisará do `private_key` e `client_email`)
6. Configure **OAuth 2.0** para login com Google:
   - "OAuth consent screen" > Configure (External ou Internal)
   - "Credentials" > "Create OAuth 2.0 Client ID"
   - Tipo: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (dev)
   - Anote o **Client ID** e **Client Secret**

### Passo 3: Criar Agendas no Google Calendar

1. Acesse [Google Calendar](https://calendar.google.com)
2. Para **cada espaço** da igreja, crie uma agenda separada:
   - "Other calendars" > "+" > "Create new calendar"
   - Nomeie conforme o espaço (ex: "Templo - Igreja São Paulo")
3. Para cada agenda, obtenha o **Calendar ID**:
   - Clique na agenda > "Settings and sharing"
   - Copie o "Calendar ID" (ex: `abc123@group.calendar.google.com`)
4. **Compartilhe** cada agenda com a Service Account:
   - "Share with specific people" > Adicione o email da Service Account
   - Permissão: **"Make changes to events"**

### Passo 4: Preparar Mapa da Igreja

1. Crie uma imagem do mapa da igreja (PNG ou JPG)
2. Nomeie de forma identificável (ex: `mapa-sao-paulo.jpg`)
3. Coloque em `public/images/mapas/`:
   ```
   public/images/mapas/
   └── mapa-sao-paulo.jpg      ← Mapa da sua igreja
   ```

### Passo 5: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Preencha **todas** as variáveis:

```env
# ==========================================
# NEXTAUTH (Autenticação)
# ==========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gerar_com_openssl_rand_base64_32

# ==========================================
# GOOGLE OAUTH (Login com Google)
# ==========================================
GOOGLE_CLIENT_ID=seu_oauth_client_id
GOOGLE_CLIENT_SECRET=seu_oauth_client_secret

# ==========================================
# GOOGLE SERVICE ACCOUNT (Google Calendar API)
# ==========================================
GOOGLE_SERVICE_ACCOUNT_EMAIL=sua-service-account@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_PROJECT_ID=seu-projeto-id

# ==========================================
# CONFIGURAÇÕES DO TENANT
# ==========================================
DEFAULT_TENANT_ID=igreja-sao-paulo

# IDs das agendas do Google Calendar por espaço
CALENDAR_ID_TEMPLO=abc123@group.calendar.google.com
CALENDAR_ID_SALAO_SOCIAL=def456@group.calendar.google.com
CALENDAR_ID_SALA_A=
CALENDAR_ID_SALA_B=
CALENDAR_ID_SALA_01=
CALENDAR_ID_SALA_02=
CALENDAR_ID_SALA_03=
CALENDAR_ID_SALA_04=
CALENDAR_ID_SALA_05=
CALENDAR_ID_SALA_07=
CALENDAR_ID_SALA_APOIO=

# URL do iframe da agenda geral (Google Calendar público)
NEXT_PUBLIC_CALENDAR_IFRAME_URL=https://calendar.google.com/calendar/embed?src=SEU_CALENDAR_ID
```

> **Gerar NEXTAUTH_SECRET:** Execute `openssl rand -base64 32` no terminal

### Passo 6: Configurar Espaços da Igreja

Edite `src/lib/tenant/config.ts` e ajuste o tenant existente:

```typescript
export const TENANTS: Record<string, TenantConfig> = {
  "oitava-betim-agenda": {  // ← Mude o ID para o da sua igreja
    id: "igreja-sao-paulo",  // ← Mesmo valor de DEFAULT_TENANT_ID
    name: "Igreja São Paulo", // ← Nome da sua igreja
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    calendarIframeUrl: process.env.NEXT_PUBLIC_CALENDAR_IFRAME_URL || "",
    mapaUrl: process.env.MAPA_URL || "/images/mapas/mapa-sao-paulo.jpg",
    espacos: [
      {
        id: "templo",
        nome: "Templo",
        descricao: "Espaço principal para cultos",
        capacidade: null,
        calendarId: process.env.CALENDAR_ID_TEMPLO || "",
        ativo: true,
      },
      // Adicione/remova espaços conforme necessário
      // Espaços com calendarId vazio serão ignorados
    ],
  },
};
```

> **Nota:** Você pode adicionar/remover espaços livremente. Espaços com `calendarId` vazio não aparecem no formulário.

### Passo 7: Rodar Localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` e teste o login com Google.

### Passo 8: Deploy

1. Faça deploy da aplicação (Vercel recomendado):
   ```bash
   # Exemplo com Vercel
   vercel --prod
   ```

2. Configure as variáveis de ambiente no painel do provedor de deploy:
   - Vercel: Settings > Environment Variables
   - Railway: Variables tab
   - Outro: conforme documentação do provedor

3. **Importante:** Atualize `NEXTAUTH_URL` para a URL de produção
   - Ex: `NEXTAUTH_URL=https://igreja-sao-paulo.oitavaagenda.com`

4. Adicione a URL de produção no Google OAuth:
   - Google Cloud Console > OAuth 2.0 Client IDs
   - Authorized redirect URIs: `https://sua-url.com/api/auth/callback/google`

---

## 📁 Estrutura de Arquivos

```
src/lib/tenant/
├── tenant-context.tsx    ← Tipos (TenantConfig, EspacoConfig)
└── config.ts             ← Configuração do tenant (ajustar por deploy)

public/images/mapas/
└── mapa-sao-paulo.jpg    ← Mapa da sua igreja

.env.local                ← Suas variáveis (NÃO commitar!)
.env.local.example        ← Template de referência (commitado)
```

---

## 🔍 Checklist de Validação

Após configurar nova igreja, valide:

- [ ] Repositório clonado
- [ ] Google Cloud Console configurado (projeto + Service Account + OAuth)
- [ ] Google Calendar API habilitada
- [ ] Agendas criadas para cada espaço
- [ ] Agendas compartilhadas com Service Account (permissão de edição)
- [ ] Calendar IDs anotados e configurados no `.env.local`
- [ ] Mapa adicionado em `public/images/mapas/`
- [ ] Tenant configurado em `src/lib/tenant/config.ts`
- [ ] `.env.local` preenchido com todas as variáveis
- [ ] Build passando (`npm run build`)
- [ ] Login com Google funcionando localmente
- [ ] Reserva criando eventos no Calendar correto
- [ ] Mapa correto exibido no formulário de reserva
- [ ] Deploy realizado com variáveis de ambiente configuradas
- [ ] `NEXTAUTH_URL` atualizado para URL de produção
- [ ] Redirect URI do Google OAuth atualizado para produção

---

## ⚠️ Pontos de Atenção

### Segurança
- **NUNCA** commite `.env.local` no repositório
- **NUNCA** exponha `GOOGLE_CLIENT_SECRET` ou `GOOGLE_PRIVATE_KEY` no client
- Service Account Private Key deve ser mantida em segredo
- Use variáveis de ambiente do provedor de deploy em produção

### Calendar IDs
- Cada espaço **DEVE** ter uma agenda separada
- Se um espaço não tiver Calendar ID configurado, ele não aparece no formulário
- Não reutilize Calendar IDs entre diferentes deploys

### Mapa
- A imagem deve estar em `public/images/mapas/`
- Use nomes descritivos (ex: `mapa-nome-da-igreja.jpg`)
- Formato recomendado: JPG ou PNG, max 2MB

### Espaços
- Cada deploy pode ter **quantidades e nomes diferentes** de espaços
- O `id` do espaço deve ser único dentro do tenant
- Espaços com `ativo: false` ou `calendarId` vazio não aparecem no formulário

---

## 🐛 Troubleshooting

### "Um ou mais espaços selecionados não estão disponíveis para este tenant"
- Verifique se os espaços estão configurados corretamente no tenant config
- Confirme que `ativo: true` está definido

### "Nenhum calendário configurado"
- Verifique se os Calendar IDs estão preenchidos no `.env.local`
- Confirme que as variáveis de ambiente estão configuradas no deploy

### Mapa não carrega
- Verifique se o arquivo existe em `public/images/mapas/`
- Confirme que `mapaUrl` está correto no tenant config

### Erro de autenticação com Google
- Verifique se a Service Account está compartilhada nas agendas
- Confirme que a Private Key está no formato correto (com `\n` para quebras de linha)
- Verifique que o redirect URI está configurado no Google OAuth

### Erro "NEXTAUTH_URL mismatch"
- Confirme que `NEXTAUTH_URL` corresponde à URL real do deploy
- Em produção, não use `http://localhost:3000`

---

**Última atualização:** 9 de abril de 2026
**Versão:** 2.0
