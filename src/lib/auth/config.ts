/**
 * Google OAuth feature flag.
 * Set to true + add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to enable.
 */
export const GOOGLE_AUTH_ENABLED = false;

/** True when Google OAuth is enabled and env vars are configured. */
export function isGoogleAuthEnabled() {
  if (!GOOGLE_AUTH_ENABLED) return false;

  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
    process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}
