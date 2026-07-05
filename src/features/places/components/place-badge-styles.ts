import type { PlaceCardData } from "./PlaceCard";

/** Frosted pills on top of photos — avoids dark translucent fills over imagery. */
export const badgeOnImageClasses: Record<PlaceCardData["badgeColor"], string> = {
  red:  "fp-badge-overlay text-fp-orange",
  cyan: "fp-badge-overlay text-fp-teal",
  rose: "fp-badge-overlay text-fp-coral",
};

/** Filled pills on card surfaces (white / cream backgrounds). */
export const badgeOnSurfaceClasses: Record<PlaceCardData["badgeColor"], string> = {
  red:  "bg-fp-orange text-fp-on-accent",
  cyan: "bg-fp-teal text-fp-on-cyan",
  rose: "bg-fp-coral/12 text-fp-coral border border-fp-coral/25",
};
