"use client";

import { useState } from "react";

interface CalendarIframeProps {
  url?: string;
  height?: string | number;
}

export function CalendarIframe({ url, height = "600px" }: CalendarIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usa URL passada como prop ou variável de ambiente
  const calendarUrl = url || process.env.NEXT_PUBLIC_CALENDAR_IFRAME_URL;

  // Handler para quando o iframe carregar
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handler para erro no carregamento
  const handleError = () => {
    setIsLoading(false);
    setError("Não foi possível carregar o calendário");
  };

  // Se não tiver URL configurada
  if (!calendarUrl) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
        <div>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Calendário não configurado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A URL do calendário não foi configurada nas variáveis de ambiente.
          </p>
          <div className="mt-4 rounded bg-gray-100 p-3 text-left text-xs dark:bg-gray-700">
            <p className="font-medium">Configure no .env.local:</p>
            <code className="block mt-1 text-blue-600 dark:text-blue-400">
              NEXT_PUBLIC_CALENDAR_IFRAME_URL=https://calendar.google.com/...
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Carregando calendário...
            </p>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={calendarUrl}
        style={{ width: "100%", height, border: 0 }}
        frameBorder="0"
        scrolling="no"
        onLoad={handleLoad}
        onError={handleError}
        title="Calendário Geral"
        className="overflow-hidden rounded-lg"
      />
    </div>
  );
}
