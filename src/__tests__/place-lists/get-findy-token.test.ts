/**
 * Tests for getFindyToken — the function that produces the findy-core
 * Bearer token from the current NextAuth session.
 *
 * Covers the Google OAuth regression where session.user.email could be null,
 * causing getFindyToken to return null and findy-core to respond 401.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

const USER_ID = "d4e5f6a7-b8c9-4012-d345-6789abcdef01";
const JWT_SECRET = "test-secret-key";

describe("getFindyToken", () => {
  const env = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...env, JWT_SECRET };
  });

  afterEach(() => {
    process.env = env;
    vi.clearAllMocks();
  });

  // ── Unauthenticated ──────────────────────────────────────────────────────

  it("returns null when there is no session", async () => {
    mockAuth.mockResolvedValue(null);
    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBeNull();
  });

  it("returns null when session has no user", async () => {
    mockAuth.mockResolvedValue({ user: undefined });
    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBeNull();
  });

  it("returns null when session.user has no id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "", email: "x@test.com" } });
    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBeNull();
  });

  // ── Credentials user (happy path) ────────────────────────────────────────

  it("returns a signed JWT for a credentials user (id + email present)", async () => {
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: "creds@test.com", name: "Test User" },
    });
    const { getFindyToken } = await import("@/lib/findy-core/token");

    const token = await getFindyToken();
    expect(token).not.toBeNull();

    const parts = token!.split(".");
    expect(parts).toHaveLength(3);

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    expect(payload.sub).toBe(USER_ID);
    expect(payload.email).toBe("creds@test.com");
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  // ── Google OAuth user — the regression scenario ───────────────────────────

  it("returns a signed JWT for a Google OAuth user even when session.user.email is null", async () => {
    // Before the fix, this returned null → 401 Unauthorized from findy-core.
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: null, name: "Google User" },
    });
    const { getFindyToken } = await import("@/lib/findy-core/token");

    const token = await getFindyToken();

    // Must NOT be null — we need a token to send the Authorization header
    expect(token).not.toBeNull();

    const parts = token!.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    expect(payload.sub).toBe(USER_ID);
    expect(payload.email).toBe(""); // fallback to empty string
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("returns a signed JWT for a Google OAuth user when email is undefined", async () => {
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: undefined },
    });
    const { getFindyToken } = await import("@/lib/findy-core/token");

    const token = await getFindyToken();
    expect(token).not.toBeNull();

    const payload = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString());
    expect(payload.sub).toBe(USER_ID);
  });

  // ── Token validity ────────────────────────────────────────────────────────

  it("produces a token with 7-day expiry", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_ID, email: "x@test.com" } });
    const { getFindyToken } = await import("@/lib/findy-core/token");

    const before = Math.floor(Date.now() / 1000);
    const token = await getFindyToken();
    const after = Math.floor(Date.now() / 1000);

    const payload = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString());
    const sevenDays = 60 * 60 * 24 * 7;

    expect(payload.exp).toBeGreaterThanOrEqual(before + sevenDays - 1);
    expect(payload.exp).toBeLessThanOrEqual(after + sevenDays + 1);
  });

  it("signature is HMAC-SHA256 of header.payload with JWT_SECRET", async () => {
    const { createHmac } = await import("crypto");
    mockAuth.mockResolvedValue({ user: { id: USER_ID, email: "x@test.com" } });
    const { getFindyToken } = await import("@/lib/findy-core/token");

    const token = await getFindyToken();
    const [header, payload, sig] = token!.split(".");

    const expected = createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    expect(sig).toBe(expected);
  });

  it("throws if JWT_SECRET is not set", async () => {
    delete process.env.JWT_SECRET;
    vi.resetModules();
    mockAuth.mockResolvedValue({ user: { id: USER_ID, email: "x@test.com" } });

    const { getFindyToken } = await import("@/lib/findy-core/token");
    await expect(getFindyToken()).rejects.toThrow("JWT_SECRET");
  });
});
