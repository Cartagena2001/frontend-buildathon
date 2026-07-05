"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { findyFetch, findyFetchPublic, FindyApiError } from "@/lib/findy-core/client";
import type {
  PlaceList,
  PlaceListDetail,
  PlaceListPlace,
  SharedPlaceList,
} from "./types";
import { isUuid } from "./types";
import {
  enrichPlaceListPlaces,
  type EnrichedPlaceListPlace,
} from "./enrich-place-images";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function authError<T = void>(): ActionResult<T> {
  return { ok: false, error: "Not authenticated" };
}

function mapApiError<T = void>(err: unknown): ActionResult<T> {
  if (err instanceof FindyApiError) return { ok: false, error: err.message };
  if (err instanceof Error) return { ok: false, error: err.message };
  return { ok: false, error: "Something went wrong" };
}

// ── Lists CRUD ────────────────────────────────────────────

export async function createPlaceList(input: {
  name: string;
  description?: string;
}): Promise<ActionResult<{ list: PlaceListDetail }>> {
  const session = await auth();
  if (!session?.user) return authError();

  try {
    const data = await findyFetch<{ list: PlaceListDetail }>("/place-lists", {
      method: "POST",
      body: input,
    });
    revalidatePath("/lists");
    return { ok: true, data };
  } catch (err) {
    return mapApiError(err);
  }
}

export async function getMyPlaceLists(): Promise<PlaceList[]> {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const data = await findyFetch<{ lists: PlaceList[] }>("/place-lists");
    return data.lists;
  } catch {
    return [];
  }
}

export async function getPlaceListDetail(
  listId: string,
): Promise<PlaceListDetail | null> {
  const session = await auth();
  if (!session?.user || !isUuid(listId)) return null;

  try {
    const data = await findyFetch<{ list: PlaceListDetail }>(
      `/place-lists/${listId}`,
    );
    return data.list;
  } catch {
    return null;
  }
}

export type PlaceListDetailEnriched = Omit<PlaceListDetail, "places"> & {
  places: EnrichedPlaceListPlace[];
};

export async function getPlaceListDetailEnriched(
  listId: string,
): Promise<PlaceListDetailEnriched | null> {
  const list = await getPlaceListDetail(listId);
  if (!list) return null;
  const places = await enrichPlaceListPlaces(list.places);
  return { ...list, places };
}

export type PlaceListWithPreviews = PlaceList & { previewCovers: string[] };

export async function getMyPlaceListsWithPreviews(): Promise<PlaceListWithPreviews[]> {
  const lists = await getMyPlaceLists();

  return Promise.all(
    lists.map(async (list) => {
      if (list.placeCount === 0) return { ...list, previewCovers: [] };

      const detail = await getPlaceListDetail(list.id);
      if (!detail?.places.length) return { ...list, previewCovers: [] };

      const enriched = await enrichPlaceListPlaces(detail.places.slice(0, 3));
      return { ...list, previewCovers: enriched.map((p) => p.coverImage) };
    }),
  );
}

export async function updatePlaceList(
  listId: string,
  input: { name?: string; description?: string | null },
): Promise<ActionResult<{ list: PlaceList }>> {
  const session = await auth();
  if (!session?.user) return authError();

  try {
    const data = await findyFetch<{ list: PlaceList }>(
      `/place-lists/${listId}`,
      { method: "PATCH", body: input },
    );
    revalidatePath("/lists");
    revalidatePath(`/lists/${listId}`);
    return { ok: true, data };
  } catch (err) {
    return mapApiError(err);
  }
}

export async function deletePlaceList(
  listId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return authError();

  try {
    await findyFetch(`/place-lists/${listId}`, { method: "DELETE" });
    revalidatePath("/lists");
    return { ok: true, data: undefined };
  } catch (err) {
    return mapApiError(err);
  }
}

// ── Places in lists ───────────────────────────────────────

export async function addPlaceToList(
  listId: string,
  placeId: string,
): Promise<ActionResult<{ place: PlaceListPlace }>> {
  const session = await auth();
  if (!session?.user) return authError();

  if (!isUuid(placeId)) {
    return { ok: false, error: "Place not available in catalog yet" };
  }

  try {
    const data = await findyFetch<{ place: PlaceListPlace }>(
      `/place-lists/${listId}/places`,
      { method: "POST", body: { placeId } },
    );
    revalidatePath("/lists");
    revalidatePath(`/lists/${listId}`);
    revalidatePath("/explore");
    return { ok: true, data };
  } catch (err) {
    return mapApiError(err);
  }
}

export async function removePlaceFromList(
  listId: string,
  placeId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return authError();

  try {
    await findyFetch(`/place-lists/${listId}/places/${placeId}`, {
      method: "DELETE",
    });
    revalidatePath("/lists");
    revalidatePath(`/lists/${listId}`);
    revalidatePath("/explore");
    return { ok: true, data: undefined };
  } catch (err) {
    return mapApiError(err);
  }
}

/** Place IDs saved in any of the user's lists. */
export async function getSavedPlaceIds(): Promise<string[]> {
  const lists = await getMyPlaceLists();
  if (lists.length === 0) return [];

  const details = await Promise.all(
    lists.filter((l) => l.placeCount > 0).map((l) => getPlaceListDetail(l.id)),
  );

  const ids = new Set<string>();
  for (const detail of details) {
    detail?.places.forEach((p) => ids.add(p.id));
  }
  return [...ids];
}

/** Which list IDs contain a given place. */
export async function getListsContainingPlace(
  placeId: string,
): Promise<string[]> {
  if (!isUuid(placeId)) return [];

  const lists = await getMyPlaceLists();
  const containing: string[] = [];

  await Promise.all(
    lists
      .filter((l) => l.placeCount > 0)
      .map(async (l) => {
        const detail = await getPlaceListDetail(l.id);
        if (detail?.places.some((p) => p.id === placeId)) {
          containing.push(l.id);
        }
      }),
  );

  return containing;
}

// ── Sharing ───────────────────────────────────────────────

export async function sharePlaceList(
  listId: string,
): Promise<ActionResult<{ shareToken: string }>> {
  const session = await auth();
  if (!session?.user) return authError();

  try {
    const data = await findyFetch<{ shareToken: string }>(
      `/place-lists/${listId}/share`,
      { method: "POST" },
    );
    revalidatePath(`/lists/${listId}`);
    return { ok: true, data };
  } catch (err) {
    return mapApiError(err);
  }
}

export async function unsharePlaceList(
  listId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return authError();

  try {
    await findyFetch(`/place-lists/${listId}/share`, { method: "DELETE" });
    revalidatePath(`/lists/${listId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    return mapApiError(err);
  }
}

export async function getSharedPlaceList(
  shareToken: string,
): Promise<SharedPlaceList | null> {
  if (!isUuid(shareToken)) return null;

  try {
    const data = await findyFetchPublic<{ list: SharedPlaceList }>(
      `/shared/${shareToken}`,
    );
    return data.list;
  } catch {
    return null;
  }
}

export type SharedPlaceListEnriched = Omit<SharedPlaceList, "places"> & {
  places: EnrichedPlaceListPlace[];
};

export async function getSharedPlaceListEnriched(
  shareToken: string,
): Promise<SharedPlaceListEnriched | null> {
  const list = await getSharedPlaceList(shareToken);
  if (!list) return null;
  const places = await enrichPlaceListPlaces(list.places);
  return { ...list, places };
}
