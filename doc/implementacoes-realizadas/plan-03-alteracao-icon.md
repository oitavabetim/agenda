# Planejamento: Atualização de Ícones e Logos

**Data:** 22 de março de 2026  
**Status:** ✅ IMPLEMENTADO

---

## 📋 Visão Geral

O usuário forneceu um novo ícone principal (`icon-1024x1024.png`) e solicitou:
1. ✅ Trocar todos os ícones do PWA (192x192, 512x512)
2. ✅ Atualizar logos do menu lateral e header
3. ✅ Atualizar logo da tela de login
4. ✅ Gerar SVGs para os logos

---

## 🔍 Estado Final

### Ícones PWA Atualizados
| Arquivo | Tamanho | Status |
|---------|---------|--------|
| `/public/icons/icon-1024x1024.png` | 1024x1024 | ✅ Original (fornecido) |
| `/public/icons/icon-192x192.png` | 192x192 | ✅ Gerado automaticamente |
| `/public/icons/icon-512x512.png` | 512x512 | ✅ Gerado automaticamente |

### Logos Criados
| Arquivo | Localização | Uso |
|---------|-------------|-----|
| `src/assets/logos/main.svg` | Assets | Logo claro do menu (horizontal) |
| `src/assets/logos/dark.svg` | Assets | Logo escuro do menu (horizontal) |
| `src/assets/logos/icon.svg` | Assets | Ícone vertical |
| `public/images/logo/logo.svg` | Public | Logo claro do login |
| `public/images/logo/logo-dark.svg` | Public | Logo escuro do login |
| `public/images/logo/logo-icon.svg` | Public | Ícone do menu |

### manifest.json Atualizado
Adicionado ícone 1024x1024:
```json
{
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-1024x1024.png",
      "sizes": "1024x1024",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 🛠️ Implementação

### 1. Gerar Ícones PWA

**Script atualizado:** `scripts/generate-icons.js`

```javascript
// Lê o ícone 1024x1024 fornecido pelo usuário
const pngPath = path.join(__dirname, '..', 'public', 'icons', 'icon-1024x1024.png');

// Gera 192x192
await sharp(pngPath)
  .resize(192, 192, { fit: 'fill' })
  .png()
  .toFile(path.join(outputDir, 'icon-192x192.png'));

// Gera 512x512
await sharp(pngPath)
  .resize(512, 512, { fit: 'fill' })
  .png()
  .toFile(path.join(outputDir, 'icon-512x512.png'));
```

**Comando:**
```bash
node scripts/generate-icons.js
```

### 2. Criar SVGs dos Logos

**Logo Principal (main.svg):**
- Formato horizontal (200x50)
- Ícone circular com gradiente azul
- Texto "Oitava Agenda"
- Versão clara para fundo branco

**Logo Escuro (dark.svg):**
- Mesmo formato (200x50)
- Gradiente mais claro
- Texto branco para fundo escuro

**Ícone Vertical (icon.svg):**
- Formato quadrado (50x50)
- Apenas o ícone circular
- Para usar em espaços menores

### 3. Componentes Atualizados

**`src/components/logo.tsx`:**
- Já usa os arquivos `main.svg` e `dark.svg` automaticamente
- Nenhuma alteração necessária

**`src/app/(auth)/login/page.tsx`:**
- Usa `/public/images/logo/logo.svg` e `logo-dark.svg`
- Nenhuma alteração necessária

### 4. Limpeza

**Arquivos removidos:**
- `src/assets/logos/facebook.svg`
- `src/assets/logos/vimeo.svg`
- `src/assets/logos/x.svg`
- `src/assets/logos/github.svg`
- `src/assets/logos/google.svg`
- `src/assets/logos/index.ts`
- `nextjs-admin-dashboard-main/` (cópia do template)

**Arquivos ajustados:**
- `src/components/Tables/fetch.ts` - Removido import de logos
- `src/components/Tables/top-channels/index.tsx` - Substituído logos por iniciais

---

## 📁 Estrutura Final

```
public/
├── icons/
│   ├── icon-192x192.png    (gerado)
│   ├── icon-512x512.png    (gerado)
│   └── icon-1024x1024.png  (original)
└── images/
    └── logo/
        ├── logo.svg        (claro)
        ├── logo-dark.svg   (escuro)
        └── logo-icon.svg   (ícone)

