import { notFound } from "next/navigation";
import PlaceDetail from "@/features/places/components/PlaceDetail";
import { findPlaceById } from "@/features/places/data/mock-places";
import { getSavedPlaceIds } from "@/lib/saved/actions";

type Props = {
  params: Promise<{ locale: string; placeId: string }>;
};

export default async function PlaceDetailPage({ params }: Props) {
  const { placeId } = await params;
  const place = findPlaceById(placeId);
  const savedIds = await getSavedPlaceIds();

  if (!place) {
    notFound();
  }

  return <PlaceDetail place={place} isSaved={savedIds.includes(placeId)} />;
}
