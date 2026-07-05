import { findyFetchPublic, FindyApiError } from "@/lib/findy-core/client";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import {
  mapCorePlaceToCardData,
  type CorePlace,
} from "@/features/places/map-core-place";
import { enrichPlacesWithGooglePhotos } from "@/features/search/enrich-google-photos";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PlaceDetailResponse {
  place: CorePlace;
}

export function isValidPlaceId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Loads full place detail from findy-core (`GET /places/:id`). */
export async function fetchPlaceDetail(id: string): Promise<PlaceCardData> {
  if (!isValidPlaceId(id)) {
    throw new FindyApiError("Invalid place id", 400);
  }

  const data = await findyFetchPublic<PlaceDetailResponse>(`/places/${id}`);
  const [place] = await enrichPlacesWithGooglePhotos([
    mapCorePlaceToCardData(data.place),
  ]);

  return place;
}
