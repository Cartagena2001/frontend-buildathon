/** Shared brand constants — single source of truth for app name and logo. */
export const APP_NAME = "findy.place";

export const APP_TAGLINE_ES = "Tu guía de experiencias";
export const APP_TAGLINE_EN = "Your experience guide";

export const APP_DESCRIPTION_ES =
  "Descubre, explora y recomienda los lugares más virales de El Salvador, impulsados por datos de TikTok e Instagram.";

export const APP_DESCRIPTION_EN =
  "Discover, explore, and recommend the most viral places in El Salvador, powered by TikTok and Instagram data.";

/** Black letters — light backgrounds. White letters — dark backgrounds. */
export const BRAND_LOGO = {
  onLight: {
    src: "/brand/logo-letras.webp",
    width: 554,
    height: 184,
  },
  onDark: {
    src: "/brand/logo-letras-blanco.webp",
    width: 554,
    height: 184,
  },
  /** Default for metadata / OG (light-background variant). */
  src: "/brand/logo-letras.webp",
  width: 554,
  height: 184,
  alt: APP_NAME,
} as const;
