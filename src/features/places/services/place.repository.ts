import { getPlacesIndex } from "@/lib/upstash";
import {
  metadataToPlace,
  placeToMetadata,
  type PlaceVectorMetadata,
} from "@/features/places/place-vector-metadata";
import type { Place } from "@/features/places/types";

const NEARBY_RADIUS_METERS = 150;

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusM = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusM * Math.asin(Math.sqrt(a));
}

async function fetchPlacePage(cursor: string | number) {
  return getPlacesIndex().range<PlaceVectorMetadata>({
    cursor,
    limit: 100,
    includeMetadata: true,
  });
}

async function collectAllPlaces(): Promise<Place[]> {
  const places: Place[] = [];
  let rangeCursor: string | number = 0;

  for (let pageIndex = 0; pageIndex < 500; pageIndex += 1) {
    const page = await fetchPlacePage(rangeCursor);

    for (const row of page.vectors) {
      if (row.metadata) {
        places.push(metadataToPlace(row.metadata as PlaceVectorMetadata));
      }
    }

    if (page.vectors.length === 0 || page.nextCursor === rangeCursor) {
      break;
    }
    rangeCursor = page.nextCursor;
  }

  return places;
}

export async function findPlaceByIdPlace(
  idPlace: string,
): Promise<Place | null> {
  const index = getPlacesIndex();
  const rows = await index.fetch([idPlace], { includeMetadata: true });
  const row = rows[0];
  if (!row?.metadata) {
    return null;
  }
  return metadataToPlace(row.metadata as PlaceVectorMetadata);
}

export async function findPlaceNearby(
  lat: number,
  lng: number,
  name?: string,
): Promise<Place | null> {
  const candidates = await collectAllPlaces();
  const normalizedName = name?.trim().toLowerCase();

  let best: Place | null = null;
  let bestDistance = NEARBY_RADIUS_METERS + 1;

  for (const place of candidates) {
    const distance = haversineMeters(
      lat,
      lng,
      place.location.lat,
      place.location.lng,
    );
    if (distance > NEARBY_RADIUS_METERS) {
      continue;
    }
    if (
      normalizedName &&
      !place.name.toLowerCase().includes(normalizedName)
    ) {
      continue;
    }
    if (distance < bestDistance) {
      best = place;
      bestDistance = distance;
    }
  }

  return best;
}

export async function listPlaces(options?: {
  category?: Place["category"];
  limit?: number;
}): Promise<Place[]> {
  let places = await collectAllPlaces();

  if (options?.category) {
    places = places.filter((p) => p.category === options.category);
  }

  places.sort((a, b) => b.trending.normalized - a.trending.normalized);

  const limit = options?.limit ?? 50;
  return places.slice(0, limit);
}

export async function upsertPlace(
  place: Place,
  vector: number[],
): Promise<Place> {
  const index = getPlacesIndex();
  const document: Place = { ...place, updatedAt: new Date() };

  await index.upsert({
    id: document.id_place,
    vector,
    metadata: placeToMetadata(document),
  });

  return document;
}

export async function appendVideoToPlace(
  idPlace: string,
  video: Place["videos"][number],
  trending: Place["trending"],
): Promise<Place | null> {
  const index = getPlacesIndex();
  const rows = await index.fetch([idPlace], {
    includeMetadata: true,
    includeVectors: true,
  });
  const row = rows[0];
  if (!row?.metadata || !row.vector) {
    return null;
  }

  const existing = metadataToPlace(row.metadata as PlaceVectorMetadata);
  const updated: Place = {
    ...existing,
    videos: [...existing.videos, video],
    trending,
    updatedAt: new Date(),
  };

  await index.upsert({
    id: idPlace,
    vector: row.vector,
    metadata: placeToMetadata(updated),
  });

  return updated;
}
