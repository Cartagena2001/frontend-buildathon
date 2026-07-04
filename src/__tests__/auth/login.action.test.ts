/**
 * Unit tests for loginUser server action.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSignIn   = vi.fn().mockResolvedValue(undefined);
const mockRedirect = vi.fn();

class AuthError extends Error {}

vi.mock("next-auth", () => ({
  default:   vi.fn(),
  AuthError,
}));
vi.mock("@/lib/auth", () => ({ signIn: mockSignIn }));
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
vi.mock("next-intl/server", () => ({ getLocale: vi.fn().mockResolvedValue("es") }));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/db/schema", () => ({ users: {} }));
vi.mock("drizzle-orm", () => ({ eq: vi.fn() }));
vi.mock("bcryptjs", () => ({ hash: vi.fn(), compare: vi.fn() }));

// ── Import under test ──────────────────────────────────────────────────────

const { loginUser } = await import("@/lib/auth/actions");

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults = { email: "user@example.com", password: "password123" };
  Object.entries({ ...defaults, ...overrides }).forEach(([k, v]) =>
    fd.append(k, v)
  );
  return fd;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
  });

  it("returns error when email is empty", async () => {
    const result = await loginUser({}, makeFormData({ email: "" }));
    expect(result.error).toBe("Email and password are required.");
  });

  it("returns error when password is empty", async () => {
    const result = await loginUser({}, makeFormData({ password: "" }));
    expect(result.error).toBe("Email and password are required.");
  });

  it("returns error on wrong credentials (AuthError)", async () => {
    mockSignIn.mockRejectedValueOnce(new AuthError("CredentialsSignin"));
    const result = await loginUser({}, makeFormData());
    expect(result.error).toBe("Invalid email or password.");
  });

  it("calls signIn with the provided credentials", async () => {
    try {
      await loginUser({}, makeFormData());
    } catch {
      // redirect
    }
    expect(mockSignIn).toHaveBeenCalledWith(
      "credentials",
      { email: "user@example.com", password: "password123", redirect: false }
    );
  });

  it("normalizes email to lowercase before calling signIn", async () => {
    try {
      await loginUser({}, makeFormData({ email: "  User@Example.COM  " }));
    } catch {
      // redirect
    }
    expect(mockSignIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ email: "user@example.com" })
    );
  });

  it("redirects to /es/explore on successful login", async () => {
    let redirectTarget = "";
    mockRedirect.mockImplementationOnce((url: string) => {
      redirectTarget = url;
      throw new Error("NEXT_REDIRECT");
    });

    try {
      await loginUser({}, makeFormData());
    } catch (e: unknown) {
      if ((e as Error).message !== "NEXT_REDIRECT") throw e;
    }

    expect(redirectTarget).toBe("/es/explore");
  });

  it("re-throws non-AuthError exceptions", async () => {
    const unexpectedError = new Error("Database is down");
    mockSignIn.mockRejectedValueOnce(unexpectedError);

    await expect(loginUser({}, makeFormData())).rejects.toThrow("Database is down");
  });
});
