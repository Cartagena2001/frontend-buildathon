/**
 * Tests for getFindyToken — the function that produces the findy-core
 * Bearer token from the current NextAuth session.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockAuth = vi.hoisted(() => vi.fn());
const mockFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.stubGlobal("fetch", mockFetch);

const USER_ID = "d4e5f6a7-b8c9-4012-d345-6789abcdef01";
const JWT_SECRET = "test-secret-key";
const FINDY_JWT = "eyJhbGci.test.findy-core-token";

function mockOk(token = FINDY_JWT) {
  return { ok: true, json: async () => ({ token }) } as Response;
}

describe("getFindyToken", () => {
  const env = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...env,
      JWT_SECRET,
      FINDY_SYNC_SECRET: "sync-secret",
      FINDY_CORE_API_URL: "https://api.findy.place",
    };
    mockFetch.mockReset();
    mockAuth.mockReset();
  });

  afterEach(() => {
    process.env = env;
    vi.clearAllMocks();
  });

  it("returns null when there is no session", async () => {
    mockAuth.mockResolvedValue(null);
    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBeNull();
  });

  it("returns null when session.user has no id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "", email: "x@test.com" } });
    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBeNull();
  });

  it("returns stored findyCoreToken from session without calling API", async () => {
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: "creds@test.com" },
      findyCoreToken: FINDY_JWT,
    });
    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBe(FINDY_JWT);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("re-provisions via findy-core when token is missing (prod)", async () => {
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: "creds@test.com", name: "Test User" },
    });
    mockFetch.mockResolvedValueOnce(mockOk());

    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBe(FINDY_JWT);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("returns null on prod when provision fails (no self-sign fallback)", async () => {
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: "creds@test.com", name: "Test User" },
    });
    mockFetch.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });

    const { getFindyToken } = await import("@/lib/findy-core/token");
    expect(await getFindyToken()).toBeNull();
  });

  it("self-signs only for local findy-core when provision fails", async () => {
    process.env.FINDY_CORE_API_URL = "http://localhost:3000";
    vi.resetModules();
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: "creds@test.com", name: "Test User" },
    });
    mockFetch.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });

    const { getFindyToken } = await import("@/lib/findy-core/token");
    const token = await getFindyToken();
    expect(token).not.toBeNull();
    expect(token!.split(".")).toHaveLength(3);
  });
});
