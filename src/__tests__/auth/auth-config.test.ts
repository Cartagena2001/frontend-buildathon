/**
 * Tests for auth.config.ts JWT and session callbacks.
 *
 * Focuses on the fix that ensures email/name are copied into the token and
 * session on initial sign-in, so Google OAuth users never lose their email
 * between session refreshes.
 */
import { describe, it, expect } from "vitest";
import { authConfig } from "@/lib/auth/auth.config";

// Pull out the callbacks from the config
const { jwt: jwtCallback, session: sessionCallback } = authConfig.callbacks!;

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeToken(overrides: Record<string, unknown> = {}) {
  return {
    sub: "token-sub",
    iat: 1_000_000,
    exp: 2_000_000,
    jti: "jti-1",
    ...overrides,
  };
}

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    user: { id: "", name: null, email: null, image: null },
    expires: "2099-01-01T00:00:00.000Z",
    ...overrides,
  } as Parameters<typeof sessionCallback>[0]["session"];
}

// ── jwt callback ─────────────────────────────────────────────────────────────

describe("jwt callback", () => {
  const user = {
    id:    "d4e5f6a7-b8c9-4012-d345-6789abcdef01",
    email: "google@test.com",
    name:  "Google User",
  };

  it("copies id, email, name from user on initial sign-in", async () => {
    const token = makeToken();
    const result = await jwtCallback!({ token, user, account: null, trigger: "signIn" } as never);

    expect(result.id).toBe(user.id);
    expect(result.email).toBe(user.email);
    expect(result.name).toBe(user.name);
  });

  it("preserves existing token fields when user is not provided (session refresh)", async () => {
    const token = makeToken({ id: "existing-id", email: "prev@test.com", name: "Prev" });
    const result = await jwtCallback!({ token, user: undefined, account: null, trigger: "update" } as never);

    // Nothing changes — user is undefined on refresh
    expect(result.id).toBe("existing-id");
    expect(result.email).toBe("prev@test.com");
    expect(result.name).toBe("Prev");
  });

  it("updates token name when trigger is update with session name", async () => {
    const token = makeToken({ id: "existing-id", email: "prev@test.com", name: "Old Name" });
    const result = await jwtCallback!({
      token,
      user: undefined,
      account: null,
      trigger: "update",
      session: { name: "New Name" },
    } as never);

    expect(result.name).toBe("New Name");
    expect(result.email).toBe("prev@test.com");
  });

  it("preserves findyCoreToken on profile update (place-lists auth)", async () => {
    const token = makeToken({
      id: "existing-id",
      email: "prev@test.com",
      name: "Old Name",
      findyCoreToken: "eyJhbGci.test.stored-token",
    });
    const result = await jwtCallback!({
      token,
      user: undefined,
      account: null,
      trigger: "update",
      session: { name: "New Name" },
    } as never);

    expect(result.name).toBe("New Name");
    expect(result.findyCoreToken).toBe("eyJhbGci.test.stored-token");
  });

  it("does not overwrite existing token email when user has no email", async () => {
    const token = makeToken({ id: "uid", email: "existing@test.com" });
    // Simulate a user object with no email (edge case)
    const result = await jwtCallback!({
      token,
      user: { id: "uid", email: undefined, name: "No Email" },
      account: null,
      trigger: "signIn",
    } as never);

    // email should remain from the token since user.email was falsy
    expect(result.email).toBe("existing@test.com");
  });

  it("handles Google OAuth user (no prior token.email)", async () => {
    const token = makeToken(); // no email in token yet
    const googleUser = {
      id:    "a1b2c3d4-e5f6-4789-a012-3456789abcde",
      email: "user@gmail.com",
      name:  "Juan García",
    };
    const result = await jwtCallback!({ token, user: googleUser, account: null, trigger: "signIn" } as never);

    expect(result.id).toBe(googleUser.id);
    expect(result.email).toBe("user@gmail.com");
    expect(result.name).toBe("Juan García");
  });
});

// ── session callback ──────────────────────────────────────────────────────────

describe("session callback", () => {
  it("copies id, email, name from token to session", async () => {
    const token = makeToken({
      id:    "d4e5f6a7-b8c9-4012-d345-6789abcdef01",
      email: "user@gmail.com",
      name:  "Juan García",
    });
    const session = makeSession();

    const result = await sessionCallback!({
      session,
      token,
      user: undefined as never,
      trigger: "update",
      newSession: undefined,
    });

    expect(result.user.id).toBe("d4e5f6a7-b8c9-4012-d345-6789abcdef01");
    expect(result.user.email).toBe("user@gmail.com");
    expect(result.user.name).toBe("Juan García");
  });

  it("does not set id when token.id is missing", async () => {
    const token = makeToken({ email: "x@test.com" }); // no token.id
    const session = makeSession();

    const result = await sessionCallback!({
      session,
      token,
      user: undefined as never,
      trigger: "update",
      newSession: undefined,
    });

    expect(result.user.id).toBe(""); // unchanged from default
    expect(result.user.email).toBe("x@test.com");
  });

  it("email propagates to session — critical for findy-core JWT generation", async () => {
    // This test represents the exact scenario that caused Google OAuth users
    // to get 401 from findy-core: email was missing from session.user.
    const token = makeToken({
      id:    "google-user-uuid-1234-567890abcdef",
      email: "google@example.com",
      name:  "Google User",
    });
    const session = makeSession({ user: { id: "", name: null, email: null, image: null } });

    const result = await sessionCallback!({
      session,
      token,
      user: undefined as never,
      trigger: "update",
      newSession: undefined,
    });

    // These are the exact checks getFindyToken does:
    expect(result.user.id).toBeTruthy();
    expect(result.user.email).toBeTruthy();
    expect(result.user.email).toBe("google@example.com");
  });
});
