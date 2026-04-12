"use client";

import { ReservaListada } from "@/app/(dashboard)/minhas-reservas/actions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface ReservaCardProps {
  reserva: ReservaListada;
  onCancelClick: (reserva: ReservaListada) => void;
}

export function ReservaCard({ reserva, onCancelClick }: ReservaCardProps) {
  const dataEvento = dayjs(reserva.data);
  const ehPassado = dataEvento.isBefore(dayjs());
  const ehHoje = dataEvento.isSame(dayjs(), "day");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-4">
        {/* Ícone/Status */}
        <div className="flex-shrink-0">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              ehPassado
                ? "bg-gray-100 dark:bg-gray-700"
                : "bg-blue-100 dark:bg-blue-900/20"
            }`}
          >
            <svg
              className={`h-6 w-6 ${
                ehPassado
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-blue-600 dark:text-blue-400"
              }`}
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
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {reserva.programacao}
          </h3>

          {/* Espaço */}
          <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
            {reserva.espacoNome}
          </p>

          {/* Data e Horário */}
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
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
              <span>
                {reserva.dataFormatada}
                {ehHoje && " (Hoje)"}
                {ehPassado && " (Passado)"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {reserva.horarioInicio} - {reserva.horarioFim}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-3 flex items-center gap-2">
            {ehPassado ? (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Realizado
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Confirmado
              </span>
            )}

            {!ehPassado && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {dataEvento.fromNow()}
              </span>
            )}
          </div>
        </div>

        {/* Botão Cancelar */}
        {!ehPassado && (
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => onCancelClick(reserva)}
              className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
              title="Cancelar reserva"
              aria-label={`Cancelar reserva de ${reserva.programacao}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
