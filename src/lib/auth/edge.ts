import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/** Edge-safe `auth()` for proxy — no Node-only imports. */
export const { auth } = NextAuth(authConfig);
