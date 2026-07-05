import {
  findyFetchPublic,
  FindyApiError,
} from "@/lib/findy-core/client";
import {
  mapCorePlaceToDetailData,
  mapSearchResultToDetailData,
} from "@/features/places/map-core-place-detail";
import type { CorePlace } from "@/features/places/map-core-place";
import type { PlaceDetailData } from "@/features/places/place-detail.types";
import { enrichPlaceDetailWithGooglePhotos } from "@/features/places/enrich-place-detail";
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
export async function fetchPlaceDetail(id: string): Promise<PlaceDetailData> {
  if (!isValidPlaceId(id)) {
    throw new FindyApiError("Invalid place id", 400);
  }

  try {
    const data = await findyFetchPublic<PlaceDetailResponse>(`/places/${id}`);
    return enrichPlaceDetailWithGooglePhotos(mapCorePlaceToDetailData(data.place));
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

    return enrichPlaceDetailWithGooglePhotos(mapSearchResultToDetailData(searchHit));
  }
}
