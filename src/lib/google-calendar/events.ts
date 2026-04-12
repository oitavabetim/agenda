import { getCalendarClient } from ".";
import { CreateEventParams, GoogleCalendarEvent } from "@/types/google-calendar";

/**
 * Cria um evento no Google Calendar com propriedades customizadas
 * RF-06: Propriedades customizadas (email do responsável)
 */
export async function createEvent(
  params: CreateEventParams
): Promise<GoogleCalendarEvent> {
  const {
    calendarId,
    summary,
    description,
    startDateTime,
    endDateTime,
    responsibleEmail,
    timezone = "America/Sao_Paulo",
  } = params;

  try {
    const calendar = getCalendarClient();

    const event = {
      summary,
      description: description || "",
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone,
      },
      extendedProperties: {
        private: {
          responsibleEmail,
          createdBy: "oitava-igreja-agenda",
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return {
      id: response.data.id || "",
      summary: response.data.summary || "",
      description: response.data.description || undefined,
      start: response.data.start as GoogleCalendarEvent["start"],
      end: response.data.end as GoogleCalendarEvent["end"],
      extendedProperties: response.data.extendedProperties || undefined,
      created: response.data.created || "",
      updated: response.data.updated || "",
      status: response.data.status || undefined,
    };
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw new Error("Não foi possível criar o evento no calendário");
  }
}

/**
 * Cancela/deleta um evento do Google Calendar
 */
export async function deleteEvent(
  calendarId: string,
  eventId: string
): Promise<void> {
  try {
    const calendar = getCalendarClient();

    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error) {
    console.error("Erro ao cancelar evento:", error);
    throw new Error("Não foi possível cancelar o evento");
  }
}

/**
 * Lista eventos de um calendário filtrados por email do responsável
 * RF-07: Listar eventos do usuário logado
 */
export async function listEventsByUser(
  calendarId: string,
  userEmail: string,
  options?: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
  }
): Promise<GoogleCalendarEvent[]> {
  try {
    const calendar = getCalendarClient();

    const response = await calendar.events.list({
      calendarId,
      timeMin: options?.timeMin?.toISOString(),
      timeMax: options?.timeMax?.toISOString(),
      maxResults: options?.maxResults || 250,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // Tipagem para eventos da API do Google Calendar
    type CalendarEventItem = {
      id?: string | null;
      summary?: string | null;
      description?: string | null;
      start?: { dateTime?: string; date?: string; timeZone?: string } | null;
      end?: { dateTime?: string; date?: string; timeZone?: string } | null;
      extendedProperties?: {
        private?: Record<string, string>;
        shared?: Record<string, string>;
      } | null;
      created?: string | null;
      updated?: string | null;
      status?: string | null;
    };

    // Filtra eventos pelo email do responsável (extendedProperties)
    return (events as CalendarEventItem[])
      .filter(
        (event) =>
          event.extendedProperties?.private?.responsibleEmail === userEmail
      )
      .map(
        (event) =>
          ({
            id: event.id || "",
            summary: event.summary || "",
            description: event.description,
            start: event.start as GoogleCalendarEvent["start"],
            end: event.end as GoogleCalendarEvent["end"],
            extendedProperties: event.extendedProperties,
            created: event.created || "",
            updated: event.updated || "",
            status: event.status,
          }) as GoogleCalendarEvent
      );
  } catch (error) {
    console.error("Erro ao listar eventos:", error);
    return [];
  }
}

/**
 * Lista todos os eventos de um período (para agenda geral)
 */
export async function listAllEvents(
  calendarId: string,
  options?: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
  }
): Promise<GoogleCalendarEvent[]> {
  try {
    const calendar = getCalendarClient();

    const response = await calendar.events.list({
      calendarId,
      timeMin: options?.timeMin?.toISOString(),
      timeMax: options?.timeMax?.toISOString(),
      maxResults: options?.maxResults || 250,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // Tipagem para eventos da API do Google Calendar
    type CalendarEventItem = {
      id?: string | null;
      summary?: string | null;
      description?: string | null;
      start?: { dateTime?: string; date?: string; timeZone?: string } | null;
      end?: { dateTime?: string; date?: string; timeZone?: string } | null;
      created?: string | null;
      updated?: string | null;
      status?: string | null;
    };

    return (events as CalendarEventItem[]).map(
      (event) =>
        ({
          id: event.id || "",
          summary: event.summary || "",
          description: event.description,
          start: event.start as GoogleCalendarEvent["start"],
          end: event.end as GoogleCalendarEvent["end"],
          created: event.created || "",
          updated: event.updated || "",
          status: event.status,
        }) as GoogleCalendarEvent
    );
  } catch (error) {
    console.error("Erro ao listar eventos:", error);
    return [];
  }
}
