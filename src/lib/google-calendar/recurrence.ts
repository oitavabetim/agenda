import { checkBulkAvailability } from "./availability";
import { createEvent } from "./events";
import {
  addDaysToDateString,
  addMonthsToDateString,
  buildBrazilDateTime,
  extractDateFromDateTime,
  formatDateStringForDisplay,
} from "@/lib/utils/timezone";

export type RecorrenciaTipo = "semanal" | "mensal";

interface RecorrenciaParams {
  dataInicio: string; // YYYY-MM-DD
  horarioInicio: string; // HH:MM
  horarioFim: string; // HH:MM
  tipo: RecorrenciaTipo;
  dataTermino: string; // YYYY-MM-DD
}

/**
 * Calcula todas as datas de uma recorrência
 * RF-05: Regra de Reserva para eventos recorrentes
 */
export function calcularDatasRecorrencia(
  params: RecorrenciaParams
): { data: string; inicio: string; fim: string }[] {
  const { dataInicio, horarioInicio, horarioFim, tipo, dataTermino } = params;

  const datas: { data: string; inicio: string; fim: string }[] = [];
  let dataAtual = dataInicio;

  while (dataAtual <= dataTermino) {
    const inicio = buildBrazilDateTime(dataAtual, horarioInicio);
    const fim = buildBrazilDateTime(dataAtual, horarioFim);

    datas.push({
      data: dataAtual,
      inicio,
      fim,
    });

    // Avança para próxima data baseado no tipo de recorrência
    if (tipo === "semanal") {
      dataAtual = addDaysToDateString(dataAtual, 7);
    } else if (tipo === "mensal") {
      dataAtual = addMonthsToDateString(dataAtual, 1);
    }
  }

  return datas;
}

/**
 * Verifica disponibilidade para todas as datas de uma recorrência
 */
export async function verificarDisponibilidadeRecorrencia(
  params: {
    calendarId: string;
    inicio: string;
    fim: string;
  }[]
) {
  const checksFormatados = params.map((check) => ({
    calendarId: check.calendarId,
    startDateTime: check.inicio,
    endDateTime: check.fim,
  }));
  
  return checkBulkAvailability(checksFormatados);
}

/**
 * Cria eventos para todas as datas de uma recorrência
 * RF-05: Criar eventos individuais (não usar recorrência nativa)
 */
export async function criarEventosRecorrentes(
  params: {
    calendarId: string;
    summary: string;
    description?: string;
    inicio: string;
    fim: string;
    responsibleEmail: string;
  }[]
): Promise<string[]> {
  const eventIds: string[] = [];

  for (const evento of params) {
    const createdEvent = await createEvent({
      calendarId: evento.calendarId,
      summary: evento.summary,
      description: evento.description,
      startDateTime: evento.inicio,
      endDateTime: evento.fim,
      responsibleEmail: evento.responsibleEmail,
    });

    eventIds.push(createdEvent.id);
  }

  return eventIds;
}

/**
 * Combina cálculo de datas com verificação de disponibilidade
 * para múltiplos espaços e múltiplas datas
 */
export async function processarRecorrencia(
  params: RecorrenciaParams & {
    espacosCalendarIds: string[];
    summary: string;
    description?: string;
    responsibleEmail: string;
  }
): Promise<{ success: boolean; eventIds?: string[]; error?: string }> {
  const {
    dataInicio,
    horarioInicio,
    horarioFim,
    espacosCalendarIds,
    summary,
    description,
    responsibleEmail,
  } = params;

  try {
    // 1. Calcular todas as datas da recorrência
    const datas = calcularDatasRecorrencia({
      dataInicio,
      horarioInicio,
      horarioFim,
      tipo: params.tipo as RecorrenciaTipo,
      dataTermino: params.dataTermino,
    });

    // 2. Preparar verificações de disponibilidade para todos os espaços e datas
    const checks = datas.flatMap((data) =>
      espacosCalendarIds.map((calendarId) => ({
        calendarId,
        startDateTime: data.inicio,
        endDateTime: data.fim,
      }))
    );

    // 3. Verificar disponibilidade em bulk
    const disponibilidade = await checkBulkAvailability(checks);

    if (!disponibilidade.available) {
      // Montar mensagem de erro detalhada
      const conflitos = disponibilidade.conflicts || [];
      const mensagensErro = conflitos.map((c) => {
        const dataFormatada = formatDateStringForDisplay(
          extractDateFromDateTime(c.date)
        );
        return `Espaço ${c.calendarId} indisponível em ${dataFormatada}`;
      });

      return {
        success: false,
        error: `Conflitos encontrados: ${mensagensErro.join("; ")}`,
      };
    }

    // 4. Criar eventos para todas as combinações espaço/data
    const eventosParaCriar = datas.flatMap((data) =>
      espacosCalendarIds.map((calendarId) => ({
        calendarId,
        summary: `${summary} (${formatDateStringForDisplay(data.data)})`,
        description,
        inicio: data.inicio,
        fim: data.fim,
        responsibleEmail,
      }))
    );

    const eventIds = await criarEventosRecorrentes(eventosParaCriar);

    return {
      success: true,
      eventIds,
    };
  } catch (error) {
    console.error("Erro ao processar recorrência:", error);
    return {
      success: false,
      error: "Erro ao processar reserva recorrente",
    };
  }
}

/**
 * Formata mensagem de erro para recorrência com conflitos
 */
export function formatarErroRecorrencia(conflitos: Array<{
  calendarId: string;
  date: string;
}>): string {
  if (conflitos.length === 0) return "";

  const agrupados = conflitos.reduce((acc, conflito) => {
    const data = formatDateStringForDisplay(
      extractDateFromDateTime(conflito.date)
    );
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(conflito.calendarId);
    return acc;
  }, {} as Record<string, string[]>);

  const mensagens = Object.entries(agrupados).map(
    ([data, espacos]) => `${data}: ${espacos.join(", ")}`
  );

  return `Conflitos encontrados nas datas:\n${mensagens.join("\n")}`;
}
