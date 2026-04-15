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
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
      onClick={handleInstall}
    >
      <DownloadIcon />
      <span className="text-base font-medium">Instalar Aplicativo</span>
    </button>
  );
}
