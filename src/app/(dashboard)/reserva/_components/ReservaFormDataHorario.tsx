"use client";

import { useReservaFormContext } from "./ReservaFormContext";
import { getTodayInBrazilDateString } from "@/lib/utils/timezone";

export function ReservaFormDataHorario() {
  const {
    state: { isSubmitting, errors },
    form: { register },
  } = useReservaFormContext();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
        Data e Horário
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Data de Início */}
        <div>
          <label
            htmlFor="dataInicio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Data de Início *
          </label>
          <input
            type="date"
            id="dataInicio"
            {...register("dataInicio")}
            disabled={isSubmitting}
            min={getTodayInBrazilDateString()}
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
              errors.dataInicio
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } dark:bg-gray-700 dark:text-white`}
          />
          {errors.dataInicio && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.dataInicio.message}
            </p>
          )}
        </div>

        {/* Horário de Início */}
        <div>
          <label
            htmlFor="horarioInicio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Horário de Início *
          </label>
          <input
            type="time"
            id="horarioInicio"
            {...register("horarioInicio")}
            disabled={isSubmitting}
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
              errors.horarioInicio
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } dark:bg-gray-700 dark:text-white`}
          />
          {errors.horarioInicio && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.horarioInicio.message}
            </p>
          )}
        </div>

        {/* Horário de Fim */}
        <div>
          <label
            htmlFor="horarioFim"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Horário de Fim *
          </label>
          <input
            type="time"
            id="horarioFim"
            {...register("horarioFim")}
            disabled={isSubmitting}
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
              errors.horarioFim
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } dark:bg-gray-700 dark:text-white`}
          />
          {errors.horarioFim && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.horarioFim.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
