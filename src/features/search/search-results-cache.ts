import type { SearchResults } from "./search-client";

/** Bump when split logic changes so stale in-memory entries are ignored. */
const CACHE_VERSION = 4;

interface CacheEntry {
  version: number;
  results: SearchResults;
}

/**
 * In-memory cache so a search triggered from the home page (which already
 * awaited the endpoint to drive the cat animation) doesn't refetch when the
 * explore page mounts.
 */
const cache = new Map<string, CacheEntry>();

function normalize(query: string): string {
  return query.trim().toLowerCase();
}

export function getCachedResults(query: string): SearchResults | null {
  const entry = cache.get(normalize(query));
  if (!entry || entry.version !== CACHE_VERSION) return null;
  return entry.results;
}

export function setCachedResults(query: string, results: SearchResults): void {
  cache.set(normalize(query), { version: CACHE_VERSION, results });
}
