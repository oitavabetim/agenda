"use client";

import { useReservaFormContext } from "./ReservaFormContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ReservaFormFooterProps {
  className?: string;
}

export function ReservaFormFooter({ className = "" }: ReservaFormFooterProps) {
  const {
    state: { isSubmitting },
    actions: { reset },
  } = useReservaFormContext();

  return (
    <div className={`flex items-center justify-end gap-4 ${className}`}>
      <button
        type="button"
        onClick={reset}
        disabled={isSubmitting}
        className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Limpar
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {isSubmitting && <LoadingSpinner size="sm" />}
        {isSubmitting ? "Processando..." : "Reservar"}
      </button>
    </div>
  );
}
