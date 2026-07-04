/**
 * Google OAuth via Supabase.
 */
export const GOOGLE_AUTH_ENABLED = true;

/** Whether the Google sign-in UI should be shown. */
export function isGoogleAuthEnabled() {
  return GOOGLE_AUTH_ENABLED;
}

/** Whether Supabase env vars are configured (required for OAuth to work). */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();

  return Boolean(url && key);
}
