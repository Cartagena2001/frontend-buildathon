/**
 * Tests for findy-core auth bridge (provisionFindyCoreToken, signup, login, sync-user).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const SYNC_SECRET = "test-sync-secret";
const BASE_URL = "https://api.findy.place";
const FINDY_JWT = "eyJhbGci.test.token";

const USER = {
  id: "d4e5f6a7-b8c9-4012-8345-6789abcdef01",
  email: "user@example.com",
  firstName: "Salvador",
  lastName: "Cartajena",
  password: "fifa2012",
};

function mockOk(token = FINDY_JWT) {
  return { ok: true, json: async () => ({ token }) } as Response;
}

function mockFail(status: number) {
  return { ok: false, status, json: async () => ({ error: "fail" }) } as Response;
}

describe("provisionFindyCoreToken", () => {
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

  it("uses sync-user when available (strategy 1)", async () => {
    mockFetch.mockResolvedValueOnce(mockOk());
    const { provisionFindyCoreToken } = await import("@/lib/findy-core/auth");
    const token = await provisionFindyCoreToken(USER);
    expect(token).toBe(FINDY_JWT);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("/auth/sync-user");
  });

  it("falls back to signup with real password when sync-user fails (credentials register)", async () => {
    mockFetch
      .mockResolvedValueOnce(mockFail(404)) // sync-user
      .mockResolvedValueOnce(mockOk()); // signup

    const { provisionFindyCoreToken } = await import("@/lib/findy-core/auth");
    const token = await provisionFindyCoreToken(USER);

    expect(token).toBe(FINDY_JWT);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const signupCall = mockFetch.mock.calls[1];
    expect(signupCall[0]).toContain("/auth/signup");
    const body = JSON.parse(signupCall[1].body);
    expect(body.email).toBe(USER.email);
    expect(body.password).toBe(USER.password);
    expect(body.firstName).toBe(USER.firstName);
  });

  it("falls back to login when signup returns 409 (user already exists)", async () => {
    mockFetch
      .mockResolvedValueOnce(mockFail(404)) // sync-user
      .mockResolvedValueOnce(mockFail(409)) // signup conflict
      .mockResolvedValueOnce(mockOk()); // login

    const { provisionFindyCoreToken } = await import("@/lib/findy-core/auth");
    const token = await provisionFindyCoreToken(USER);

    expect(token).toBe(FINDY_JWT);
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch.mock.calls[2][0]).toContain("/auth/login");
  });

  it("uses login directly for credentials login (sync fails, signup fails, login ok)", async () => {
    mockFetch
      .mockResolvedValueOnce(mockFail(403)) // sync-user forbidden
      .mockResolvedValueOnce(mockFail(409)) // signup exists
      .mockResolvedValueOnce(mockOk()); // login

    const { provisionFindyCoreToken } = await import("@/lib/findy-core/auth");
    const token = await provisionFindyCoreToken(USER);
    expect(token).toBe(FINDY_JWT);
  });

  it("returns null when all strategies fail", async () => {
    mockFetch.mockResolvedValue(mockFail(401));
    const { provisionFindyCoreToken } = await import("@/lib/findy-core/auth");
    const token = await provisionFindyCoreToken(USER);
    expect(token).toBeNull();
  });

  it("OAuth without password tries deterministic login before signup", async () => {
    const { password: _, ...oauthUser } = USER;
    mockFetch
      .mockResolvedValueOnce(mockFail(404)) // sync-user
      .mockResolvedValueOnce(mockFail(401)) // deterministic login
      .mockResolvedValueOnce(mockOk()); // deterministic signup

    const { provisionFindyCoreToken } = await import("@/lib/findy-core/auth");
    const token = await provisionFindyCoreToken(oauthUser);
    expect(token).toBe(FINDY_JWT);
    expect(mockFetch.mock.calls[1][0]).toContain("/auth/login");
    expect(mockFetch.mock.calls[2][0]).toContain("/auth/signup");
  });

  it("OAuth user already in shared DB without password gets hash patched then login", async () => {
    const { password: _, ...oauthUser } = USER;

    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    const mockSelect = vi.fn().mockResolvedValue([{ passwordHash: null }]);

    vi.doMock("@/lib/db", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: mockSelect,
            }),
          }),
        }),
        update: () => ({
          set: () => ({
            where: mockUpdate,
          }),
        }),
      },
    }));

    mockFetch
      .mockResolvedValueOnce(mockFail(404)) // sync-user
      .mockResolvedValueOnce(mockFail(401)) // deterministic login
      .mockResolvedValueOnce(mockFail(409)) // signup — email exists in shared DB
      .mockResolvedValueOnce(mockOk()); // login after password patch

    vi.resetModules();
    const { provisionFindyCoreToken } = await import("@/lib/findy-core/auth");
    const token = await provisionFindyCoreToken(oauthUser);

    expect(token).toBe(FINDY_JWT);
    expect(mockSelect).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockFetch.mock.calls[3][0]).toContain("/auth/login");
  });

  it("credentials user tries deterministic login recovery when real password fails", async () => {
    mockFetch
      .mockResolvedValueOnce(mockFail(404)) // sync-user
      .mockResolvedValueOnce(mockFail(409)) // signup conflict
      .mockResolvedValueOnce(mockFail(401)) // login with real password
      .mockResolvedValueOnce(mockOk()); // deterministic login recovery

    const { provisionFindyCoreToken } = await import("@/lib/findy-core/auth");
    const token = await provisionFindyCoreToken(USER);
    expect(token).toBe(FINDY_JWT);
    expect(mockFetch).toHaveBeenCalledTimes(4);
    expect(mockFetch.mock.calls[3][0]).toContain("/auth/login");
  });
});

describe("findySignup", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.FINDY_CORE_API_URL = BASE_URL;
    mockFetch.mockReset();
  });

  it("returns token on 201", async () => {
    mockFetch.mockResolvedValueOnce(mockOk());
    const { findySignup } = await import("@/lib/findy-core/auth");
    const token = await findySignup({
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      password: "password123",
    });
    expect(token).toBe(FINDY_JWT);
  });

  it("returns null on 409", async () => {
    mockFetch.mockResolvedValueOnce(mockFail(409));
    const { findySignup } = await import("@/lib/findy-core/auth");
    const token = await findySignup({
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      password: "password123",
    });
    expect(token).toBeNull();
  });
});

describe("findyLogin", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.FINDY_CORE_API_URL = BASE_URL;
    mockFetch.mockReset();
  });

  it("returns token on successful login", async () => {
    mockFetch.mockResolvedValueOnce(mockOk());
    const { findyLogin } = await import("@/lib/findy-core/auth");
    const token = await findyLogin("user@example.com", "fifa2012");
    expect(token).toBe(FINDY_JWT);
  });

  it("returns null on invalid credentials", async () => {
    mockFetch.mockResolvedValueOnce(mockFail(401));
    const { findyLogin } = await import("@/lib/findy-core/auth");
    const token = await findyLogin("user@example.com", "wrong");
    expect(token).toBeNull();
  });
});
