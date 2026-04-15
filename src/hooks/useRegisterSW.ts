import { useEffect } from "react";

/**
 * Hook para registrar o Service Worker da aplicação.
 * Necessário para:
 * - Prompt de instalação PWA (beforeinstallprompt)
 * - Funcionamento offline (quando cache for adicionado)
 *
 * Registro feito após hidratação (useEffect) — não bloqueia render.
 */
export function useRegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[PWA] Service Worker registrado:", registration.scope);
        }
      })
      .catch((error) => {
        console.error("[PWA] Erro ao registrar Service Worker:", error);
      });
  }, []);
}