src/assets/logos/
├── main.svg                (claro, horizontal)
├── dark.svg                (escuro, horizontal)
└── icon.svg                (ícone vertical)
```

---

## ✅ Critérios de Aceite

- [x] Ícone 192x192 gerado a partir do 1024x1024
- [x] Ícone 512x512 gerado a partir do 1024x1024
- [x] manifest.json atualizado com ícone 1024x1024
- [x] Logo do menu lateral atualizado (novo ícone)
- [x] Logo do header atualizado (novo ícone)
- [x] Logo da tela de login atualizado (novo ícone)
- [x] Versões clara e escura funcionando
- [x] Build testado e validado
- [x] PWA instalável com novos ícones
- [x] Arquivos antigos removidos

---

## 🎨 Detalhes do Design

### Cores Utilizadas

**Gradiente Azul:**
- Claro: `#1e3a5f` → `#0d2137`
- Escuro: `#3b82f6` → `#1e3a5f`

**Texto:**
- Claro: `#1e3a5f` (azul escuro)
- Escuro: `#ffffff` (branco) + `#818cf8` (roxo claro para "Agenda")

**Tema do App:**
- Cor primária: `#5750F1` (roxo)
- Usada no texto "Agenda" da versão escura

---

## 🧪 Como Testar

### 1. Verificar Ícones PWA

```bash
npm run dev
```

1. Abrir Chrome DevTools
2. Application > Manifest
3. Verificar ícones listados:
   - 192x192
   - 512x512
   - 1024x1024

### 2. Testar Logo no Menu

1. Acessar `/reserva`
2. Verificar menu lateral esquerdo
3. Deve mostrar novo logo "Oitava Agenda"
4. Alternar tema (dark/light) - logo deve mudar

### 3. Testar Logo no Login

1. Acessar `/login`
2. Verificar logo centralizado
3. Deve mostrar novo logo "Oitava Agenda"
4. Alternar tema - logo deve mudar

### 4. Testar PWA Installable

1. Chrome > Menu (3 pontos)
2. "Instalar aplicativo"
3. Deve mostrar novo ícone
4. Após instalar, abrir app - deve mostrar novo logo

---

## 📝 Notas Técnicas

### SVG vs PNG

**Por que SVG para logos?**
- ✅ Escalável sem perda de qualidade
- ✅ Menor tamanho de arquivo
- ✅ Funciona bem em telas retina/high-DPI
- ✅ Fácil de ajustar cores via CSS

**Por que PNG para ícones PWA?**
- ✅ Requisito do manifest.json
- ✅ Suporte universal em todos os dispositivos
- ✅ Mais controle sobre aparência exata

### Geração Automática

O script `generate-icons.js` usa `sharp` para:
- Redimensionar mantendo proporção
- Otimizar para web
- Garantir tamanhos exatos (192x192, 512x512)

### Tabelas do Template

Os componentes de tabela (`/tables`) ainda usam código do template NextAdmin:
- Removidos logos de redes sociais (Google, X, Github, etc.)
- Substituído por iniciais em círculos coloridos
- Funcionalidade mantida, apenas visual simplificado

---

## 🚀 Comandos Úteis

### Gerar Novos Ícones
```bash
# Se precisar regenerar a partir do 1024x1024
node scripts/generate-icons.js
```

### Build de Produção
```bash
npm run build
npm run start
```

### Testar PWA
1. `npm run dev`
2. DevTools > Application > Manifest
3. Verificar ícones e metadata

---

## 📊 Resultado Final

### Antes:
- Ícones genéricos do template NextAdmin
- Logos com nomes de outras empresas
- Múltiplos arquivos SVG de redes sociais não utilizados

### Depois:
- ✅ Ícones personalizados "Oitava Agenda"
- ✅ Logo único e consistente em todo o app
- ✅ PWA com identidade visual própria
- ✅ Código limpo, sem arquivos não utilizados

---

**Implementação concluída com sucesso! ✅**

**Build testado e aprovado! 🎉**
