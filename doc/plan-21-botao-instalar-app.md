# Plan 21 — Botão de Instalar App no Dropdown do Perfil

## Contexto

Usuários que ignoram o banner de instalação PWA na primeira visita não têm uma forma fácil de instalar o aplicativo posteriormente. Adicionar um botão **"Instalar Aplicativo"** no dropdown do perfil resolve isso.

### Requisitos

- Botão visível apenas quando:
  - Browser suporta instalação (`beforeinstallprompt` disparado)
  - App **não** está instalado (`display-mode: standalone`)
  - Usuário está logado (dropdown só existe para autenticados)
- Mesmo estilo visual dos itens existentes no dropdown
- Esconder botão após instalação bem-sucedida
- Desktop e mobile responsivo

---

## Princípios Aplicados (Vercel Best Practices)

### 1. Client Component Isolation ([react-best-practices](.agents/skills/vercel-react-best-practices/))
- Criar componente `InstallPWA` como **Client Component** separado (`"use client"`)
- Importado dentro do `UserInfo` (que já é client component)
- Lógica de PWA encapsulada — não polui o componente de user info

### 2. Decoupled State from UI ([composition-patterns](.agents/skills/vercel-composition-patterns/rules/state-decouple-implementation.md))
- Estado de instalação (`deferredPrompt`, `isInstallable`, `isInstalled`) gerenciado dentro do componente
- `UserInfo` não sabe sobre PWA — apenas renderiza o componente

### 3. Avoid Barrel Imports ([bundle-barrel-imports](.agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md))
- Ícones definidos no arquivo de ícones do user-info
- Sem criar barrel file para o componente PWA

### 4. React 19 API ([react19-no-forwardref](.agents/skills/vercel-composition-patterns/rules/react19-no-forwardref.md))
- Sem `forwardRef` — componente simples, sem ref forwarding necessário
- `useState`, `useEffect` padrão

---

## Plano de Implementação

### Arquivos a Criar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/Layouts/header/user-info/install-pwa.tsx` | **Criar** | Client Component com lógica de instalação PWA |

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/Layouts/header/user-info/index.tsx` | **Modificar** | Importar e renderizar `InstallPWA` no dropdown |
| `src/components/Layouts/header/user-info/icons.tsx` | **Modificar** | Adicionar ícone `DownloadIcon` |

---

### Passo 1: Criar ícone de download

**Arquivo:** `src/components/Layouts/header/user-info/icons.tsx`

Adicionar ao final do arquivo:

```tsx
export function DownloadIcon(props: SVGPropsType) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 18 18"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.625.938H6.375c-.621 0-1.138 0-1.556.034-.433.036-.833.114-1.194.3a3.125 3.125 0 00-1.363 1.363c-.186.361-.264.761-.3 1.194C1.928 4.257 1.928 4.774 1.928 5.395v7.21c0 .621 0 1.138.034 1.556.036.433.114.833.3 1.194a3.125 3.125 0 001.363 1.363c.361.186.761.264 1.194.3.418.035.935.035 1.556.035h5.25c.621 0 1.138 0 1.556-.034.433-.036.833-.114 1.194-.3a3.125 3.125 0 001.363-1.363c.186-.361.264-.761.3-1.194.035-.418.035-.935.035-1.556V5.395c0-.621 0-1.138-.034-1.556-.036-.433-.114-.833-.3-1.194a3.125 3.125 0 00-1.363-1.363c-.361-.186-.761-.264-1.194-.3-.418-.035-.935-.035-1.556-.035zM2.99 4.098c.15-.292.39-.532.682-.682.192-.098.436-.163.77-.191.34-.028.785-.028 1.45-.028h5.216c.665 0 1.11 0 1.45.028.335.028.578.093.77.191.293.15.533.39.683.682.098.192.163.436.19.77.029.34.029.785.029 1.45v7.064c0 .665 0 1.11-.028 1.45-.028.335-.093.578-.191.77-.15.293-.39.533-.682.683-.192.098-.436.163-.77.19-.34.029-.785.029-1.45.029H6.892c-.665 0-1.11 0-1.45-.028-.335-.028-.578-.093-.77-.191a1.998 1.998 0 01-.683-.682c-.098-.192-.163-.436-.19-.77-.029-.34-.029-.785-.029-1.45V4.316c0-.665 0-1.11.028-1.45.028-.335.093-.578.191-.77z"
      />
      <path
        d="M9.095 4.005a.563.563 0 01.51.302l2.032 3.508a.562.562 0 01-.973.563L9.5 6.395v5.167a.563.563 0 01-1.125 0V6.395L7.21 8.378a.562.562 0 11-.973-.563l2.032-3.508a.563.563 0 01.51-.302h.316z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.052 12.11a.562.562 0 01.012.795c-.373.396-.822.662-1.325.79-.496.127-1.027.127-1.574.127h-.038c-.547 0-1.078 0-1.574-.127a3.08 3.08 0 01-1.325-.79.562.562 0 11.807-.782c.23.242.503.407.836.492.34.087.733.09 1.325.09s.985-.003 1.325-.09c.333-.085.606-.25.836-.492a.562.562 0 01.795-.012z"
      />
    </svg>
  );
}
```

---

### Passo 2: Criar componente `InstallPWA`

**Arquivo:** `src/components/Layouts/header/user-info/install-pwa.tsx`

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { DownloadIcon } from "./icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Verifica se app já está instalado (standalone mode)
  useEffect(() => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    setIsInstalled(isStandalone);
  }, []);

  // Captura evento beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Escuta mudança de display-mode após instalação
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Não renderiza se já instalado ou não instalável
  if (isInstalled || !isInstallable) return null;

  return (
    <button
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-base text-[#4B5563] hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white"
      onClick={handleInstall}
    >
      <DownloadIcon />
      <span className="text-base font-medium">Instalar Aplicativo</span>
    </button>
  );
}
```

