/** Bump when replacing public/hero/hero-bg.mp4 */
export const HERO_BG_VERSION = "2";

export const HERO_BG_ASSETS = {
  mp4: `/hero/hero-bg.mp4?v=${HERO_BG_VERSION}`,
  poster: `/hero/hero-bg-poster.webp?v=${HERO_BG_VERSION}`,
} as const;
