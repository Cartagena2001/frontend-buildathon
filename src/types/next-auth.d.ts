import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    /** JWT issued by findy-core — valid for api.findy.place without shared JWT_SECRET */
    findyCoreToken?: string;
  }

  interface User {
    id: string;
    /** Ephemeral — passed to jwt callback for findy-core credentials login, never persisted */
    findyPassword?: string;
    /** Set on register when findy-core signup returns a JWT */
    findyCoreToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    /** JWT issued by findy-core after syncing the user on first sign-in */
    findyCoreToken?: string;
  }
}
