/**
 * Tests for syncUserToFindyCore — re-exports from auth.ts; see findy-auth.test.ts
 * for full provisionFindyCoreToken coverage.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

  it("returns null when FINDY_SYNC_SECRET is not configured", async () => {
    delete process.env.FINDY_SYNC_SECRET;
    vi.resetModules();
    const { syncUserToFindyCore } = await import("@/lib/findy-core/auth");
    const result = await syncUserToFindyCore(USER);
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns findy-core JWT from sync-user endpoint", async () => {
    mockSyncUserOk();
    const { syncUserToFindyCore } = await import("@/lib/findy-core/auth");
    const token = await syncUserToFindyCore(USER);
    expect(token).toBe(FINDY_JWT);
    expect(mockFetch.mock.calls[0][0]).toContain("/auth/sync-user");
  });
});

describe("auth config integration", () => {
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

  it("jwt callback copies findyCoreToken from register signup without API call", async () => {
    const { authConfig } = await import("@/lib/auth/auth.config");
    const jwtCb = authConfig.callbacks!.jwt!;

    const token = { sub: USER.id, iat: 1000, exp: 2000, jti: "j1" };
    const user = {
      id: USER.id,
      email: USER.email,
      name: `${USER.firstName} ${USER.lastName}`,
      findyCoreToken: FINDY_JWT,
    };

    const result = await jwtCb({ token, user: user as never, account: null, trigger: "signIn" } as never);
    expect(result.findyCoreToken).toBe(FINDY_JWT);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("jwt callback stores findyCoreToken using credentials password", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: FINDY_JWT }) } as Response);

    const { authConfig } = await import("@/lib/auth/auth.config");
    const jwtCb = authConfig.callbacks!.jwt!;

    const token = { sub: USER.id, iat: 1000, exp: 2000, jti: "j1" };
    const user = {
      id: USER.id,
      email: USER.email,
      name: `${USER.firstName} ${USER.lastName}`,
      findyPassword: "fifa2012",
    };

    const result = await jwtCb({ token, user: user as never, account: null, trigger: "signIn" } as never);
    expect(result.findyCoreToken).toBe(FINDY_JWT);
  });

  it("session callback exposes findyCoreToken", async () => {
    const { authConfig } = await import("@/lib/auth/auth.config");
    const sessionCb = authConfig.callbacks!.session!;

    const token = {
      id: USER.id,
      email: USER.email,
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
});
