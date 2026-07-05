import type { NextAuthConfig } from "next-auth";
import { provisionFindyCoreToken } from "@/lib/findy-core/auth";

/** Edge-safe NextAuth config (no Node-only providers). */
export const authConfig = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        if (session?.name) token.name = session.name;
        // Profile/session refresh — keep findyCoreToken for place-lists API calls.
        return token;
      }

      // On initial sign-in, copy all fields from the User object so they
      // persist in every subsequent session refresh.
      if (user?.id) {
        token.id    = user.id;
        token.email = user.email ?? token.email;
        token.name  = user.name;
      }

      if (user?.findyCoreToken) {
        token.findyCoreToken = user.findyCoreToken;
      }

      // Obtain findy-core JWT when missing (login / OAuth paths).
      if (token.id && !token.findyCoreToken) {
        const nameParts = ((token.name as string) ?? "").split(" ");
        const findyCoreToken = await provisionFindyCoreToken({
          id:        token.id as string,
          email:     (token.email as string) ?? "",
          firstName: nameParts[0] ?? "User",
          lastName:  nameParts.slice(1).join(" "),
          password:  user?.findyPassword,
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
