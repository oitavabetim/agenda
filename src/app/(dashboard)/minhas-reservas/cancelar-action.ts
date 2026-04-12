"use server";

import { auth } from "@/lib/auth";
import { deleteEvent } from "@/lib/google-calendar/events";

export interface CancelarReservaResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Cancela uma reserva (evento no Google Calendar)
 * RF-07: Cancelamento de reserva
 */
export async function cancelarReservaAction(
  calendarId: string,
  eventId: string
): Promise<CancelarReservaResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Deletar evento do Google Calendar
    await deleteEvent(calendarId, eventId);

    return {
      success: true,
      message: "Reserva cancelada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    return {
      success: false,
      error: "Erro ao cancelar reserva. Tente novamente.",
    };
  }
}
