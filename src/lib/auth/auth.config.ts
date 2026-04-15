import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/login");
      const isOnPrivacyPage = nextUrl.pathname.startsWith("/politica-privacidade");
      const isOnTermsPage = nextUrl.pathname.startsWith("/termos-uso");
      const isOnDashboard =
        nextUrl.pathname.startsWith("/") &&
        !isOnAuthPage &&
        !isOnPrivacyPage &&
        !isOnTermsPage;

      // Páginas públicas não requerem autenticação
      if (isOnPrivacyPage || isOnTermsPage) {
        return true;
      }

      // Se está na página de login e já está logado, redireciona para dashboard
      if (isOnAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/reserva", nextUrl));
      }

      // Se está no dashboard e não está logado, redireciona para login
      if (isOnDashboard && !isLoggedIn) {
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
