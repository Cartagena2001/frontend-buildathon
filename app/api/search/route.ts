import { NextResponse } from "next/server";

import { searchPlaces } from "@/features/search/search-service";
import { mapSearchResultsToPlaces } from "@/features/search/map-search-result";
import { cacheSearchHits } from "@/features/search/place-by-id-cache";
import { enrichPlacesWithGooglePhotos } from "@/features/search/enrich-google-photos";
import {
  sortSearchResultsByLikes,
  splitSearchResults,
} from "@/features/search/split-search-results";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";

interface SearchRequestBody {
  query?: string;
  limit?: number;
}

export interface SearchApiResponse {
  places: PlaceCardData[];
  relatedPlaces: PlaceCardData[];
}

/**
 * Server proxy for the findy search engine. Runs the query, maps the hits into
 * card data and enriches them with Google photos so the client can await a
 * single call and drive the loading state off the real response.
 */
export async function POST(request: Request) {
  let body: SearchRequestBody;
  try {
    body = (await request.json()) as SearchRequestBody;
  } catch {
    return NextResponse.json({ places: [], relatedPlaces: [] }, { status: 400 });
  }

  const query = body.query?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ places: [], relatedPlaces: [] });
  }

  try {
    const results = sortSearchResultsByLikes(
      await searchPlaces({ query, limit: body.limit, reranking: false }),
    );
    cacheSearchHits(results);

    const { exact, related } = splitSearchResults(results, query);
    const [places, relatedPlaces] = await Promise.all([
      enrichPlacesWithGooglePhotos(mapSearchResultsToPlaces(exact)),
      enrichPlacesWithGooglePhotos(mapSearchResultsToPlaces(related)),
    ]);

    return NextResponse.json({ places, relatedPlaces } satisfies SearchApiResponse);
  } catch (error) {
    console.error("[search] request failed:", error);
    return NextResponse.json({ places: [], relatedPlaces: [] }, { status: 502 });
  }
}
