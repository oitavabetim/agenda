import { TenantConfig, EspacoConfig } from "./tenant-context";

/**
 * Configuração de Tenant (RF-10)
 *
 * Suporte multi-tenant para múltiplas igrejas/unidades
 * No MVP, as configurações são baseadas em variáveis de ambiente
 *
 * Vercel: Espaços são configuração de tenant, não código.
 * Cada tenant define seus próprios espaços com calendarId embutido.
 */

/**
 * Configurações de tenants (MVP - baseado em variáveis de ambiente)
 * Em produção, isso viria de um banco de dados ou serviço de configuração
 *
 * Vercel: server-serialization — nunca expor googleClientSecret para client components
 */
export const TENANTS: Record<string, TenantConfig> = {
  "oitava-betim-agenda": {
    id: "oitava-betim-agenda",
    name: "Oitava Betim Agenda",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    calendarIframeUrl: process.env.CALENDAR_IFRAME_URL ||"https://calendar.google.com/calendar/embed?src=example%40group.calendar.google.com",
    mapaUrl: process.env.MAPA_URL || "/images/mapas/mapa-oitava-betim.jpg",
    onesignalAppId: process.env.ONESIGNAL_APP_ID,
    onesignalRestApiKey: process.env.ONESIGNAL_REST_API_KEY,
    espacos: [
      {
        id: "templo",
        nome: "Templo",
        descricao: "Espaço principal para cultos",
        capacidade: null,
        calendarId: process.env.CALENDAR_ID_TEMPLO || "",
        ativo: true,
      },
      {
        id: "salao-social",
        nome: "Salão Social",
        descricao: "Eventos e reuniões",
        capacidade: null,
        calendarId: process.env.CALENDAR_ID_SALAO_SOCIAL || "",
        ativo: true,
      },
      {
        id: "sala-a",
        nome: "Sala A",
        descricao: "Sala de reunião",
        capacidade: 15,
        calendarId: process.env.CALENDAR_ID_SALA_A || "",
        ativo: true,
      },
      {
        id: "sala-b",
        nome: "Sala B",
        descricao: "Sala de reunião",
        capacidade: 15,
        calendarId: process.env.CALENDAR_ID_SALA_B || "",
        ativo: true,
      },
      {
        id: "sala-01",
        nome: "Sala 01",
        descricao: "Sala de reunião",
        capacidade: 35,
        calendarId: process.env.CALENDAR_ID_SALA_01 || "",
        ativo: true,
      },
      {
        id: "sala-02",
        nome: "Sala 02",
        descricao: "Sala de reunião",
        capacidade: 15,
        calendarId: process.env.CALENDAR_ID_SALA_02 || "",
        ativo: true,
      },
      {
        id: "sala-03",
        nome: "Sala 03",
        descricao: "Sala de reunião",
        capacidade: 20,
        calendarId: process.env.CALENDAR_ID_SALA_03 || "",
        ativo: true,
      },
      {
        id: "sala-04",
        nome: "Sala 04",
        descricao: "Sala de reunião",
        capacidade: 15,
        calendarId: process.env.CALENDAR_ID_SALA_04 || "",
        ativo: true,
      },
      {
        id: "sala-05",
        nome: "Sala 05",
        descricao: "Sala de reunião",
        capacidade: 15,
        calendarId: process.env.CALENDAR_ID_SALA_05 || "",
        ativo: true,
      },
      {
        id: "sala-07",
        nome: "Sala 07",
        descricao: "Sala de reunião",
        capacidade: 20,
        calendarId: process.env.CALENDAR_ID_SALA_07 || "",
        ativo: true,
      },
      {
        id: "sala-apoio",
        nome: "Sala Apoio Ministerial",
        descricao: "Reuniões ministeriais",
        capacidade: null,
        calendarId: process.env.CALENDAR_ID_SALA_APOIO || "",
        ativo: true,
      },
    ],
  },
};

/**
 * Obtém a configuração completa do tenant atual
 */
export const getTenantConfig = (tenantId?: string): TenantConfig => {
  const id = tenantId || process.env.DEFAULT_TENANT_ID || "oitava-betim-agenda";
  return TENANTS[id] || TENANTS["oitava-betim-agenda"];
};

/**
 * Obtém a configuração do tenant atual para uso em componentes server
 */
export const getCurrentTenant = (): TenantConfig => {
  return getTenantConfig();
};

/**
 * Lista todos os tenants disponíveis
 */
export const getAllTenants = (): TenantConfig[] => {
  return Object.values(TENANTS);
};

/**
 * Obtém os espaços ativos do tenant atual
 * Vercel: Retorna apenas campos necessários (server-serialization)
 */
export const getEspacosDoTenant = (tenantId?: string): EspacoConfig[] => {
  const tenant = getTenantConfig(tenantId);
  return tenant.espacos.filter((e) => e.ativo);
};

/**
 * Obtém o calendarId de um espaço específico do tenant
 * Substitui getCalendarIdByEspacoId() hardcoded
 */
export const getCalendarId = (
  tenantId: string,
  espacoId: string
): string => {
  const tenant = TENANTS[tenantId];
  if (!tenant) return "";
  const espaco = tenant.espacos.find((e) => e.id === espacoId);
  return espaco?.calendarId || "";
};
