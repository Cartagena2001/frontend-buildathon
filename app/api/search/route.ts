import { NextResponse } from "next/server";

import { searchPlaces } from "@/features/search/search-service";
import { mapSearchResultsToPlaces } from "@/features/search/map-search-result";
import { cacheSearchHits } from "@/features/search/place-by-id-cache";
import { enrichPlacesWithGooglePhotos } from "@/features/search/enrich-google-photos";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";

interface SearchRequestBody {
  query?: string;
  limit?: number;
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
    return NextResponse.json({ places: [] }, { status: 400 });
  }

  const query = body.query?.trim() ?? "";
  if (!query) return NextResponse.json({ places: [] });

  try {
    const results = await searchPlaces({ query, limit: body.limit });
    cacheSearchHits(results);
    const places: PlaceCardData[] = await enrichPlacesWithGooglePhotos(
      mapSearchResultsToPlaces(results),
    );
    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ places: [] }, { status: 502 });
  }
}
