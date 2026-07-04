/**
 * Unit tests for registerUser server action.
 *
 * All external dependencies (db, bcrypt, signIn, redirect) are mocked
 * so these tests run without a real database.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockInsert  = vi.fn().mockReturnThis();
const mockValues  = vi.fn().mockResolvedValue(undefined);
const mockSelect  = vi.fn().mockReturnThis();
const mockFrom    = vi.fn().mockReturnThis();
const mockWhere   = vi.fn().mockReturnThis();
const mockLimit   = vi.fn().mockResolvedValue([]); // no existing user by default

vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({ values: mockValues }),
    select: () => ({ from: mockFrom }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockWhere.mockReturnValue({ limit: mockLimit });

vi.mock("@/lib/db/schema", () => ({
  users: { id: "id", email: "email" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash:    vi.fn().mockResolvedValue("hashed_password"),
  compare: vi.fn().mockResolvedValue(true),
}));

const mockSignIn  = vi.fn().mockResolvedValue(undefined);
const mockRedirect = vi.fn();

vi.mock("next-auth", () => ({
  default:   vi.fn(),
  AuthError: class AuthError extends Error {},
}));
vi.mock("@/lib/auth", () => ({ signIn: mockSignIn }));
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
vi.mock("next-intl/server", () => ({ getLocale: vi.fn().mockResolvedValue("es") }));
vi.mock("@/lib/auth/password-reset", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/auth/password-reset-actions", () => ({
  getAppBaseUrl: vi.fn().mockResolvedValue("http://localhost:3000"),
}));

// ── Import under test (after mocks) ───────────────────────────────────────

const { registerUser } = await import("@/lib/auth/actions");

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults = {
    firstName: "María",
    lastName:  "García",
    email:     "maria@example.com",
    password:  "password123",
    confirm:   "password123",
  };
  Object.entries({ ...defaults, ...overrides }).forEach(([k, v]) =>
    fd.append(k, v)
  );
  return fd;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue([]); // default: email not taken
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
  });

  it("returns error when required fields are missing", async () => {
    const fd = makeFormData({ firstName: "" });
    const result = await registerUser({}, fd);
    expect(result.error).toBe("All fields are required.");
  });

  it("returns error when password is too short", async () => {
    const fd = makeFormData({ password: "abc", confirm: "abc" });
    const result = await registerUser({}, fd);
    expect(result.error).toBe("Password must be at least 8 characters.");
  });

  it("returns error when passwords do not match", async () => {
    const fd = makeFormData({ password: "password123", confirm: "different1" });
    const result = await registerUser({}, fd);
    expect(result.error).toBe("Passwords do not match.");
  });

  it("returns error when email already exists", async () => {
    mockLimit.mockResolvedValueOnce([{ id: "existing-uuid" }]);
    const fd = makeFormData();
    const result = await registerUser({}, fd);
    expect(result.error).toBe("An account with this email already exists.");
  });

  it("hashes password and inserts user on valid data", async () => {
    try {
      await registerUser({}, makeFormData());
    } catch {
      // redirect throws in test environment – that's expected
    }
    // db.insert().values() should have been called with the hashed password
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName:    "María",
        lastName:     "García",
        email:        "maria@example.com",
        passwordHash: "hashed_password",
      })
    );
  });

  it("signs in and redirects to /es/explore after successful registration", async () => {
    let redirectTarget = "";
    mockRedirect.mockImplementationOnce((url: string) => {
      redirectTarget = url;
      throw new Error("NEXT_REDIRECT");
    });

    try {
      await registerUser({}, makeFormData());
    } catch (e: unknown) {
      if ((e as Error).message !== "NEXT_REDIRECT") throw e;
    }

    expect(mockSignIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ email: "maria@example.com" })
    );
    expect(redirectTarget).toBe("/es/explore");
  });
});
