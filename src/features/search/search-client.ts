import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { filterPlacesInElSalvador } from "./is-place-in-el-salvador";

export interface SearchResults {
  places: PlaceCardData[];
  relatedPlaces: PlaceCardData[];
}

interface SearchResponse {
  places: PlaceCardData[];
  relatedPlaces?: PlaceCardData[];
}

const EMPTY_RESULTS: SearchResults = { places: [], relatedPlaces: [] };

/** Client-side call to the internal search proxy (`POST /api/search`). */
export async function fetchSearchResults(query: string): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) return EMPTY_RESULTS;

  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: trimmed }),
  });

  if (!res.ok) {
    throw new Error(`Search request failed with status ${res.status}`);
  }

  const data = (await res.json()) as SearchResponse;
  return {
    places: filterPlacesInElSalvador(
      Array.isArray(data.places) ? data.places : [],
    ),
    relatedPlaces: filterPlacesInElSalvador(
      Array.isArray(data.relatedPlaces) ? data.relatedPlaces : [],
    ),
  };
}
