import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";

export default {
  providers: [Credentials, Google, Discord],
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
    signOut: '/sign-out',
    // verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && typeof token.id === 'string') {
        session.user.id = token.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;