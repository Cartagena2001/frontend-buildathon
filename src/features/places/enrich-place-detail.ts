import type { PlaceDetailData } from "@/features/places/place-detail.types";
import { getGooglePlaceDetails } from "@/lib/google-places/place-details";

function hasGoogleUiFields(
  google: Awaited<ReturnType<typeof getGooglePlaceDetails>>,
): boolean {
  return Boolean(
    google.formattedAddress ||
      google.phone ||
      google.website ||
      google.rating != null ||
      google.priceLevel ||
      google.weekdayDescriptions?.length ||
      google.editorialSummary,
  );
}

/** Enriches place detail with Google Places practical info, photos, and coordinates. */
export async function enrichPlaceDetailWithGooglePhotos(
  place: PlaceDetailData,
  locale = "en",
): Promise<PlaceDetailData> {
  const google = await getGooglePlaceDetails(
    { name: place.name, location: place.location, locale },
    5,
  );

  const hasCoords =
    typeof google.lat === "number" && typeof google.lng === "number";
  const hasPhotos = google.photos.length > 0;
  const hasUi = hasGoogleUiFields(google);

  if (!hasCoords && !hasPhotos && !hasUi) return place;

  const { photos, lat, lng, ...info } = google;

  return {
    ...place,
    ...(hasCoords ? { lat, lng } : {}),
    ...(hasPhotos ? { coverImage: photos[0] } : {}),
    google: {
      ...info,
      ...(photos.length > 1 ? { extraPhotos: photos.slice(1) } : {}),
    },
  };
}
