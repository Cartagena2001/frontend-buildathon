import { createHmac, timingSafeEqual } from "crypto";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 min to complete step 2

function sign(payload: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Issue a short-lived token after OTP verification (step 1 → step 2). */
export function createPasswordResetToken(userId: string, otpId: string) {
  const exp = Date.now() + RESET_TOKEN_TTL_MS;
  const payload = `${userId}:${otpId}:${exp}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function parsePasswordResetToken(
  token: string
): { userId: string; otpId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;

    const [userId, otpId, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!userId || !otpId || !Number.isFinite(exp) || !sig) return null;
    if (Date.now() > exp) return null;

    const payload = `${userId}:${otpId}:${expStr}`;
    const expected = sign(payload);
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    return { userId, otpId };
  } catch {
    return null;
  }
}
