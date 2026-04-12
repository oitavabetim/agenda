"use client";

import React, { createContext, use, ReactNode } from "react";

/**
 * Configuração de um espaço dentro de um tenant
 * Vercel: Espaços são configuração de tenant, não código
 */
export interface EspacoConfig {
  id: string;
  nome: string;
  descricao: string;
  capacidade: number | null;
  calendarId: string;
  ativo: boolean;
}

/**
 * Configuração completa de um tenant (igreja)
 * Vercel: state-context-interface — interface genérica que qualquer provider pode implementar
 */
export interface TenantConfig {
  id: string;
  name: string;
  googleClientId: string;
  googleClientSecret: string;
  calendarIframeUrl: string;
  mapaUrl: string;  // URL do mapa da igreja (ex: "/images/mapas/mapa-oitava.jpg")
  onesignalAppId?: string;
  onesignalRestApiKey?: string;
  espacos: EspacoConfig[]; // ← AGORA: espaços são parte do tenant
}

/**
 * Contexto do tenant para componentes client
 */
interface TenantContextType {
  tenant: TenantConfig;
  tenantId: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  tenantConfig: TenantConfig;
  tenantId: string;
}

export function TenantProvider({
  children,
  tenantConfig,
  tenantId,
}: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ tenant: tenantConfig, tenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook para obter o tenant atual em componentes client
 * Deve ser usado dentro do TenantProvider
 */
export function useTenant() {
  const context = use(TenantContext);
  if (context === undefined) {
    throw new Error(
      "useTenant deve ser usado dentro de um TenantProvider"
    );
  }
  return context;
}
