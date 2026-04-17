"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { PWAInstallProvider } from "@/components/pwa/pwa-install-context";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="light" attribute="class">
        <PWAInstallProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </PWAInstallProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
