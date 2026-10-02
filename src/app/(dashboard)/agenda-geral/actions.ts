"use server";

import { auth } from "@/lib/auth";
import {
  AgendaGeralEvento,
  getEventosAgendaSemanal,
  getInicioSemana,
} from "@/lib/google-calendar/agenda";

export interface AgendaGeralResultado {
  success: boolean;
  events?: AgendaGeralEvento[];
  error?: string;
}

export async function listarAgendaGeralSemana(
  weekStart: string,
): Promise<AgendaGeralResultado> {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return { success: false, error: "Semana informada é inválida" };
    }

    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const inicioSemana = getInicioSemana(weekStart);
    if (inicioSemana !== weekStart) {
      return {
        success: false,
        error: "A semana deve começar em uma segunda-feira",
      };
    }

    return {
      success: true,
      events: await getEventosAgendaSemanal(inicioSemana),
    };
  } catch (error) {
    console.error("Erro ao carregar agenda geral:", error);
    return {
      success: false,
      error: "Não foi possível carregar a agenda geral",
    };
  }
}
