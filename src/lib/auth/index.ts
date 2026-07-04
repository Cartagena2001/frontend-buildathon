import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { credentialsProvider } from "./credentials-provider";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [credentialsProvider],
});
