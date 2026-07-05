/**
 * findy-core auth bridge — server-side only.
 *
 * Does NOT import from client.ts or token.ts to avoid circular dependencies
 * with @/lib/auth.
 *
 * @see docs Auth API — credentials (signup/login) and sync-user (OAuth bridge)
 */

export interface SyncUserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface FindySignupBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ProvisionFindyTokenInput extends SyncUserPayload {
  /** Present for credentials register/login — uses POST /auth/signup or /auth/login */
  password?: string;
}

export function getFindyAuthBaseUrl(): string {
  if (process.env.FINDY_CORE_API_URL?.startsWith("http")) {
    return process.env.FINDY_CORE_API_URL.replace(/\/$/, "");
  }
  if (process.env.FINDY_CORE_INTERNAL_URL?.startsWith("http")) {
    return process.env.FINDY_CORE_INTERNAL_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

async function parseToken(res: Response): Promise<string | null> {
  if (!res.ok) return null;
  const data = (await res.json()) as { token?: string };
  return data.token ?? null;
}

/** POST /auth/signup — creates credentials user in findy-core, returns JWT. */
export async function findySignup(body: FindySignupBody): Promise<string | null> {
  try {
    const res = await fetch(`${getFindyAuthBaseUrl()}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return parseToken(res);
  } catch {
    return null;
  }
}

/** POST /auth/login — authenticates credentials user, returns JWT. */
export async function findyLogin(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${getFindyAuthBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    return parseToken(res);
  } catch {
    return null;
  }
}

/**
 * POST /auth/sync-user — upserts OAuth/external user by frontend id.
 * Requires FINDY_SYNC_SECRET === findy-core SYNC_SECRET.
 */
export async function syncUserToFindyCore(payload: SyncUserPayload): Promise<string | null> {
  const syncSecret = process.env.FINDY_SYNC_SECRET;
  if (!syncSecret) return null;

  try {
    const res = await fetch(`${getFindyAuthBaseUrl()}/auth/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${syncSecret}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    return parseToken(res);
  } catch {
    return null;
  }
}

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
  return btoa(bytes.map((b) => String.fromCharCode(b)).join(""))
    .replace(/[+/=]/g, "X")
    .slice(0, 32);
}

/** Login-only recovery — never creates accounts (safe for corrupted credentials users). */
async function tryDeterministicLoginRecovery(
  payload: SyncUserPayload,
): Promise<string | null> {
  const syncSecret = process.env.FINDY_SYNC_SECRET;
  if (!syncSecret || !payload.email) return null;

  const password = await deterministicPassword(payload.id, syncSecret);
  return findyLogin(payload.email, password);
}

/**
 * Google/OAuth users are upserted into the shared Neon `users` table without
 * a password. findySignup then returns 409 and findyLogin fails on null hash.
 * Set a deterministic PBKDF2 hash so findy-core /auth/login can issue a JWT.
 */
async function ensureSharedDbPasswordForOAuthUser(
  userId: string,
  password: string,
): Promise<boolean> {
  try {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const { hashFindyPassword } = await import("@/lib/auth/hash-findy-password");

    const [existing] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existing || existing.passwordHash) return false;

    const passwordHash = await hashFindyPassword(password);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return true;
  } catch {
    return false;
  }
}

/** OAuth fallback when sync-user is not deployed — login, signup, or patch shared DB. */
async function provisionWithDeterministicPassword(
  payload: SyncUserPayload,
): Promise<string | null> {
  const syncSecret = process.env.FINDY_SYNC_SECRET;
  if (!syncSecret || !payload.email) return null;

  const password = await deterministicPassword(payload.id, syncSecret);

  const fromLogin = await findyLogin(payload.email, password);
  if (fromLogin) return fromLogin;

  const fromSignup = await findySignup({
    email: payload.email,
    password,
    firstName: payload.firstName || "User",
    lastName: payload.lastName || "",
  });
  if (fromSignup) return fromSignup;

  const patched = await ensureSharedDbPasswordForOAuthUser(payload.id, password);
  if (patched) {
    return findyLogin(payload.email, password);
  }

  return null;
}

/**
 * Obtains a findy-core JWT for the current frontend user.
 *
 * Strategy order:
 * 1. POST /auth/sync-user (OAuth + credentials, same frontend id)
 * 2. POST /auth/signup then /auth/login with real password (credentials)
 * 3. Deterministic login only (recovery for users created with wrong password)
 * 4. Deterministic login then signup (OAuth only, pre-sync-user deploy)
 */
export async function provisionFindyCoreToken(
  input: ProvisionFindyTokenInput,
): Promise<string | null> {
  const payload: SyncUserPayload = {
    id: input.id,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
  };

  const synced = await syncUserToFindyCore(payload);
  if (synced) return synced;

  if (input.password) {
    const fromSignup = await findySignup({
      firstName: input.firstName || "User",
      lastName: input.lastName || "",
      email: input.email,
      password: input.password,
    });
    if (fromSignup) return fromSignup;

    const fromLogin = await findyLogin(input.email, input.password);
    if (fromLogin) return fromLogin;

    // User may exist in findy-core with a deterministic password from an earlier bug.
    return tryDeterministicLoginRecovery(payload);
  }

  return provisionWithDeterministicPassword(payload);
}
