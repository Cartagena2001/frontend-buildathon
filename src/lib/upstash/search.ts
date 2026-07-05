import { Search } from "@upstash/search";

import type {
  SearchResultContent,
  SearchResultItem,
  SearchResultMetadata,
} from "@/features/search/types";

let client: Search | undefined;

function getSearchClient(): Search | null {
  const url = process.env.UPSTASH_SEARCH_REST_URL;
  const token = process.env.UPSTASH_SEARCH_REST_TOKEN;
  if (!url || !token) return null;

  if (!client) {
    client = new Search({ url, token });
  }
  return client;
}

function toSearchResultItem(
  id: string,
  content: Record<string, unknown>,
  metadata?: Record<string, unknown>,
): SearchResultItem {
  return {
    id,
    score: 1,
    content: content as unknown as SearchResultContent,
    metadata: metadata as SearchResultMetadata | undefined,
  };
}

/** Loads a place document directly from Upstash Search. */
export async function fetchSearchDocument(
  id: string,
  index = "places",
): Promise<SearchResultItem | null> {
  const search = getSearchClient();
  if (!search) return null;

  const rows = await search.index(index).fetch({ ids: [id] });
  const row = rows[0];
  if (!row) return null;

  return toSearchResultItem(
    String(row.id),
    row.content as Record<string, unknown>,
    row.metadata as Record<string, unknown> | undefined,
  );
}
