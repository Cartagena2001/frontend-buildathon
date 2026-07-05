/**
 * Brand typography — single source of truth.
 * Loaded via next/font in app/layout.tsx (DM Serif Display + DM Sans).
 */

/** In-app stacks (CSS variables from next/font) */
export const FONT_DISPLAY =
  "var(--font-display), Georgia, 'Times New Roman', serif";

export const FONT_SANS = "var(--font-sans), system-ui, sans-serif";

/** Email / inline HTML — no CSS vars (clients ignore them) */
export const EMAIL_FONT_DISPLAY =
  "'DM Serif Display', Georgia, 'Times New Roman', serif";

export const EMAIL_FONT_SANS =
  "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
