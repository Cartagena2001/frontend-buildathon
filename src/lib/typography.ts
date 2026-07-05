/**
 * Brand typography — single source of truth.
 * Display: SF Pro (system). UI/body: DM Sans via next/font in app/layout.tsx.
 */

/** SF Pro Display stack for titles — also set as --font-display in globals.css */
export const FONT_DISPLAY_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif';

/** In-app stacks */
export const FONT_DISPLAY = "var(--font-display), system-ui, sans-serif";

export const FONT_SANS = "var(--font-sans), system-ui, sans-serif";

/** Email / inline HTML — no CSS vars (clients ignore them) */
export const EMAIL_FONT_DISPLAY = FONT_DISPLAY_STACK;

export const EMAIL_FONT_SANS =
  "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
