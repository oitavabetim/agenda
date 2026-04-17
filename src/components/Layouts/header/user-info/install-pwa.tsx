"use client";

import { useCallback } from "react";
import { usePWAInstall } from "@/components/pwa/pwa-install-context";
import { DownloadIcon } from "./icons";

export function InstallPWA() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  const handleInstall = useCallback(async () => {
    await promptInstall();
  }, [promptInstall]);

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
      onClick={handleInstall}
    >
      <DownloadIcon />
      <span className="text-base font-medium">Instalar Aplicativo</span>
    </button>
  );
}
