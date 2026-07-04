export type MascotVariant = "search" | "rerank" | "map" | "verify" | "idle";

/** Bump when replacing public/mascot/loading-search.mp4 */
export const MASCOT_VERSION = "4";

export interface MascotAsset {
  mp4: string;
  poster: string;
}

export const MASCOT_ASSETS: Record<MascotVariant, MascotAsset> = {
  search: {
    mp4: `/mascot/loading-search.mp4?v=${MASCOT_VERSION}`,
    poster: `/mascot/loading-search-poster.png?v=${MASCOT_VERSION}`,
  },
  rerank: {
    mp4: `/mascot/loading-search.mp4?v=${MASCOT_VERSION}`,
    poster: `/mascot/loading-search-poster.png?v=${MASCOT_VERSION}`,
  },
  map: {
    mp4: `/mascot/loading-search.mp4?v=${MASCOT_VERSION}`,
    poster: `/mascot/loading-search-poster.png?v=${MASCOT_VERSION}`,
  },
  verify: {
    mp4: `/mascot/loading-search.mp4?v=${MASCOT_VERSION}`,
    poster: `/mascot/loading-search-poster.png?v=${MASCOT_VERSION}`,
  },
  idle: {
    mp4: `/mascot/loading-search.mp4?v=${MASCOT_VERSION}`,
    poster: `/mascot/loading-search-poster.png?v=${MASCOT_VERSION}`,
  },
};
