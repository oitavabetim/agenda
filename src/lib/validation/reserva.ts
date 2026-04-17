import { z } from "zod";
import {
  addDaysToDateString,
  formatDateStringForDisplay,
  getDayOfWeekForDateString,
  getTodayInBrazilDateString,
} from "@/lib/utils/timezone";

/**
 * Schema de validação para reservas (RN-01 a RN-04)
 */
export const reservaSchema = z
  .object({
    programacao: z
      .string()
      .min(3, "Nome da programação deve ter pelo menos 3 caracteres"),
    responsavel: z.string().min(3, "Nome do responsável é obrigatório"),
    telefone: z
      .string()
      .min(14, "Telefone para contato é obrigatório")
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato de telefone inválido. Use (00) 00000-0000"),
    observacoes: z.string().optional(),
    dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    horarioInicio: z.string().regex(/^\d{2}:\d{2}$/, "Horário inicial inválido"),
    horarioFim: z.string().regex(/^\d{2}:\d{2}$/, "Horário final inválido"),
    recorrente: z.boolean(),
    // Aceita qualquer string, valida apenas no refine quando recorrente=true
    recorrenciaTipo: z.string().optional(),
    recorrenciaDataTermino: z.string().optional(),
    espacos: z
      .array(z.string())
      .min(1, "Selecione pelo menos um espaço"),
  })
  .refine(
    (data) => {
      // RN-01: Horário final deve ser maior que horário inicial
      return data.horarioFim > data.horarioInicio;
    },
    {
      message: "Horário final deve ser maior que horário inicial",
      path: ["horarioFim"],
    }
  )
  .refine(
    (data) => {
      // RN-02: Data mínima (não permitir reservas em datas anteriores ao dia atual)
      const hoje = getTodayInBrazilDateString();
      return data.dataInicio >= hoje;
    },
    {
      message: "Não é permitido reservar datas anteriores ao dia atual",
      path: ["dataInicio"],
    }
  )
  .refine(
    (data) => {
      // RN-03: Duração mínima de 30 minutos
      const [horaInicio, minutoInicio] = data.horarioInicio.split(":").map(Number);
      const [horaFim, minutoFim] = data.horarioFim.split(":").map(Number);
      const duracaoMinutos = (horaFim * 60 + minutoFim) - (horaInicio * 60 + minutoInicio);
      return duracaoMinutos >= 30;
    },
    {
      message: "Reservas devem ter duração mínima de 30 minutos",
      path: ["horarioFim"],
    }
  )
  .refine(
    (data) => {
      // RN-04: Janela permitida para reserva
      // Domingo a Quinta: próxima semana (segunda em diante)
      // Sexta e Sábado: semana subsequente (segunda em diante)

      // Validação de guarda: se dataInicio não for válida, ignora esta validação
      if (!data.dataInicio || !/^\d{4}-\d{2}-\d{2}$/.test(data.dataInicio)) {
        return true; // Validação já coberta pelo regex do campo
      }

      // Usa fuso horário brasileiro (UTC-3)
      const hoje = getTodayInBrazilDateString();
      const diaSemana = getDayOfWeekForDateString(hoje);

      // Calcula segunda-feira da semana permitida
      const diasParaSegunda = 8 - diaSemana;
      let dataMinimaPermitida = addDaysToDateString(hoje, diasParaSegunda);

      // Sexta (5) e Sábado (6): semana subsequente (+7 dias)
      if (diaSemana >= 5) {
        dataMinimaPermitida = addDaysToDateString(dataMinimaPermitida, 7);
      }

      return data.dataInicio >= dataMinimaPermitida;
    },
    (data) => {
      // Mensagem dinâmica com data específica
      const hoje = getTodayInBrazilDateString();
      const diaSemana = getDayOfWeekForDateString(hoje);
      const diasParaSegunda = 8 - diaSemana;
      let dataMinimaPermitida = addDaysToDateString(hoje, diasParaSegunda);

      if (diaSemana >= 5) {
        dataMinimaPermitida = addDaysToDateString(dataMinimaPermitida, 7);
      }

      return {
        message: `Agenda bloqueada para registro de eventos antes do dia ${formatDateStringForDisplay(dataMinimaPermitida)}, garantindo que as equipes de diáconos e cozinha tenham tempo hábil para se organizar e melhor atender às programações.`,
        path: ["dataInicio"],
      };
    }
  )
  .refine(
    (data) => {
      // Validação adicional: se recorrente, deve ter tipo e data de término válidos
      if (data.recorrente) {
        const hasTipo = data.recorrenciaTipo === "semanal" || data.recorrenciaTipo === "mensal";
        const hasDataTermino = !!data.recorrenciaDataTermino && /^\d{4}-\d{2}-\d{2}$/.test(data.recorrenciaDataTermino);
        return hasTipo && hasDataTermino;
      }
      return true;
    },
    {
      message: "Para eventos recorrentes, informe o tipo e a data de término",
      path: ["recorrenciaTipo"],
    }
  )
  .refine(
    (data) => {
      // Se recorrente e tem data de término, verifica se é maior que data de início
      if (data.recorrente && data.recorrenciaDataTermino && data.recorrenciaDataTermino !== "") {
        return data.recorrenciaDataTermino >= data.dataInicio;
      }
      return true;
    },
    {
      message: "Data de término da recorrência deve ser maior ou igual à data de início",
      path: ["recorrenciaDataTermino"],
    }
  );

export type ReservaFormData = {
  programacao: string;
  responsavel: string;
  telefone: string;
  observacoes?: string;
  dataInicio: string;
  horarioInicio: string;
  horarioFim: string;
  recorrente: boolean;
  recorrenciaTipo?: string;
  recorrenciaDataTermino?: string;
  espacos: string[];
};

/**
 * Valida dados de reserva
 */
export function validarReserva(data: unknown) {
  return reservaSchema.safeParse(data);
}
