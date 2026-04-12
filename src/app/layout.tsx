import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";
import { getCurrentTenant } from "@/lib/tenant/config";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = getCurrentTenant();
  const name = tenant.name || "Sistema de Reservas";

  return {
    title: {
      template: `%s | ${name}`,
      default: name,
    },
    description: `Sistema de Reserva de Espaços - ${name}`,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: name.split(" ")[0], // Primeira palavra do nome
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#5750F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
