"use client";

import { Switch } from "@/components/FormElements/switch";
import { useReservaFormContext } from "./ReservaFormContext";

export function RecorrenciaToggle() {
  const {
    state: { formData, isSubmitting, errors },
    actions: { updateField },
  } = useReservaFormContext();

  return (
    <div>
      <Switch
        checked={formData.recorrente}
        onChange={(checked) => {
          updateField("recorrente", checked);

          // Limpa os campos de recorrência quando desmarcado
          if (!checked) {
            updateField("recorrenciaTipo", "");
            updateField("recorrenciaDataTermino", "");
          }
        }}
        withIcon
        label="Programação Recorrente?"
        disabled={isSubmitting}
      />

      {/* Erros de recorrência (só quando marcado) */}
      {formData.recorrente && errors.recorrente && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {errors.recorrente.message}
        </p>
      )}
    </div>
  );
}
