"use client";

import { useReservaFormContext } from "./ReservaFormContext";
import { EspacosSelector } from "./EspacosSelector";

export function ReservaFormEspacos() {
  const {
    state: { isSubmitting, errors },
  } = useReservaFormContext();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
        Seleção de Espaços
      </h3>
      <EspacosSelector disabled={isSubmitting} />
      {errors.espacos && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {errors.espacos.message}
        </p>
      )}
    </div>
  );
}
