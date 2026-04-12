import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { getTenantConfig } from "@/lib/tenant/config";

/**
 * Cliente JWT para Google Calendar API usando Service Account
 */
function getJWTClient(): JWT {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  
  if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error(
      "Service Account não configurada. Verifique GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY"
    );
  }

  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
}

/**
 * Obtém o cliente da Google Calendar API autenticado via Service Account
 */
export function getCalendarClient() {
  const authClient = getJWTClient();
  return google.calendar({ version: "v3", auth: authClient });
}

/**
 * URL de autorização OAuth2 (não usado com Service Account)
 * Mantido para compatibilidade
 */
export function getCalendarAuthUrl(_accessToken: string): string {
  throw new Error("Service Account não requer autorização OAuth2");
}
