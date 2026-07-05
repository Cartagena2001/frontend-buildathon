"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { findyFetch, findyFetchPublic, FindyApiError } from "@/lib/findy-core/client";
import { getFindyToken } from "@/lib/findy-core/token";
import type { MyPlaceReview, PlaceReview, PlaceReviewsData } from "./types";
import { isReviewablePlaceId } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function mapApiError<T = void>(err: unknown): ActionResult<T> {
  if (err instanceof FindyApiError) return { ok: false, error: err.message };
  if (err instanceof Error) return { ok: false, error: err.message };
  return { ok: false, error: "Something went wrong" };
}

const EMPTY_REVIEWS: PlaceReviewsData = {
  reviews: [],
  myReview: null,
  ratingAvg: null,
  ratingCount: 0,
};

/** Reviews for a place. Includes `myReview` when the visitor is logged in. */
export async function getPlaceReviews(placeId: string): Promise<PlaceReviewsData> {
  if (!isReviewablePlaceId(placeId)) return EMPTY_REVIEWS;

  try {
    const session = await auth();
    const token = session?.user ? await getFindyToken() : null;

    if (token) {
      return await findyFetch<PlaceReviewsData>(`/places/${placeId}/reviews`, { token });
    }
    return await findyFetchPublic<PlaceReviewsData>(`/places/${placeId}/reviews`);
  } catch {
    return EMPTY_REVIEWS;
  }
}

/** Creates or replaces the current user's review for a place. */
export async function submitReview(
  placeId: string,
  input: { rating: number; comment?: string },
): Promise<ActionResult<{ review: PlaceReview; ratingAvg: number | null; ratingCount: number }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };

  if (!isReviewablePlaceId(placeId)) {
    return { ok: false, error: "Place not available in catalog yet" };
  }

  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5" };
  }

  const comment = input.comment?.trim().slice(0, 1000) || undefined;

  try {
    const data = await findyFetch<{
      review: PlaceReview;
      ratingAvg: number | null;
      ratingCount: number;
    }>(`/places/${placeId}/reviews`, {
      method: "PUT",
      body: { rating, comment },
    });
    revalidatePath("/profile");
    revalidatePath(`/explore/${placeId}`);
    return { ok: true, data };
  } catch (err) {
    return mapApiError(err);
  }
}

/** Deletes the current user's review for a place. */
export async function deleteReview(
  placeId: string,
): Promise<ActionResult<{ ratingAvg: number | null; ratingCount: number }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };

  try {
    const data = await findyFetch<{ ratingAvg: number | null; ratingCount: number }>(
      `/places/${placeId}/reviews`,
      { method: "DELETE" },
    );
    revalidatePath("/profile");
    revalidatePath(`/explore/${placeId}`);
    return { ok: true, data };
  } catch (err) {
    return mapApiError(err);
  }
}

/** All reviews written by the current user (for the profile page). */
export async function getMyReviews(): Promise<MyPlaceReview[]> {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const data = await findyFetch<{ reviews: MyPlaceReview[] }>("/me/reviews");
    return data.reviews;
  } catch {
    return [];
  }
}
