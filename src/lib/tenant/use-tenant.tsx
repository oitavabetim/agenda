"use client";

import { createContext, useContext } from "react";

interface TenantContextValue {
  id: string;
  name: string;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: React.ReactNode;
  tenant: TenantContextValue;
}

export function TenantProvider({ children, tenant }: TenantProviderProps) {
  return (
    <TenantContext value={tenant}>
      {children}
    </TenantContext>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    return {
      id: "default",
      name: "Sistema de Reservas",
    };
  }
  return context;
}
