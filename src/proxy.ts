import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Protege todas as rotas exceto:
    // - api (rotas de API)
    // - _next/static (arquivos estáticos)
    // - _next/image (imagens otimizadas)
    // - favicon.ico (favicon)
    // - login (página de login)
    // - arquivos públicos
    "/((?!api|_next/static|_next/image|favicon.ico|login|.*\\..*).*)",
  ],
};
