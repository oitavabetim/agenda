"use client";

import { useState, useTransition } from "react";
import { ReservaListada } from "../actions";
import { ReservaCard } from "./ReservaCard";
import { CancelModal } from "./CancelModal";
import { cancelarReservaAction } from "../cancelar-action";

// Componente Client - recebe dados do Server Component
export function MinhasReservasClient({
  initialReservas,
}: {
  initialReservas: ReservaListada[];
}) {
  const [isPending, startTransition] = useTransition();
  const [reservas, setReservas] = useState<ReservaListada[]>(initialReservas);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] =
    useState<ReservaListada | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Abrir modal de cancelamento
  const handleCancelClick = (reserva: ReservaListada) => {
    setReservaSelecionada(reserva);
    setModalOpen(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setReservaSelecionada(null);
  };

  // Confirmar cancelamento
  const handleConfirmCancel = () => {
    if (!reservaSelecionada) return;

    startTransition(async () => {
      try {
        setIsCanceling(true);
        const result = await cancelarReservaAction(
          reservaSelecionada.calendarId,
          reservaSelecionada.eventId
        );

        if (result.success) {
          setFeedback({
            type: "success",
            message: result.message || "Reserva cancelada com sucesso",
          });
          // Remover reserva da lista
          setReservas((prev) =>
            prev.filter((r) => r.eventId !== reservaSelecionada.eventId)
          );
          handleCloseModal();
        } else {
          setFeedback({
            type: "error",
            message: result.error || "Erro ao cancelar reserva",
          });
        }
      } catch (err) {
        setFeedback({
          type: "error",
          message: "Erro ao cancelar reserva",
        });
      } finally {
        setIsCanceling(false);
      }
    });
  };

  return (
    <div className="max-w-full">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Minhas Reservas
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Visualize e gerencie todas as suas reservas de espaços
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          <p className="text-sm font-medium">{feedback.message}</p>
        </div>
      )}

      {/* Lista de Reservas */}
      {reservas.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Nenhuma reserva encontrada
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Você ainda não possui reservas. Que tal criar uma agora?
          </p>
          <div className="mt-6">
            <a
              href="/reserva"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nova Reserva
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">
                {reservas.length}
              </span>{" "}
              reserva(s) encontrada(s)
            </p>
          </div>

          <div className="space-y-4">
            {reservas.map((reserva) => (
              <ReservaCard
                key={reserva.eventId}
                reserva={reserva}
                onCancelClick={handleCancelClick}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal de Cancelamento */}
      <CancelModal
        isOpen={modalOpen}
        reserva={
          reservaSelecionada
            ? {
                programacao: reservaSelecionada.programacao,
                espacoNome: reservaSelecionada.espacoNome,
                dataFormatada: reservaSelecionada.dataFormatada,
                horarioInicio: reservaSelecionada.horarioInicio,
                horarioFim: reservaSelecionada.horarioFim,
              }
            : undefined
        }
        isCanceling={isCanceling}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseModal}
      />
    </div>
  );
}
