import { getCalendarClient } from ".";
import { CheckAvailabilityParams, GoogleCalendarAvailability } from "@/types/google-calendar";

/**
 * Verifica disponibilidade de um espaço em um determinado horário
 * RF-04: Validação de reserva simples
 */
export async function checkAvailability(
  params: CheckAvailabilityParams
): Promise<GoogleCalendarAvailability> {
  const { calendarId, startDateTime, endDateTime } = params;

  try {
    const calendar = getCalendarClient();

    // Busca eventos no período especificado
    const response = await calendar.events.list({
      calendarId,
      timeMin: startDateTime,
      timeMax: endDateTime,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    if (events.length === 0) {
      return { available: true };
    }

    // Há conflitos
    return {
      available: false,
      conflicts: events.map((event) => ({
        eventId: event.id || "",
        summary: event.summary || "Evento sem título",
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
      })),
    };
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    throw new Error("Não foi possível verificar a disponibilidade do espaço");
  }
}

/**
 * Verifica disponibilidade para múltiplos espaços e múltiplas datas
 * Usado para reservas recorrentes (RF-05)
 */
export async function checkBulkAvailability(
  params: {
    calendarId: string;
    startDateTime: string;
    endDateTime: string;
  }[]
): Promise<{ available: boolean; conflicts?: Array<{ calendarId: string; date: string; conflicts: GoogleCalendarAvailability }> }> {
  const results = await Promise.all(
    params.map((check) =>
      checkAvailability(check).then((result) => ({
        calendarId: check.calendarId,
        date: check.startDateTime,
        result,
      }))
    )
  );

  const conflicts = results
    .filter((r) => !r.result.available)
    .map((r) => ({
      calendarId: r.calendarId,
      date: r.date,
      conflicts: r.result,
    }));

  if (conflicts.length > 0) {
    return { available: false, conflicts };
  }

  return { available: true };
}
