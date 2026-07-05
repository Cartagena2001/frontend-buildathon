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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    /** JWT issued by findy-core after syncing the user on first sign-in */
    findyCoreToken?: string;
  }
}
