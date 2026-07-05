import { notFound } from "next/navigation";
import PlaceDetail from "@/features/places/components/PlaceDetail";
import { fetchPlaceDetail } from "@/features/places/services/place-detail.service";
import { FindyApiError } from "@/lib/findy-core/client";
import { getSavedPlaceIds } from "@/features/place-lists/actions";

type Props = {
  params: Promise<{ locale: string; placeId: string }>;
};

export default async function PlaceDetailPage({ params }: Props) {
  const { placeId } = await params;

  let place;
  try {
    place = await fetchPlaceDetail(placeId);
  } catch (error) {
    if (error instanceof FindyApiError) {
      if (error.status === 404 || error.status === 400) {
        notFound();
      }
    }
    throw error;
  }

  const savedIds = await getSavedPlaceIds();

  return (
    <PlaceDetail
      place={place}
      isSaved={savedIds.includes(place.id)}
    />
  );
}
