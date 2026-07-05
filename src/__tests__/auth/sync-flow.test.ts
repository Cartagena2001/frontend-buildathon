/**
 * Tests for syncUserToFindyCore — the server-to-server bridge that exchanges
 * a NextAuth session for a findy-core-issued JWT.
 *
 * Uses the strategy 1 path (dedicated /auth/sync-user endpoint) and
 * strategy 2 fallback (signup → login with deterministic password).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const SYNC_SECRET = "test-sync-secret";
const BASE_URL = "https://api.findy.place";
const FINDY_JWT = "header.payload.signature";

const USER = {
  id: "d4e5f6a7-b8c9-4012-8345-6789abcdef01",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
};

function mockSyncUserOk() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ token: FINDY_JWT }),
  } as Response);
}

function mockSyncUserNotFound() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
    json: async () => ({ error: "Not found" }),
  } as Response);
}

function mockSignupOk() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 201,
    json: async () => ({ token: "ignored" }),
  } as Response);
}

function mockSignup409() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 409,
    json: async () => ({ error: "Email already registered" }),
  } as Response);
}

function mockLoginOk() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ token: FINDY_JWT }),
  } as Response);
}

function mockLoginFail() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({ error: "Invalid email or password" }),
  } as Response);
}

describe("syncUserToFindyCore", () => {
  const env = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...env,
      FINDY_SYNC_SECRET: SYNC_SECRET,
      FINDY_CORE_API_URL: BASE_URL,
    };
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = env;
  });

  // ── Returns null when FINDY_SYNC_SECRET is missing ──────────────────────────

  it("returns null when FINDY_SYNC_SECRET is not configured", async () => {
    delete process.env.FINDY_SYNC_SECRET;
    vi.resetModules();
    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    const result = await syncUserToFindyCore(USER);
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ── Strategy 1: /auth/sync-user ─────────────────────────────────────────────

  it("returns findy-core JWT from sync-user endpoint (strategy 1)", async () => {
    mockSyncUserOk();
    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    const token = await syncUserToFindyCore(USER);
    expect(token).toBe(FINDY_JWT);
  });

  it("calls sync-user with correct Authorization header", async () => {
    mockSyncUserOk();
    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    await syncUserToFindyCore(USER);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/auth/sync-user");
    expect((options?.headers as Record<string, string>)?.Authorization).toBe(
      `Bearer ${SYNC_SECRET}`,
    );
  });

  it("sends correct user data in sync-user request body", async () => {
    mockSyncUserOk();
    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    await syncUserToFindyCore(USER);

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options?.body as string);
    expect(body.id).toBe(USER.id);
    expect(body.email).toBe(USER.email);
    expect(body.firstName).toBe(USER.firstName);
    expect(body.lastName).toBe(USER.lastName);
  });

  // ── Strategy 2: signup + login fallback ─────────────────────────────────────

  it("falls back to signup+login when sync-user returns 404", async () => {
    mockSyncUserNotFound();
    mockSignupOk();
    mockLoginOk();

    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    const token = await syncUserToFindyCore(USER);

    expect(token).toBe(FINDY_JWT);
    expect(mockFetch).toHaveBeenCalledTimes(3); // sync-user + signup + login
  });

  it("uses login when signup returns 409 (user already exists)", async () => {
    mockSyncUserNotFound();
    mockSignup409();
    mockLoginOk();

    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    const token = await syncUserToFindyCore(USER);

    expect(token).toBe(FINDY_JWT);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("returns null when sync-user is missing and login also fails", async () => {
    mockSyncUserNotFound();
    mockSignup409();
    mockLoginFail();

    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    const token = await syncUserToFindyCore(USER);

    expect(token).toBeNull();
  });

  it("signup and login use the same deterministic password", async () => {
    mockSyncUserNotFound();
    mockSignupOk();
    mockLoginOk();

    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    await syncUserToFindyCore(USER);

    const signupCall = mockFetch.mock.calls[1];
    const loginCall = mockFetch.mock.calls[2];
    const signupBody = JSON.parse(signupCall[1].body);
    const loginBody = JSON.parse(loginCall[1].body);

    expect(signupBody.password).toBe(loginBody.password);
    expect(signupBody.password.length).toBeGreaterThan(0);
  });

  it("deterministic password is the same for the same user across calls", async () => {
    mockSyncUserNotFound();
    mockSignupOk();
    mockLoginOk();
    mockSyncUserNotFound();
    mockSignupOk();
    mockLoginOk();

    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    await syncUserToFindyCore(USER);
    await syncUserToFindyCore(USER);

    const signupBody1 = JSON.parse(mockFetch.mock.calls[1][1].body);
    const signupBody2 = JSON.parse(mockFetch.mock.calls[4][1].body);
    expect(signupBody1.password).toBe(signupBody2.password);
  });

  // ── Network error handling ────────────────────────────────────────────────────

  it("returns null when fetch throws (network error)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const { syncUserToFindyCore } = await import("@/lib/findy-core/sync");
    const token = await syncUserToFindyCore(USER);
    expect(token).toBeNull();
  });

  // ── Auth config integration ───────────────────────────────────────────────────

  it("auth config jwt callback stores findyCoreToken in token on sign-in", async () => {
    mockSyncUserOk();

    const { authConfig } = await import("@/lib/auth/auth.config");
    const jwtCb = authConfig.callbacks!.jwt!;

    const token = { sub: USER.id, iat: 1000, exp: 2000, jti: "j1" };
    const user = {
      id: USER.id,
      email: USER.email,
      name: `${USER.firstName} ${USER.lastName}`,
    };

    const result = await jwtCb({ token, user: user as never, account: null, trigger: "signIn" } as never);

    expect(result.findyCoreToken).toBe(FINDY_JWT);
  });

  it("auth config session callback exposes findyCoreToken to session", async () => {
    const { authConfig } = await import("@/lib/auth/auth.config");
    const sessionCb = authConfig.callbacks!.session!;

    const token = {
      id: USER.id,
      email: USER.email,
      name: `${USER.firstName} ${USER.lastName}`,
      findyCoreToken: FINDY_JWT,
      sub: USER.id,
      iat: 1000,
      exp: 2000,
      jti: "j1",
    };

    const session = {
      user: { id: "", name: null, email: null, image: null },
      expires: "2099-01-01T00:00:00.000Z",
    } as Parameters<typeof sessionCb>[0]["session"];

    const result = await sessionCb({ session, token, user: undefined as never, trigger: "update" });

    expect((result as { findyCoreToken?: string }).findyCoreToken).toBe(FINDY_JWT);
  });

  // ── getFindyToken uses stored token ──────────────────────────────────────────

  it("getFindyToken returns findyCoreToken from session when available", async () => {
    const mockAuth = vi.fn().mockResolvedValue({
      user: { id: USER.id, email: USER.email },
      findyCoreToken: FINDY_JWT,
    });
    vi.doMock("@/lib/auth", () => ({ auth: mockAuth }));

    const { getFindyToken } = await import("@/lib/findy-core/token");
    const token = await getFindyToken();

    expect(token).toBe(FINDY_JWT);
    // Should NOT make any fetch calls (using cached findy-core token)
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("getFindyToken falls back to self-signed when no findyCoreToken in session", async () => {
    vi.resetModules();
    process.env.JWT_SECRET = "test-jwt-secret";

    const mockAuth = vi.fn().mockResolvedValue({
      user: { id: USER.id, email: USER.email },
      // No findyCoreToken
    });
    vi.doMock("@/lib/auth", () => ({ auth: mockAuth }));

    const { getFindyToken } = await import("@/lib/findy-core/token");
    const token = await getFindyToken();

    expect(token).not.toBeNull();
    expect(token!.split(".")).toHaveLength(3);
    // Self-signed token has sub = user.id
    const payload = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString());
    expect(payload.sub).toBe(USER.id);
  });
});
