"use client";

import {
  createContext,
  ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PWAInstallContextValue = {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | null>;
};

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

function getIsStandalone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const isStandaloneDisplayMode = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;
  const isIOSStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return isStandaloneDisplayMode || isIOSStandalone;
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(getIsStandalone());

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstalled(getIsStandalone());
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt || isInstalled) {
      return null;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    return outcome;
  }, [deferredPrompt, isInstalled]);

  const value = useMemo<PWAInstallContextValue>(
    () => ({
      isInstallable: !isInstalled && deferredPrompt !== null,
      isInstalled,
      promptInstall,
    }),
    [deferredPrompt, isInstalled, promptInstall]
  );

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  const context = use(PWAInstallContext);

  if (!context) {
    throw new Error("usePWAInstall deve ser usado dentro de PWAInstallProvider");
  }

  return context;
}
