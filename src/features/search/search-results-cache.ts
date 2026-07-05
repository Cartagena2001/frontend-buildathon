import type { PlaceCardData } from "@/features/places/components/PlaceCard";

/**
 * In-memory cache so a search triggered from the home page (which already
 * awaited the endpoint to drive the cat animation) doesn't refetch when the
 * explore page mounts.
 */
const cache = new Map<string, PlaceCardData[]>();

function normalize(query: string): string {
  return query.trim().toLowerCase();
}

export function getCachedResults(query: string): PlaceCardData[] | null {
  return cache.get(normalize(query)) ?? null;
}

export function setCachedResults(
  query: string,
  places: PlaceCardData[],
): void {
  cache.set(normalize(query), places);
}
