"use client";

import { useState } from "react";
import Image from "next/image";

interface MapaIgrejaProps {
  mapaUrl: string;
  espacosSelecionados?: string[];
  onEspacoClick?: (espacoId: string) => void;
}

export function MapaIgreja({
  mapaUrl,
  espacosSelecionados = [],
  onEspacoClick,
}: MapaIgrejaProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Cabeçalho clicável */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        aria-expanded={isOpen}
        aria-controls="mapa-conteudo"
      >
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mapa da Igreja
        </h4>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Conteúdo colapsável */}
      {isOpen && (
        <div id="mapa-conteudo" className="border-t border-gray-200 p-4 dark:border-gray-700">
          {/* Imagem do mapa */}
          <div className="relative w-full overflow-hidden rounded-lg">
            <Image
              src={mapaUrl}
              alt="Mapa da Igreja - Disposição dos espaços"
              width={1200}
              height={800}
              className="h-auto w-full"
              priority={false}
            />
          </div>

          {/* Legenda de espaços selecionados */}
          {espacosSelecionados.length > 0 && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <p>
                {espacosSelecionados.length} espaço(s) selecionado(s)
              </p>
            </div>
          )}

          {/* Instruções */}
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <p>
              Use o mapa como referência para selecionar os espaços mais
              adequados para sua programação.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
