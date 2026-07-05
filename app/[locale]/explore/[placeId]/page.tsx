import { notFound } from "next/navigation";
import PlaceDetail from "@/features/places/components/PlaceDetail";
import { findPlaceById } from "@/features/places/data/mock-places";
import { getSavedPlaceIds } from "@/features/place-lists/actions";

type Props = {
  params: Promise<{ locale: string; placeId: string }>;
};

export default async function PlaceDetailPage({ params }: Props) {
  const { placeId } = await params;
  const [place, savedIds] = await Promise.all([
    Promise.resolve(findPlaceById(placeId)),
    getSavedPlaceIds(),
  ]);

  if (!place) {
    notFound();
  }

  return (
    <PlaceDetail
      place={place}
      isSaved={savedIds.includes(place.id)}
    />
  );
}
