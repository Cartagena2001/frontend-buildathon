import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseOAuthBridgeToken } from "./oauth-bridge-token";
import { verifyUserPassword } from "./verify-password";

export const credentialsProvider = Credentials({
  credentials: {
    email:          { label: "Email",           type: "email"    },
    password:       { label: "Password",        type: "password" },
    oauthBridge:    { label: "OAuth Bridge",    type: "text"     },
    findyCoreToken: { label: "Findy Core Token", type: "text"    },
  },
  async authorize(credentials) {
    const bridge = credentials?.oauthBridge;
    if (bridge) {
      const parsed = parseOAuthBridgeToken(String(bridge));
      if (!parsed) return null;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parsed.userId))
        .limit(1);

      if (!user) return null;

      const findyCoreToken = credentials.findyCoreToken
        ? String(credentials.findyCoreToken)
        : undefined;

      return {
        id:    user.id,
        name:  `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        image: user.image ?? undefined,
        findyCoreToken,
      };
    }

    if (!credentials?.email || !credentials?.password) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, String(credentials.email).toLowerCase()))
      .limit(1);

    if (!user?.passwordHash) return null;

    const valid = await verifyUserPassword(
      String(credentials.password),
      user.passwordHash,
    );
    if (!valid) return null;

    const findyCoreToken = credentials.findyCoreToken
      ? String(credentials.findyCoreToken)
      : undefined;

    return {
      id:            user.id,
      name:          `${user.firstName} ${user.lastName}`.trim(),
      email:         user.email,
      image:         user.image ?? undefined,
      findyPassword: String(credentials.password),
      findyCoreToken,
    };
  },
});
