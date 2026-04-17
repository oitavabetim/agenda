/**
 * Tipos para integração com Google Calendar API
 */

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  created: string;
  updated: string;
  status?: string;
}

export interface GoogleCalendarAvailability {
  available: boolean;
  conflicts?: Array<{
    eventId: string;
    summary: string;
    start: string;
    end: string;
  }>;
}

export interface CreateEventParams {
  calendarId: string;
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  responsibleEmail: string;
  timezone?: string;
}

export interface CheckAvailabilityParams {
  calendarId: string;
  startDateTime: string;
  endDateTime: string;
}
