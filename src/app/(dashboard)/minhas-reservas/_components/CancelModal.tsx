"use client";

import { createPortal } from "react-dom";

interface CancelModalProps {
  isOpen: boolean;
  reserva?: {
    programacao: string;
    espacoNome: string;
    dataFormatada: string;
    horarioInicio: string;
    horarioFim: string;
  };
  isCanceling: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelModal({
  isOpen,
  reserva,
  isCanceling,
  onConfirm,
  onCancel,
}: CancelModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all dark:bg-gray-800">
          {/* Ícone */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Título */}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cancelar Reserva?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Esta ação não pode ser desfeita. O evento será removido do
              calendário.
            </p>
          </div>

          {/* Detalhes da Reserva */}
          {reserva && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {reserva.programacao}
              </h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">Espaço:</span>{" "}
                  {reserva.espacoNome}
                </p>
                <p>
                  <span className="font-medium">Data:</span>{" "}
                  {reserva.dataFormatada}
                </p>
                <p>
                  <span className="font-medium">Horário:</span>{" "}
                  {reserva.horarioInicio} - {reserva.horarioFim}
                </p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isCanceling}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isCanceling}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {isCanceling ? "Cancelando..." : "Confirmar Cancelamento"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
