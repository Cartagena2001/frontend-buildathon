import type { PlaceDetailData } from "@/features/places/place-detail.types";
import { getGooglePlacePhotos } from "@/lib/google-places/place-photo";

/** Enriches place detail with Google Places coordinates and cover photo when available. */
export async function enrichPlaceDetailWithGooglePhotos(
  place: PlaceDetailData,
): Promise<PlaceDetailData> {
  const google = await getGooglePlacePhotos({
    name: place.name,
    location: place.location,
  });

  const hasCoords =
    typeof google.lat === "number" && typeof google.lng === "number";
  const hasPhotos = google.photos.length > 0;

  if (!hasCoords && !hasPhotos) return place;

  return {
    ...place,
    ...(hasCoords ? { lat: google.lat, lng: google.lng } : {}),
    ...(hasPhotos ? { coverImage: google.photos[0] } : {}),
  };
}
