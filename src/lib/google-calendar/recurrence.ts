import dayjs from "dayjs";
import { checkBulkAvailability } from "./availability";
import { createEvent } from "./events";

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
): { data: Date; inicio: Date; fim: Date }[] {
  const { dataInicio, horarioInicio, horarioFim, tipo, dataTermino } = params;

  const datas: { data: Date; inicio: Date; fim: Date }[] = [];

  let dataAtual = dayjs(dataInicio);
  const termino = dayjs(dataTermino);

  while (dataAtual.isBefore(termino) || dataAtual.isSame(termino, "day")) {
    const [horaInicio, minutoInicio] = horarioInicio.split(":").map(Number);
    const [horaFim, minutoFim] = horarioFim.split(":").map(Number);

    const inicio = dataAtual
      .hour(horaInicio)
      .minute(minutoInicio)
      .second(0)
      .toDate();

    const fim = dataAtual.hour(horaFim).minute(minutoFim).second(0).toDate();

    datas.push({
      data: dataAtual.toDate(),
      inicio,
      fim,
    });

    // Avança para próxima data baseado no tipo de recorrência
    if (tipo === "semanal") {
      dataAtual = dataAtual.add(1, "week");
    } else if (tipo === "mensal") {
      dataAtual = dataAtual.add(1, "month");
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
    inicio: Date;
    fim: Date;
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
    inicio: Date;
    fim: Date;
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
        const dataFormatada = dayjs(c.date).format("DD/MM/YYYY");
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
        summary: `${summary} (${dayjs(data.data).format("DD/MM/YYYY")})`,
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
    const data = dayjs(conflito.date).format("DD/MM/YYYY");
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
