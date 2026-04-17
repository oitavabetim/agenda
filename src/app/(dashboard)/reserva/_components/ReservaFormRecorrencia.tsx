"use client";

import { useReservaFormContext } from "./ReservaFormContext";
import { getTodayInBrazilDateString } from "@/lib/utils/timezone";

export function ReservaFormRecorrencia() {
  const {
    state: { formData, isSubmitting, errors },
    actions: { updateField },
    form: { register },
  } = useReservaFormContext();

  const recorrente = formData.recorrente;

  // Não renderiza se não estiver marcado
  if (!recorrente) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
        Configurações de Recorrência
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Tipo de Recorrência */}
        <div>
          <label
            htmlFor="recorrenciaTipo"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tipo de Recorrência *
          </label>
          <select
            id="recorrenciaTipo"
            {...register("recorrenciaTipo")}
            disabled={isSubmitting}
            onChange={(e) => {
              const value = e.target.value;
              updateField("recorrenciaTipo", value as any);
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
          >
            <option value="">Selecione...</option>
            <option value="semanal">Semanal (toda semana)</option>
            <option value="mensal">Mensal (todo mês)</option>
          </select>
          {errors.recorrenciaTipo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.recorrenciaTipo.message}
            </p>
          )}
        </div>

        {/* Data de Término */}
        <div>
          <label
            htmlFor="recorrenciaDataTermino"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Data de Término *
          </label>
          <input
            type="date"
            id="recorrenciaDataTermino"
            {...register("recorrenciaDataTermino")}
            disabled={isSubmitting}
            min={getTodayInBrazilDateString()}
            onChange={(e) => {
              const value = e.target.value;
              updateField("recorrenciaDataTermino", value);
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
          />
          {errors.recorrenciaDataTermino && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.recorrenciaDataTermino.message}
            </p>
          )}
        </div>
      </div>

      {/* Informações de ajuda */}
      <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
        <div className="flex">
          <svg
            className="h-5 w-5 flex-shrink-0 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              A recorrência <strong>semanal</strong> criará eventos toda{" "}
              <strong>semana</strong> na mesma data, até a data de término
              especificada.
            </p>
            <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
              A recorrência <strong>mensal</strong> criará eventos todo{" "}
              <strong>mês</strong> na mesma data, até a data de término
              especificada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
