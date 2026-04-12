"use client";

import { useReservaFormContext } from "./ReservaFormContext";

interface EspacosSelectorProps {
  disabled?: boolean;
}

export function EspacosSelector({ disabled = false }: EspacosSelectorProps) {
  // Vercel: state-decouple-implementation
  // Componente acessa contexto, não sabe de onde vêm os dados
  // Sem props de selectedEspacos/onChange (era prop drilling)
  const {
    state: { formData },
    actions: { toggleEspaco },
    meta: { espacosDisponiveis },
  } = useReservaFormContext();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Espaços *
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Selecione um ou mais espaços para sua programação
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {espacosDisponiveis.map((espaco) => {
          const isSelected = formData.espacos.includes(espaco.id);

          return (
            <button
              key={espaco.id}
              type="button"
              onClick={() => toggleEspaco(espaco.id)}
              disabled={disabled}
              className={`relative flex flex-col items-start rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    isSelected
                      ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`font-medium ${
                    isSelected
                      ? "text-blue-700 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {espaco.nome}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {espaco.descricao}
              </p>

              {espaco.capacidade && (
                <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  <svg
                    className="mr-1 h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {espaco.capacidade} pessoas
                </span>
              )}
            </button>
          );
        })}
      </div>

      {formData.espacos.length > 0 && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {formData.espacos.length} espaço(s) selecionado(s)
        </p>
      )}
    </div>
  );
}
