import { listAgendaEvents } from "@/lib/google-calendar/events";
import { getEspacosDoTenant, getTenantConfig } from "@/lib/tenant/config";
import {
  addDaysToDateString,
  buildBrazilDateTime,
  getDayOfWeekForDateString,
  getTodayInBrazilDateString,
} from "@/lib/utils/timezone";

export interface AgendaGeralEvento {
  id: string;
  titulo: string;
  espacoNome: string;
  inicio: string;
  fim: string;
  diaInteiro: boolean;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getInicioSemanaAtual(): string {
  const hoje = getTodayInBrazilDateString();
  return getInicioSemana(hoje);
}

export function getInicioSemana(dateString: string): string {
  if (!DATE_PATTERN.test(dateString)) {
    throw new Error("Data da semana inválida");
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw new Error("Data da semana inválida");
  }

  const dayOfWeek = getDayOfWeekForDateString(dateString);
  return addDaysToDateString(dateString, dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
}

export async function getEventosAgendaSemanal(
  weekStart: string,
): Promise<AgendaGeralEvento[]> {
  const inicioSemana = getInicioSemana(weekStart);
  const fimSemana = addDaysToDateString(inicioSemana, 7);
  const tenant = getTenantConfig();
  const espacos = getEspacosDoTenant(tenant.id).filter(
    (espaco) => espaco.calendarId,
  );

  const timeMin = new Date(buildBrazilDateTime(inicioSemana, "00:00"));
  const timeMax = new Date(buildBrazilDateTime(fimSemana, "00:00"));

  const eventLists = await Promise.all(
    espacos.map(async (espaco) => ({
      espacoId: espaco.id,
      espacoNome: espaco.nome,
      eventos: await listAgendaEvents(espaco.calendarId, { timeMin, timeMax }),
    })),
  );

  return eventLists
    .flatMap(({ espacoId, espacoNome, eventos }) =>
      eventos.map((evento) => {
        const diaInteiro = Boolean(evento.start.date && evento.end.date);

        return {
          id: `${espacoId}-${evento.id}`,
          titulo: evento.summary,
          espacoNome,
          inicio: diaInteiro ? evento.start.date! : evento.start.dateTime!,
          fim: diaInteiro ? evento.end.date! : evento.end.dateTime!,
          diaInteiro,
        };
      }),
    )
    .sort((first, second) => first.inicio.localeCompare(second.inicio));
}
