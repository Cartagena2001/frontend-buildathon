import type { SearchQuery, SearchResultItem } from "./types";

const SEARCH_API_URL =
  process.env.SEARCH_API_URL ?? "https://search.findy.place";
const DEFAULT_INDEX = "places";
const DEFAULT_LIMIT = 12;
const DEFAULT_SEMANTIC_WEIGHT = 0.5;
const DEFAULT_RERANKING = true;
const DEFAULT_SUSPICIOUS = false;
const SUSPICIOUS_FALSE_FILTER = "@metadata.suspicious = false";

function combineFilters(base?: string, extra?: string): string | undefined {
  if (!base && !extra) return undefined;
  if (!base) return extra;
  if (!extra) return base;
  return `(${base}) AND ${extra}`;
}

function resolveSearchFilter(filter?: string, suspicious = false): string | undefined {
  if (suspicious) return filter;
  return combineFilters(filter, SUSPICIOUS_FALSE_FILTER);
}

/** Calls the findy search engine and returns the raw ranked hits. */
export async function searchPlaces({
  query,
  index = DEFAULT_INDEX,
  limit = DEFAULT_LIMIT,
  filter,
  suspicious = DEFAULT_SUSPICIOUS,
  semanticWeight = DEFAULT_SEMANTIC_WEIGHT,
  reranking = DEFAULT_RERANKING,
}: SearchQuery): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const resolvedFilter = resolveSearchFilter(filter, suspicious);

  const res = await fetch(`${SEARCH_API_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      index,
      query: trimmed,
      limit,
      filter: resolvedFilter,
      suspicious,
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