---

### Passo 3: Integrar no UserInfo

**Arquivo:** `src/components/Layouts/header/user-info/index.tsx`

Adicionar import:
```tsx
import { InstallPWA } from "./install-pwa";
```

Adicionar no dropdown, **antes** do botão de Sair:

```tsx
<div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
  <InstallPWA />

  <button
    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
    onClick={() => signOut({ callbackUrl: "/login" })}
  >
    <LogOutIcon />
    <span className="text-base font-medium">Sair</span>
  </button>
</div>
```

---

## Como Funciona o Fluxo

```
1. Usuário abre o app → browser dispara beforeinstallprompt
2. Componente captura evento → salva deferredPrompt no state
3. Componente verifica que NÃO está em standalone → mostra botão
4. Usuário clica "Instalar Aplicativo" → chama prompt()
5. Browser mostra diálogo nativa → usuário confirma
6. App instalado → display-mode muda para standalone
7. Componente esconde botão automaticamente
```

## Critérios para `beforeinstallprompt` Disparar

| Critério | Requerimento |
|---|---|
| Manifest válido | `manifest.json` configurado (já temos) |
| Service Worker | Registrado (Next.js PWA ou manual) |
| HTTPS | Conexão segura (sim em produção) |
| Interação prévia | Usuário interagiu com a página |
| Não instalado | App ainda não está na tela inicial |
| Tempo mínimo | ~30s após carregamento |

> **Nota:** Em desenvolvimento (`localhost`) o evento também dispara. Em iOS Safari, o suporte é limitado — o botão não aparece mas não quebra a UI.

---

## Checklist de Validação

- [ ] Botão aparece apenas quando `beforeinstallprompt` é capturado
- [ ] Botão NÃO aparece se app já está instalado
- [ ] Botão tem mesmo estilo do botão "Sair"
- [ ] Clicar no botão abre diálogo nativo de instalação
- [ ] Após instalação, botão desaparece
- [ ] Dark mode funciona (mesmas classes do botão Sair)
- [ ] Mobile responsivo (mesmo container do dropdown)
- [ ] Sem erro no console se browser não suporta PWA
- [ ] Build passa sem erros
- [ ] Componente é Client Component (`"use client"`)

---

## Riscos e Considerações

| Risco | Mitigação |
|---|---|
| iOS Safari não suporta `beforeinstallprompt` | Botão simplesmente não aparece — sem erro |
| `beforeinstallprompt` não dispara | Verificar manifest.json e service worker |
| Botão aparece em desktop sem suporte | `isInstallable` só fica true se evento for capturado |
| Usuário instala mas botão não some | `display-mode: standalone` listener atualiza estado |
| `deferredPrompt` vaza memory | Cleanup no `useEffect` remove event listener |

---

## Arquivos de Referência

| Arquivo | Caminho |
|---|---|
| UserInfo (modificar) | `src/components/Layouts/header/user-info/index.tsx` |
| UserInfo icons | `src/components/Layouts/header/user-info/icons.tsx` |
| Dropdown component | `src/components/ui/Dropdown.tsx` |
| Manifest | `public/manifest.json` |
| Template (src-tema) | `src-tema/components/Layouts/header/user-info/index.tsx` |

---

## Regras Vercel Aplicadas

| Regra | Skill | Onde Aplicada |
|---|---|---|
| Client Component isolation | react-best-practices | `InstallPWA` separado de `UserInfo` |
| Decouple State from UI | composition-patterns | Estado PWA encapsulado no componente |
| Avoid Barrel Imports | react-best-practices | Import direto de `./install-pwa` |
| React 19 API | composition-patterns | Sem `forwardRef`, hooks padrão |
| Conditional rendering | react-best-practices | Early exit: `if (isInstalled || !isInstallable) return null` |
