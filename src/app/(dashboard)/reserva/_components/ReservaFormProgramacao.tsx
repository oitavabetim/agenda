"use client";

import { useReservaFormContext } from "./ReservaFormContext";
import { formatPhone } from "@/lib/utils/format-phone";

export function ReservaFormProgramacao() {
  const {
    state: { formData, isSubmitting, errors },
    actions: { updateField },
    meta: { usuarioNome },
    form: { register },
  } = useReservaFormContext();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
        Dados da Programação
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Nome da Programação */}
        <div className="md:col-span-2">
          <label
            htmlFor="programacao"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nome da Programação *
          </label>
          <input
            type="text"
            id="programacao"
            {...register("programacao")}
            disabled={isSubmitting}
            placeholder="Ex: Culto de Celebração, Reunião de Jovens..."
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
              errors.programacao
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } dark:bg-gray-700 dark:text-white`}
          />
          {errors.programacao && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.programacao.message}
            </p>
          )}
        </div>

        {/* Responsável */}
        <div>
          <label
            htmlFor="responsavel"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Responsável *
          </label>
          <input
            type="text"
            id="responsavel"
            {...register("responsavel")}
            disabled
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
          />
          {errors.responsavel && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.responsavel.message}
            </p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label
            htmlFor="telefone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Telefone para Contato *
          </label>
          <input
            type="tel"
            id="telefone"
            {...register("telefone")}
            disabled={isSubmitting}
            placeholder="(00) 00000-0000"
            maxLength={15}
            onChange={(e) => {
              const value = formatPhone(e.target.value);
              updateField("telefone", value);
            }}
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
              errors.telefone
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } dark:bg-gray-700 dark:text-white`}
          />
          {errors.telefone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.telefone.message}
            </p>
          )}
        </div>

        {/* Observações */}
        <div className="md:col-span-2">
          <label
            htmlFor="observacoes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Observações
          </label>
          <textarea
            id="observacoes"
            {...register("observacoes")}
            disabled={isSubmitting}
            rows={3}
            placeholder="Informações adicionais sobre a programação..."
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
              errors.observacoes
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } dark:bg-gray-700 dark:text-white`}
          />
          {errors.observacoes && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.observacoes.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
