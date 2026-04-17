"use server";

import { auth } from "@/lib/auth";
import { listEventsByUser } from "@/lib/google-calendar/events";
import { getTenantConfig, getEspacosDoTenant, getCalendarId } from "@/lib/tenant/config";
import dayjs from "dayjs";
import {
  formatEventDateForBrazil,
  formatEventTimeForBrazil,
  getBrazilTimestamp,
} from "@/lib/utils/timezone";

export interface ReservaListada {
  eventId: string;
  calendarId: string;
  espacoNome: string;
  programacao: string;
  data: string;
  dataFormatada: string;
  horarioInicio: string;
  horarioFim: string;
  status: "confirmed" | "cancelled" | "tentative";
  criadoEm: string;
}

/**
 * Lista todas as reservas do usuário logado
 * RF-07: Listar eventos do responsável
 */
export async function listarMinhasReservas(): Promise<{
  success: boolean;
  reservas?: ReservaListada[];
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const userEmail = session.user.email;
    const tenant = getTenantConfig();

    // Obter espaços ativos do tenant
    const espacosDoTenant = getEspacosDoTenant(tenant.id);

    // Obter todos os calendar IDs dos espaços ativos
    const calendarIds = espacosDoTenant
      .map((espaco) => getCalendarId(tenant.id, espaco.id))
      .filter((id): id is string => !!id);

    if (calendarIds.length === 0) {
      return {
        success: false,
        error: "Nenhum calendário configurado",
      };
    }

    // Buscar eventos em todos os calendários
    const todasReservas: ReservaListada[] = [];

    // Buscar eventos dos últimos 30 dias e próximos 365 dias
    const timeMin = dayjs().subtract(30, "day").toDate();
    const timeMax = dayjs().add(365, "day").toDate();

    for (const calendarId of calendarIds) {
      const eventos = await listEventsByUser(calendarId, userEmail, {
        timeMin,
        timeMax,
      });

      // Encontrar nome do espaço pelo calendarId
      const espaco = espacosDoTenant.find(
        (e) => getCalendarId(tenant.id, e.id) === calendarId
      );
      const espacoNome = espaco?.nome || "Espaço não identificado";

      for (const evento of eventos) {
        // Pular eventos cancelados
        if (evento.status === "cancelled") {
          continue;
        }

        const dataInicio = evento.start?.dateTime;
        const dataFim = evento.end?.dateTime;

        if (!dataInicio || !dataFim) {
          continue;
        }

        todasReservas.push({
          eventId: evento.id,
          calendarId,
          espacoNome,
          programacao: evento.summary || "Sem título",
          data: dataInicio,
          dataFormatada: formatEventDateForBrazil(dataInicio),
          horarioInicio: formatEventTimeForBrazil(dataInicio),
          horarioFim: formatEventTimeForBrazil(dataFim),
          status: (evento.status as "confirmed" | "cancelled" | "tentative") || "confirmed",
          criadoEm: evento.created || "",
        });
      }
    }

    // Ordenar por data (mais recente primeiro)
    todasReservas.sort((a, b) => {
      return getBrazilTimestamp(b.data) - getBrazilTimestamp(a.data);
    });

    return {
      success: true,
      reservas: todasReservas,
    };
  } catch (error) {
    console.error("Erro ao listar reservas:", error);
    return {
      success: false,
      error: "Erro ao carregar reservas",
    };
  }
}
