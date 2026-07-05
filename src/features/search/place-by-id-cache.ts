import type { SearchResultItem } from "./types";

/** Server-side cache of recent search hits keyed by place id. */
const byId = new Map<string, SearchResultItem>();

export function cacheSearchHits(results: SearchResultItem[]): void {
  for (const hit of results) {
    byId.set(hit.id, hit);
  }
}

export function getCachedSearchHit(id: string): SearchResultItem | null {
  return byId.get(id) ?? null;
}
