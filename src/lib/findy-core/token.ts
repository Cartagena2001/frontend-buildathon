import { createHmac } from "crypto";
import { auth } from "@/lib/auth";

const EXPIRY_SECONDS = 60 * 60 * 24 * 7;

function base64url(data: string | Buffer): string {
  return Buffer.from(data).toString("base64url");
}

/** Signs a findy-core JWT (same format as findy-core auth). */
export function signFindyToken(sub: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + EXPIRY_SECONDS;
  const payload = base64url(JSON.stringify({ sub, email, exp }));
  const sig = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${sig}`;
}

/** Returns a Bearer token for the current session, or null if unauthenticated.
 *  Email is included in the JWT payload for findy-core but is NOT required for
 *  the token to be valid — only the user ID (sub) and signature matter.
 */
export async function getFindyToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  // Fallback to empty string if email is somehow missing from the session
  // (e.g. Google OAuth users in some NextAuth v5 edge cases).
  const email = session.user.email ?? "";
  return signFindyToken(session.user.id, email);
}
