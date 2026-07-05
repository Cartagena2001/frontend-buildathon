import type { GooglePlaceDetails, GooglePlaceLookupInput, GooglePriceLevel } from "./types";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const REVALIDATE_SECONDS = 86_400;

const PHOTO_FIELD_MASK = "places.photos,places.location";

const DETAIL_FIELD_MASK = [
  "places.photos",
  "places.location",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.regularOpeningHours",
  "places.currentOpeningHours",
  "places.editorialSummary",
].join(",");

interface GooglePhoto {
  name?: string;
}

interface GoogleLatLng {
  latitude?: number;
  longitude?: number;
}

interface GoogleOpeningHours {
  weekdayDescriptions?: string[];
  openNow?: boolean;
}

interface GooglePlace {
  photos?: GooglePhoto[];
  location?: GoogleLatLng;
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: GooglePriceLevel;
  regularOpeningHours?: GoogleOpeningHours;
  currentOpeningHours?: GoogleOpeningHours;
  editorialSummary?: { text?: string };
}

interface TextSearchResponse {
  places?: GooglePlace[];
}

interface PhotoMediaResponse {
  photoUri?: string;
}

const EMPTY_DETAILS: GooglePlaceDetails = { photos: [] };

async function searchGooglePlace(
  input: GooglePlaceLookupInput,
  fieldMask: string,
): Promise<GooglePlace | null> {
  if (!API_KEY || !input.name.trim()) return null;

  const textQuery = input.location?.trim()
    ? `${input.name}, ${input.location}, El Salvador`
    : `${input.name}, El Salvador`;

  const searchRes = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({
      textQuery,
      regionCode: "SV",
      languageCode: (input.locale ?? "en").startsWith("es") ? "es" : "en",
      maxResultCount: 1,
    }),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!searchRes.ok) return null;

  const data = (await searchRes.json()) as TextSearchResponse;
  return data.places?.[0] ?? null;
}

/** Lightweight lookup for explore cards — photos and coordinates only. */
export async function getGooglePlacePhotos(
  input: GooglePlaceLookupInput,
  limit = 3,
): Promise<Pick<GooglePlaceDetails, "photos" | "lat" | "lng">> {
  try {
    const place = await searchGooglePlace(input, PHOTO_FIELD_MASK);
    if (!place) return { photos: [] };

    const photoNames = (place.photos ?? [])
      .map((photo) => photo.name)
      .filter((photoName): photoName is string => Boolean(photoName))
      .slice(0, limit);

    const uris = await Promise.all(photoNames.map(resolvePhotoUri));
    const photos = uris.filter((uri): uri is string => Boolean(uri));

    const googleLat = place.location?.latitude;
    const googleLng = place.location?.longitude;
    const hasCoords =
      typeof googleLat === "number" && typeof googleLng === "number";

    return {
      photos,
      ...(hasCoords ? { lat: googleLat, lng: googleLng } : {}),
    };
  } catch {
    return { photos: [] };
  }
}

/**
 * Full lookup for place detail — address, hours, rating, website, photos,
 * and coordinates when available.
 */
export async function getGooglePlaceDetails(
  input: GooglePlaceLookupInput,
  photoLimit = 5,
): Promise<GooglePlaceDetails> {
  try {
    const place = await searchGooglePlace(input, DETAIL_FIELD_MASK);
    if (!place) return EMPTY_DETAILS;

    const photoNames = (place.photos ?? [])
      .map((photo) => photo.name)
      .filter((photoName): photoName is string => Boolean(photoName))
      .slice(0, photoLimit);

    const uris = await Promise.all(photoNames.map(resolvePhotoUri));
    const photos = uris.filter((uri): uri is string => Boolean(uri));

    const googleLat = place.location?.latitude;
    const googleLng = place.location?.longitude;
    const hasCoords =
      typeof googleLat === "number" && typeof googleLng === "number";

    const weekdayDescriptions =
      place.regularOpeningHours?.weekdayDescriptions?.filter(Boolean) ?? [];
    const openNow =
      place.currentOpeningHours?.openNow ??
      place.regularOpeningHours?.openNow;

    return {
      photos,
      ...(hasCoords ? { lat: googleLat, lng: googleLng } : {}),
      ...(place.formattedAddress ? { formattedAddress: place.formattedAddress } : {}),
      ...(place.nationalPhoneNumber ? { phone: place.nationalPhoneNumber } : {}),
      ...(place.websiteUri ? { website: place.websiteUri } : {}),
      ...(place.googleMapsUri ? { googleMapsUri: place.googleMapsUri } : {}),
      ...(typeof place.rating === "number" ? { rating: place.rating } : {}),
      ...(typeof place.userRatingCount === "number"
        ? { userRatingCount: place.userRatingCount }
        : {}),
      ...(place.priceLevel ? { priceLevel: place.priceLevel } : {}),
      ...(typeof openNow === "boolean" ? { openNow } : {}),
      ...(weekdayDescriptions.length > 0 ? { weekdayDescriptions } : {}),
      ...(place.editorialSummary?.text
        ? { editorialSummary: place.editorialSummary.text }
        : {}),
    };
  } catch {
    return EMPTY_DETAILS;
  }
}

async function resolvePhotoUri(photoName: string): Promise<string | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true`,
      {
        headers: { "X-Goog-Api-Key": API_KEY },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!res.ok) return null;

    const media = (await res.json()) as PhotoMediaResponse;
    return media.photoUri ?? null;
  } catch {
    return null;
  }
}
