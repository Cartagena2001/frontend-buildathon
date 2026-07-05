import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHmac } from "crypto";

describe("signFindyToken", () => {
  const env = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...env, JWT_SECRET: "test-secret-key" };
  });

  afterEach(() => {
    process.env = env;
  });

  it("produces a valid HS256 JWT with sub and email", async () => {
    const { signFindyToken } = await import("@/lib/findy-core/token");
    const token = signFindyToken("d4e5f6a7-b8c9-4012-d345-6789abcdef01", "user@test.com");

    const parts = token.split(".");
    expect(parts).toHaveLength(3);

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    );
    expect(payload.sub).toBe("d4e5f6a7-b8c9-4012-d345-6789abcdef01");
    expect(payload.email).toBe("user@test.com");
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

    const [header, payloadB64, sig] = parts;
    const expected = createHmac("sha256", "test-secret-key")
      .update(`${header}.${payloadB64}`)
      .digest("base64url");
    expect(sig).toBe(expected);
  });

  it("throws when JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;
    vi.resetModules();
    const { signFindyToken } = await import("@/lib/findy-core/token");
    expect(() => signFindyToken("id", "a@b.c")).toThrow("JWT_SECRET");
  });
});

describe("isUuid", () => {
  it("validates UUID v4 format", async () => {
    const { isUuid } = await import("@/features/place-lists/types");
    expect(isUuid("b2c3d4e5-f6a7-4890-b123-456789abcdef")).toBe(true);
    expect(isUuid("el-tunco")).toBe(false);
    expect(isUuid("b2c3d4e5-f6a7-4890-b123-456789abcdef0")).toBe(false);
  });
});
