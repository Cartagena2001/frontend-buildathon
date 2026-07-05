import type { PlaceCardData } from "@/features/places/components/PlaceCard";

interface SearchResponse {
  places: PlaceCardData[];
}

/** Client-side call to the internal search proxy (`POST /api/search`). */
export async function fetchSearchResults(
  query: string,
): Promise<PlaceCardData[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: trimmed }),
  });

  if (!res.ok) {
    throw new Error(`Search request failed with status ${res.status}`);
  }

  const data = (await res.json()) as SearchResponse;
  return Array.isArray(data.places) ? data.places : [];
}
