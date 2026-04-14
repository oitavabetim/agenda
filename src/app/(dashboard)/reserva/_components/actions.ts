"use server";

import { auth } from "@/lib/auth";
import { validarReserva, ReservaFormData } from "@/lib/validation/reserva";
import { getTenantConfig, getCalendarId, getEspacosDoTenant } from "@/lib/tenant/config";
import { checkAvailability, checkBulkAvailability } from "@/lib/google-calendar/availability";
import { createEvent } from "@/lib/google-calendar/events";
import {
  calcularDatasRecorrencia,
  processarRecorrencia,
} from "@/lib/google-calendar/recurrence";
import dayjs from "dayjs";

/**
 * Constrói descrição formatada para evento no Google Calendar.
 * Inclui responsável, telefone e observações em formato legível
 * para diáconos e equipe de cozinha.
 *
 * Função pura — sem side effects, facilmente testável.
 */
function buildEventDescription(params: {
  responsavel: string;
  telefone: string;
  observacoes?: string;
}): string | undefined {
  const partes: string[] = [];

  if (params.responsavel.trim()) {
    partes.push(`Responsável: ${params.responsavel.trim()}`);
  }
  if (params.telefone.trim()) {
    partes.push(`Telefone: ${params.telefone.trim()}`);
  }
  if (params.observacoes?.trim()) {
    partes.push(`Observações: ${params.observacoes.trim()}`);
  }

  return partes.length > 0 ? partes.join("\n") : undefined;
}

interface CriarReservaInput extends Omit<ReservaFormData, "recorrenciaTipo"> {
  responsavelEmail: string;
  tenantId: string;
  recorrenciaTipo?: string;
}

export async function criarReserva(
  input: CriarReservaInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // 1. Verificar autenticação (Vercel: server-auth-actions)
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // 2. Validar dados do formulário
    const validacao = validarReserva({
      ...input,
      recorrenciaTipo: input.recorrente ? input.recorrenciaTipo : undefined,
      recorrenciaDataTermino: input.recorrente
        ? input.recorrenciaDataTermino
        : undefined,
    });

    if (!validacao.success) {
      const erros = validacao.error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        error: erros,
      };
    }

    const dados = validacao.data;

    // 3. Obter configuração do tenant e espaços
    const tenant = getTenantConfig(input.tenantId);
    const espacosDoTenant = getEspacosDoTenant(input.tenantId);

    // 4. Validar se espaços selecionados pertencem ao tenant (Vercel: authorize after validate)
    const espacosValidos = dados.espacos.filter((espacoId) =>
      espacosDoTenant.some((e) => e.id === espacoId)
    );

    if (espacosValidos.length !== dados.espacos.length) {
      return {
        success: false,
        error: "Um ou mais espaços selecionados não estão disponíveis para este tenant",
      };
    }

    // 5. Obter calendar IDs dos espaços selecionados
    const espacosCalendarIds = espacosValidos
      .map((espacoId) => getCalendarId(input.tenantId, espacoId))
      .filter((id): id is string => !!id);

    if (espacosCalendarIds.length !== espacosValidos.length) {
      return {
        success: false,
        error: "Um ou mais espaços selecionados não possuem configuração de calendário",
      };
    }

    // 6. Preparar data e horário
    const dataInicio = dayjs(dados.dataInicio);
    const [horaInicio, minutoInicio] = dados.horarioInicio
      .split(":")
      .map(Number);
    const [horaFim, minutoFim] = dados.horarioFim.split(":").map(Number);

    const startDateTime = dataInicio
      .hour(horaInicio)
      .minute(minutoInicio)
      .second(0)
      .toDate();

    const endDateTime = dataInicio.hour(horaFim).minute(minutoFim).second(0).toDate();

    // 7. Processar reserva (simples ou recorrente)
    if (dados.recorrente) {
      // Reserva Recorrente - valida tipo
      if (dados.recorrenciaTipo !== "semanal" && dados.recorrenciaTipo !== "mensal") {
        return {
          success: false,
          error: "Tipo de recorrência inválido. Selecione semanal ou mensal.",
        };
      }

      // Construir descrição antes de operação async (cheap condition before await)
      const descricao = buildEventDescription({
        responsavel: dados.responsavel,
        telefone: dados.telefone,
        observacoes: dados.observacoes,
      });

      const resultado = await processarRecorrencia({
        dataInicio: dados.dataInicio,
        horarioInicio: dados.horarioInicio,
        horarioFim: dados.horarioFim,
        tipo: dados.recorrenciaTipo,
        dataTermino: dados.recorrenciaDataTermino!,
        espacosCalendarIds,
        summary: dados.programacao,
        description: descricao,
        responsibleEmail: session.user.email,
      });

      if (resultado.success) {
        return {
          success: true,
          message: `Reserva recorrente criada com sucesso! ${resultado.eventIds?.length} eventos foram agendados.`,
        };
      } else {
        return {
          success: false,
          error: resultado.error,
        };
      }
    } else {
      // Reserva Simples
      // 7a. Verificar disponibilidade para todos os espaços
      const checks = espacosCalendarIds.map((calendarId) => ({
        calendarId,
        startDateTime,
        endDateTime,
      }));

      const disponibilidade = await checkBulkAvailability(checks);

      if (!disponibilidade.available) {
        // Montar mensagem de erro com conflitos
        const conflitos = disponibilidade.conflicts || [];

        // Criar mapa de calendarId para nome do espaço
        const calendarIdToNome = new Map(
          espacosValidos.map((espacoId) => {
            const espaco = espacosDoTenant.find((e) => e.id === espacoId);
            return [
              getCalendarId(input.tenantId, espacoId),
              espaco?.nome || espacoId,
            ];
          })
        );

        // Tipagem para conflito de disponibilidade
        type ConflictInfo = {
          calendarId: string;
          date: string;
          conflicts: {
            available: boolean;
            conflicts?: Array<{
              eventId: string;
              summary: string;
              start: string;
              end: string;
            }>;
          };
        };

        const mensagensErro = conflitos.map((c: ConflictInfo) => {
          const espacoNome =
            calendarIdToNome.get(c.calendarId) || "Espaço desconhecido";
          const dataFormatada = dayjs(c.date).format("DD/MM/YYYY");
          return `${espacoNome} indisponível em ${dataFormatada}`;
        });

        return {
          success: false,
          error: `Conflitos encontrados: ${mensagensErro.join("; ")}`,
        };
      }

      // 7b. Criar eventos para cada espaço
      // Construir descrição antes do loop async (cheap condition before await)
      const descricao = buildEventDescription({
        responsavel: dados.responsavel,
        telefone: dados.telefone,
        observacoes: dados.observacoes,
      });

      const eventIds: string[] = [];

      for (const calendarId of espacosCalendarIds) {
        const evento = await createEvent({
          calendarId,
          summary: dados.programacao,
          description: descricao,
          startDateTime,
          endDateTime,
          responsibleEmail: session.user.email,
        });

        eventIds.push(evento.id);
      }

      return {
        success: true,
        message: `Reserva criada com sucesso para ${eventIds.length} espaço(s)!`,
      };
    }
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    return {
      success: false,
      error: "Erro ao processar reserva. Tente novamente.",
    };
  }
}

/**
 * Server Action para cancelar uma reserva
 */
export async function cancelarReserva(
  calendarId: string,
  eventId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const { deleteEvent } = await import("@/lib/google-calendar/events");
    await deleteEvent(calendarId, eventId);

    return {
      success: true,
      message: "Reserva cancelada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    return {
      success: false,
      error: "Erro ao cancelar reserva. Tente novamente.",
    };
  }
}
