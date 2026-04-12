import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/");
      const isOnAuthPage = nextUrl.pathname.startsWith("/login");

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
    jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      // Persist access token
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
