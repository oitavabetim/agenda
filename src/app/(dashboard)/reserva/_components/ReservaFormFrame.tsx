"use client";

import { ReactNode } from "react";
import { useReservaFormContext } from "./ReservaFormContext";

interface ReservaFormFrameProps {
  children: ReactNode;
  className?: string;
}

export function ReservaFormFrame({ children, className = "" }: ReservaFormFrameProps) {
  const {
    state: { isSubmitting, isSubmitSuccessful, errors },
    actions: { submit },
  } = useReservaFormContext();

  // Erro do servidor (root error)
  const serverError = errors.root?.message;

  return (
    <form onSubmit={submit} className={`space-y-6 ${className}`} noValidate>
      {/* Feedback de Erro do Servidor */}
      {serverError && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      {/* Feedback de Sucesso */}
      {isSubmitSuccessful && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <p className="text-sm font-medium">
            ✓ Reserva criada com sucesso!
          </p>
        </div>
      )}

      {children}
    </form>
  );
}
