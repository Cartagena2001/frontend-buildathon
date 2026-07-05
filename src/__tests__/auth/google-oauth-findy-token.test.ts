/**
 * Integration test: full Google OAuth → NextAuth session → findy-core token chain.
 *
 * Simulates what happens from the moment the Google OAuth bridge sets the
 * session until findy-core receives the Authorization header.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";

const JWT_SECRET = "integration-test-secret";

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/findy-core/token", async (importOriginal) => {
  // Use the REAL implementation — we want to test actual behavior
  return importOriginal();
});

const GOOGLE_USER = {
  id:    "a1b2c3d4-e5f6-4789-a012-3456789abcde",
  email: "juan@gmail.com",
  name:  "Juan García",
};

describe("Google OAuth → findy-core token chain", () => {
  const env = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...env, JWT_SECRET };
  });

  afterEach(() => {
    process.env = env;
    vi.clearAllMocks();
  });

  // ── Scenario 1: Session has email (after fix) ─────────────────────────────

  it("generates a valid findy-core token when Google session has email", async () => {
    // This is the expected state AFTER our auth.config fix:
    // session.user.email is populated by the session callback.
    mockAuth.mockResolvedValue({ user: GOOGLE_USER });

    const { getFindyToken } = await import("@/lib/findy-core/token");
    const token = await getFindyToken();

    expect(token).not.toBeNull();

    const [header, payloadB64, sig] = token!.split(".");

    // Header must declare HS256
    const headerObj = JSON.parse(Buffer.from(header, "base64url").toString());
    expect(headerObj.alg).toBe("HS256");
    expect(headerObj.typ).toBe("JWT");

    // Payload has correct claims
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    expect(payload.sub).toBe(GOOGLE_USER.id);
    expect(payload.email).toBe(GOOGLE_USER.email);

    // Signature must be verifiable with the shared secret
    const expected = createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payloadB64}`)
      .digest("base64url");
    expect(sig).toBe(expected);
  });

  // ── Scenario 2: Session email is null (before fix / edge case) ────────────

  it("still generates a valid token when session.user.email is null (regression guard)", async () => {
    // Before the fix this returned null → 401 from findy-core.
    mockAuth.mockResolvedValue({ user: { ...GOOGLE_USER, email: null } });

    const { getFindyToken } = await import("@/lib/findy-core/token");
    const token = await getFindyToken();

    // Must produce a token — not null
    expect(token).not.toBeNull();
    expect(token!.split(".")).toHaveLength(3);

    const payload = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString());
    expect(payload.sub).toBe(GOOGLE_USER.id);
    // email falls back to "" but token is still generated
    expect(typeof payload.email).toBe("string");
  });

  // ── Scenario 3: auth() callback → jwt() → session() flow ─────────────────

  it("auth config jwt callback propagates Google user fields to token", async () => {
    const { authConfig } = await import("@/lib/auth/auth.config");
    const jwtCb = authConfig.callbacks!.jwt!;

    // Simulate NextAuth calling jwt() for the first time with a Google user
    const token = { sub: GOOGLE_USER.id, iat: 1000, exp: 2000, jti: "j1" };
    const result = await jwtCb({ token, user: GOOGLE_USER as never, account: null, trigger: "signIn" } as never);

    expect(result.id).toBe(GOOGLE_USER.id);
    expect(result.email).toBe(GOOGLE_USER.email);
    expect(result.name).toBe(GOOGLE_USER.name);
  });

  it("auth config session callback propagates token email to session.user", async () => {
    const { authConfig } = await import("@/lib/auth/auth.config");
    const sessionCb = authConfig.callbacks!.session!;

    const token = {
      sub: GOOGLE_USER.id,
      id: GOOGLE_USER.id,
      email: GOOGLE_USER.email,
      name: GOOGLE_USER.name,
      iat: 1000,
      exp: 2000,
      jti: "j1",
    };

    const session = {
      user: { id: "", name: null, email: null, image: null },
      expires: "2099-01-01T00:00:00.000Z",
    } as Parameters<typeof sessionCb>[0]["session"];

    const result = await sessionCb({ session, token, user: undefined as never, trigger: "update" });

    expect(result.user.id).toBe(GOOGLE_USER.id);
    expect(result.user.email).toBe(GOOGLE_USER.email);
    expect(result.user.name).toBe(GOOGLE_USER.name);
  });

  // ── Scenario 4: Verify token is suitable for findy-core authGuard ─────────

  it("generated token has all fields findy-core authGuard expects", async () => {
    mockAuth.mockResolvedValue({ user: GOOGLE_USER });

    const { getFindyToken } = await import("@/lib/findy-core/token");
    const token = await getFindyToken();
    const payload = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString());

    // findy-core's AuthTokenPayload requires: sub, email, exp
    expect(typeof payload.sub).toBe("string");
    expect(payload.sub).not.toBe("");
    expect(typeof payload.email).toBe("string");
    expect(typeof payload.exp).toBe("number");
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  // ── Scenario 5: Token is not sent when unauthenticated ────────────────────

  it("returns null when user is not authenticated (no session)", async () => {
    mockAuth.mockResolvedValue(null);
    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBeNull();
  });

  it("returns null when session exists but user id is missing", async () => {
    mockAuth.mockResolvedValue({ user: { email: "x@test.com" } });
    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBeNull();
  });
});
