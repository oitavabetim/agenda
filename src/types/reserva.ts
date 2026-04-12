/**
 * Tipos para Reserva de Espaços
 */

export interface Reserva {
  id?: string;
  programacao: string;
  responsavel: string;
  responsavelEmail: string;
  telefone: string;
  observacoes?: string;
  dataInicio: string; // YYYY-MM-DD
  horarioInicio: string; // HH:MM
  horarioFim: string; // HH:MM
  recorrente: boolean;
  recorrencia?: {
    tipo: "semanal" | "mensal";
    dataTermino: string;
  };
  espacos: string[]; // IDs dos espaços
  createdAt?: Date;
}

export interface ReservaFormData {
  programacao: string;
  responsavel: string;
  telefone: string;
  observacoes?: string;
  dataInicio: string;
  horarioInicio: string;
  horarioFim: string;
  recorrente: boolean;
  recorrenciaTipo?: "semanal" | "mensal";
  recorrenciaDataTermino?: string;
  espacos: string[];
}

export interface ConflitoInfo {
  espaco: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  eventoTitulo?: string;
}

export interface ReservaResult {
  success: boolean;
  error?: string;
  conflitos?: ConflitoInfo[];
  eventosCriados?: string[];
}
