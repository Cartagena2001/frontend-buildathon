import type { NextAuthConfig } from "next-auth";

/** Edge-safe NextAuth config (no Node-only providers). */
export const authConfig = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, copy all fields from the User object so they
      // persist in every subsequent session refresh.
      if (user?.id)    token.id    = user.id;
      if (user?.email) token.email = user.email;
      if (user?.name)  token.name  = user.name;
      return token;
    },

    async session({ session, token }) {
      if (token.id)    session.user.id    = token.id as string;
      // Ensure email is always present — critical for generating findy-core JWTs.
      if (token.email) session.user.email = token.email;
      if (token.name)  session.user.name  = token.name;
      return session;
    },
  },
} satisfies NextAuthConfig;
