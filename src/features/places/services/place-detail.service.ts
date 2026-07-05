import {
  findyFetchPublic,
  FindyApiError,
} from "@/lib/findy-core/client";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import {
  mapCorePlaceToCardData,
  type CorePlace,
} from "@/features/places/map-core-place";
import { enrichPlacesWithGooglePhotos } from "@/features/search/enrich-google-photos";
import { mapSearchResultsToPlaces } from "@/features/search/map-search-result";
import { getCachedSearchHit } from "@/features/search/place-by-id-cache";
import { fetchPlaceFromSearchIndex } from "@/features/search/search-service";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PlaceDetailResponse {
  place: CorePlace;
}

export function isValidPlaceId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Loads full place detail from findy-core, falling back to the search index. */
export async function fetchPlaceDetail(id: string): Promise<PlaceCardData> {
  if (!isValidPlaceId(id)) {
    throw new FindyApiError("Invalid place id", 400);
  }

  try {
    const data = await findyFetchPublic<PlaceDetailResponse>(`/places/${id}`);
    const [place] = await enrichPlacesWithGooglePhotos([
      mapCorePlaceToCardData(data.place),
    ]);

    return place;
  } catch (error) {
    const isCore404 =
      error instanceof FindyApiError && error.status === 404;

    if (!isCore404) {
      throw error;
    }

    const cachedHit = getCachedSearchHit(id);
    const searchHit = cachedHit ?? (await fetchPlaceFromSearchIndex(id));

    if (!searchHit) {
      throw error;
    }

    const [place] = await enrichPlacesWithGooglePhotos(
      mapSearchResultsToPlaces([searchHit]),
    );

    return place;
  }
}
