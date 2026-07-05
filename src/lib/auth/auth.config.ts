import type { NextAuthConfig } from "next-auth";
import { syncUserToFindyCore } from "@/lib/findy-core/sync";

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
      if (user?.id) {
        token.id    = user.id;
        token.email = user.email;
        token.name  = user.name;

        // Sync user into findy-core's DB and obtain a JWT issued by findy-core.
        // This token is valid for the production API without needing to share
        // JWT_SECRET between the two services.
        const nameParts = (user.name ?? "").split(" ");
        const findyCoreToken = await syncUserToFindyCore({
          id:        user.id,
          email:     user.email ?? "",
          firstName: nameParts[0] ?? "User",
          lastName:  nameParts.slice(1).join(" "),
        });

        if (findyCoreToken) {
          token.findyCoreToken = findyCoreToken;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.id)             session.user.id    = token.id as string;
      // Ensure email is always present — critical for generating findy-core JWTs.
      if (token.email)          session.user.email = token.email;
      if (token.name)           session.user.name  = token.name;
      if (token.findyCoreToken) (session as { findyCoreToken?: string }).findyCoreToken = token.findyCoreToken as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
