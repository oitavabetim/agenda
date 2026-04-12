/**
 * Tipos para listagem de reservas do usuário
 */

export interface ReservaUsuario {
  id: string;
  eventId: string;
  calendarId: string;
  espacoNome: string;
  programacao: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  responsavelEmail: string;
  status: "confirmed" | "cancelled" | "tentative";
  criadoEm: string;
}

export interface CancelarReservaResult {
  success: boolean;
  message?: string;
  error?: string;
}
