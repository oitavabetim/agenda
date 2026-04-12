import { TenantProvider } from "@/lib/tenant/use-tenant";
import { getCurrentTenant } from "@/lib/tenant/config";
import { DashboardLayout } from "@/components/Layouts/DashboardLayout";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obter tenant no servidor (Vercel: server component by default)
  const tenant = getCurrentTenant();

  // Filtrar apenas campos necessários (Vercel: server-serialization)
  const tenantSafe = {
    id: tenant.id,
    name: tenant.name || "Sistema de Reservas", // Fallback se vazio
  };

  return (
    <TenantProvider tenant={tenantSafe}>
      <DashboardLayout>{children}</DashboardLayout>
    </TenantProvider>
  );
}
