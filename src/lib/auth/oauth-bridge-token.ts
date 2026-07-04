import { createHmac, timingSafeEqual } from "crypto";

const OAUTH_BRIDGE_TTL_MS = 5 * 60 * 1000;

function sign(payload: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Short-lived token to bridge Supabase OAuth into a NextAuth session. */
export function createOAuthBridgeToken(userId: string) {
  const exp = Date.now() + OAUTH_BRIDGE_TTL_MS;
  const payload = `${userId}:${exp}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function parseOAuthBridgeToken(token: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [userId, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!userId || !Number.isFinite(exp) || !sig) return null;
    if (Date.now() > exp) return null;

    const payload = `${userId}:${expStr}`;
    const expected = sign(payload);
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}
