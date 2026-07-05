import { fetchSearchDocument } from "@/lib/upstash/search";
import type { SearchQuery, SearchResultItem } from "./types";

const SEARCH_API_URL =
  process.env.SEARCH_API_URL ?? "https://search.findy.place";
const DEFAULT_INDEX = "places";
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 20;
const DEFAULT_SEMANTIC_WEIGHT = 0.5;
/** Reranking compresses scores (~0.4 max), which breaks the 0.88 best-match split. */
const DEFAULT_RERANKING = false;

/** Calls the findy search engine and returns the raw ranked hits. */
export async function searchPlaces({
  query,
  index = DEFAULT_INDEX,
  limit = DEFAULT_LIMIT,
  filter,
  semanticWeight = DEFAULT_SEMANTIC_WEIGHT,
  reranking = DEFAULT_RERANKING,
}: SearchQuery): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);

  const res = await fetch(`${SEARCH_API_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      index,
      query: trimmed,
      limit: safeLimit,
      filter,
      semanticWeight,
      reranking,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Search request failed with status ${res.status}`);
  }

  const data: unknown = await res.json();
  const results = Array.isArray(data) ? (data as SearchResultItem[]) : [];

  console.log(
    `[search] query="${trimmed}" index="${index}" results=${results.length}`,
    JSON.stringify(results, null, 2),
  );

  return results;
}

/** Loads a single place document from the search index by id. */
export async function fetchPlaceFromSearchIndex(
  id: string,
  index = DEFAULT_INDEX,
): Promise<SearchResultItem | null> {
  try {
    const res = await fetch(`${SEARCH_API_URL}/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, id }),
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as SearchResultItem;
    }
  } catch {
    // Fall through to direct Upstash fetch.
  }

  return fetchSearchDocument(id, index);
}
