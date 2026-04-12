"use client";

import { useReservaFormContext } from "./ReservaFormContext";

export function RecorrenciaToggle() {
  const {
    state: { formData, isSubmitting, errors },
    form: { register },
    actions: { updateField },
  } = useReservaFormContext();

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          id="recorrente"
          {...register("recorrente")}
          disabled={isSubmitting}
          onChange={(e) => {
            const checked = e.target.checked;
            updateField("recorrente", checked);
            
            // Limpa os campos de recorrência quando desmarcado
            if (!checked) {
              // Reset manual dos campos via form
            }
          }}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="recorrente"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Programação Recorrente?
        </label>
      </div>

      {/* Erros de recorrência (só quando marcado) */}
      {formData.recorrente && errors.recorrente && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {errors.recorrente.message}
        </p>
      )}
    </div>
  );
}
