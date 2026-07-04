"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedPlaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface SavePlaceInput {
  placeId:          string;
  placeName:        string;
  placeLocation:    string;
  placeImage:       string;
  placeCategories:  string[];
}

export async function savePlace(input: SavePlaceInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await db
    .insert(savedPlaces)
    .values({ userId: session.user.id, ...input })
    .onConflictDoNothing();

  revalidatePath("/saved");
  return { ok: true };
}

export async function unsavePlace(placeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await db
    .delete(savedPlaces)
    .where(
      and(
        eq(savedPlaces.userId, session.user.id),
        eq(savedPlaces.placeId, placeId)
      )
    );

  revalidatePath("/saved");
  return { ok: true };
}

export async function getSavedPlaceIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const rows = await db
    .select({ placeId: savedPlaces.placeId })
    .from(savedPlaces)
    .where(eq(savedPlaces.userId, session.user.id));

  return rows.map((r) => r.placeId);
}
