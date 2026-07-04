import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { upsertGoogleUser } from "./google-user";
import { isGoogleAuthEnabled } from "./config";

const googleProvider = isGoogleAuthEnabled()
    ? Google({
        clientId:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [
    ...(googleProvider ? [googleProvider] : []),
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, String(credentials.email).toLowerCase()))
          .limit(1);

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id:    user.id,
          name:  `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          image: user.image ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const dbUser = await upsertGoogleUser({
        email: user.email,
        name:  user.name,
        image: user.image,
      });

      user.id   = dbUser.id;
      user.name = `${dbUser.firstName} ${dbUser.lastName}`.trim();
      user.image = dbUser.image ?? user.image;

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
