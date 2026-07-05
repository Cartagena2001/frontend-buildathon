const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
/** Cache Google lookups for a day — place photos rarely change. */
const REVALIDATE_SECONDS = 86_400;

interface PhotoLookup {
  name: string;
  location?: string;
}

interface GooglePhoto {
  name?: string;
}

interface GoogleLatLng {
  latitude?: number;
  longitude?: number;
}

interface GooglePlace {
  photos?: GooglePhoto[];
  location?: GoogleLatLng;
}

interface TextSearchResponse {
  places?: GooglePlace[];
}

interface PhotoMediaResponse {
  photoUri?: string;
}

export interface GooglePlaceLookupResult {
  photos: string[];
  lat?: number;
  lng?: number;
}

const EMPTY_LOOKUP: GooglePlaceLookupResult = { photos: [] };

/**
 * Looks up a place via Google Places Text Search and returns photos plus
 * coordinates when available. Returns empty results when no API key is
 * configured or nothing is found, so callers can fall back to index data.
 */
export async function getGooglePlacePhotos(
  { name, location }: PhotoLookup,
  limit = 3,
): Promise<GooglePlaceLookupResult> {
  if (!API_KEY || !name.trim()) return EMPTY_LOOKUP;

  try {
    const textQuery = location ? `${name}, ${location}` : name;

    const searchRes = await fetch(TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.photos,places.location",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 1,
      }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!searchRes.ok) return EMPTY_LOOKUP;

    const data = (await searchRes.json()) as TextSearchResponse;
    const place = data.places?.[0];
    const photoNames = (place?.photos ?? [])
      .map((photo) => photo.name)
      .filter((photoName): photoName is string => Boolean(photoName))
      .slice(0, limit);

    const uris = await Promise.all(photoNames.map(resolvePhotoUri));
    const photos = uris.filter((uri): uri is string => Boolean(uri));

    const googleLat = place?.location?.latitude;
    const googleLng = place?.location?.longitude;
    const hasCoords =
      typeof googleLat === "number" && typeof googleLng === "number";

    return {
      photos,
      ...(hasCoords ? { lat: googleLat, lng: googleLng } : {}),
    };
  } catch {
    return EMPTY_LOOKUP;
  }
}

/** Resolves a photo resource name to its public googleusercontent URL. */
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
