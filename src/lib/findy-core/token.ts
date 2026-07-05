import { createHmac } from "crypto";
import { auth } from "@/lib/auth";
import { getFindyAuthBaseUrl, provisionFindyCoreToken } from "@/lib/findy-core/auth";

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

function isLocalFindyCore(): boolean {
  const url = getFindyAuthBaseUrl();
  return url.includes("localhost") || url.includes("127.0.0.1");
}

/**
 * Returns a Bearer token for the current session, or null if unauthenticated.
 *
 * Priority:
 * 1. `findyCoreToken` stored in session — issued by findy-core after login/sync.
 * 2. Re-provision via findy-core auth endpoints.
 * 3. Self-signed JWT — local dev only (requires JWT_SECRET to match findy-core).
 */
export async function getFindyToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const stored = (session as { findyCoreToken?: string }).findyCoreToken;
  if (stored) return stored;

  const nameParts = (session.user.name ?? "").split(" ");
  const provisioned = await provisionFindyCoreToken({
    id:        session.user.id,
    email:     session.user.email ?? "",
    firstName: nameParts[0] ?? "User",
    lastName:  nameParts.slice(1).join(" "),
  });
  if (provisioned) return provisioned;

  // Self-sign only for local findy-core — prod rejects tokens signed with a mismatched secret.
  if (isLocalFindyCore()) {
    return signFindyToken(session.user.id, session.user.email ?? "");
  }

  return null;
}
