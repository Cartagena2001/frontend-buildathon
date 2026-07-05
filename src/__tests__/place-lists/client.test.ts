import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/findy-core/token", () => ({
  getFindyToken: vi.fn().mockResolvedValue("test-jwt"),
  signFindyToken: vi.fn(),
}));

describe("getFindyApiBaseUrl", () => {
  const env = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...env };
    delete process.env.FINDY_CORE_API_URL;
    delete process.env.FINDY_CORE_PROXY_HOST;
  });

  afterEach(() => {
    process.env = env;
  });

  it("uses FINDY_CORE_API_URL when set to absolute http URL", async () => {
    process.env.FINDY_CORE_API_URL = "https://api.example.com/";
    const { getFindyApiBaseUrl } = await import("@/lib/findy-core/client");
    expect(getFindyApiBaseUrl()).toBe("https://api.example.com");
  });

  it("defaults to FINDY_CORE_INTERNAL_URL", async () => {
    process.env.FINDY_CORE_INTERNAL_URL = "http://localhost:3000";
    const { getFindyApiBaseUrl } = await import("@/lib/findy-core/client");
    expect(getFindyApiBaseUrl()).toBe("http://localhost:3000");
  });

  it("falls back to NEXT_PUBLIC_FINDY_CORE_API", async () => {
    process.env.NEXT_PUBLIC_FINDY_CORE_API = "https://api.findy.place/";
    const { getFindyApiBaseUrl } = await import("@/lib/findy-core/client");
    expect(getFindyApiBaseUrl()).toBe("https://api.findy.place");
  });

  it("falls back to localhost:3000 when no env is set", async () => {
    delete process.env.FINDY_CORE_INTERNAL_URL;
    const { getFindyApiBaseUrl } = await import("@/lib/findy-core/client");
    expect(getFindyApiBaseUrl()).toBe("http://localhost:3000");
  });
});

describe("findyFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    process.env.FINDY_CORE_API_URL = "http://findy.test";
    vi.doMock("@/lib/findy-core/token", () => ({
      getFindyToken: vi.fn().mockResolvedValue("test-jwt"),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends Authorization header when token is provided", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ lists: [] }),
    });

    const { findyFetch } = await import("@/lib/findy-core/client");
    await findyFetch("/place-lists", { token: "my-jwt" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://findy.test/place-lists",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-jwt",
        }),
      }),
    );
  });

  it("throws FindyApiError with helpful message on 404", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    const { findyFetch, FindyApiError } = await import("@/lib/findy-core/client");

    await expect(
      findyFetch("/place-lists", { token: "t", method: "POST", body: { name: "x" } }),
    ).rejects.toMatchObject({
      name: "FindyApiError",
      status: 404,
      message: expect.stringContaining("FINDY_CORE_INTERNAL_URL"),
    });
  });

  it("throws FindyApiError on network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const { findyFetch } = await import("@/lib/findy-core/client");

    await expect(
      findyFetch("/place-lists", { token: "t" }),
    ).rejects.toThrow(/Cannot reach findy-core/);
  });

  it("returns undefined for 204 responses", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204 });

    const { findyFetch } = await import("@/lib/findy-core/client");
    const result = await findyFetch("/place-lists/abc", {
      token: "t",
      method: "DELETE",
    });

    expect(result).toBeUndefined();
  });
});
