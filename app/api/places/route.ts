import { NextResponse } from "next/server";

import { listPlaces } from "@/features/places/services/place.repository";
import type { PlaceCategory } from "@/features/places/types";

const CATEGORIES: PlaceCategory[] = [
  "beach",
  "restaurant",
  "nightlife",
  "other",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const category = CATEGORIES.includes(categoryParam as PlaceCategory)
      ? (categoryParam as PlaceCategory)
      : undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    const places = await listPlaces({
      category,
      limit: Number.isFinite(limit) ? limit : undefined,
    });

    return NextResponse.json({ places });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al leer lugares";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
