interface SyncUserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

function getSyncBaseUrl(): string {
  if (process.env.FINDY_CORE_API_URL?.startsWith("http")) {
    return process.env.FINDY_CORE_API_URL.replace(/\/$/, "");
  }
  if (process.env.FINDY_CORE_INTERNAL_URL?.startsWith("http")) {
    return process.env.FINDY_CORE_INTERNAL_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

/**
 * Derives a deterministic password for a user in findy-core's auth system.
 * The password is unique per user and requires SYNC_SECRET to compute.
 * Uses Web Crypto (works in both Node.js and Edge Runtime).
 */
async function deterministicPassword(userId: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(userId));
  const bytes = Array.from(new Uint8Array(sig));
  // btoa produces a valid password string (≥ 8 chars, no special chars that could be mishandled)
  return btoa(bytes.map((b) => String.fromCharCode(b)).join(""))
    .replace(/[+/=]/g, "X")
    .slice(0, 32);
}

/**
 * Syncs a frontend user into findy-core's DB and returns a JWT issued by
 * findy-core itself. The returned token is valid for the production API
 * without needing to share JWT_SECRET between the two services.
 *
 * Strategy:
 * 1. Try the dedicated /auth/sync-user endpoint (new findy-core deployments).
 * 2. Fall back to /auth/signup → /auth/login using a deterministic password
 *    derived from the user ID and SYNC_SECRET (works with current prod).
 *
 * Only call this server-side (auth callbacks). Does NOT import from client.ts
 * or token.ts to avoid circular dependencies.
 */
export async function syncUserToFindyCore(
  payload: SyncUserPayload,
): Promise<string | null> {
  const syncSecret = process.env.FINDY_SYNC_SECRET;
  if (!syncSecret) return null;

  const baseUrl = getSyncBaseUrl();

  // ── Strategy 1: dedicated sync endpoint (new deployments) ─────────────────
  try {
    const res = await fetch(`${baseUrl}/auth/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${syncSecret}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { token?: string };
      if (data.token) return data.token;
    }
  } catch {
    // endpoint doesn't exist yet — fall through to strategy 2
  }

  // ── Strategy 2: signup + login with deterministic password ─────────────────
  const password = await deterministicPassword(payload.id, syncSecret);
  const headers = { "Content-Type": "application/json" };

  // Try signup — may return 409 if user already exists
  try {
    await fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: payload.email,
        password,
        firstName: payload.firstName || "User",
        lastName: payload.lastName || "",
      }),
      cache: "no-store",
    });
  } catch {
    // network error — give up
    return null;
  }

  // Login (works whether signup just created the account or it already existed)
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email: payload.email, password }),
      cache: "no-store",
    });
    if (!loginRes.ok) return null;
    const data = (await loginRes.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}
