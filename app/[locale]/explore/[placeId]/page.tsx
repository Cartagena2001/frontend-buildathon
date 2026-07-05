import { notFound } from "next/navigation";
import AppNav from "@/components/ui/AppNav";
import PlaceDetail from "@/features/places/components/PlaceDetail";
import { fetchPlaceDetail } from "@/features/places/services/place-detail.service";
import { FindyApiError } from "@/lib/findy-core/client";
import { getSavedPlaceIds } from "@/features/place-lists/actions";
import { getPlaceReviews } from "@/features/reviews/actions";
import { auth } from "@/lib/auth";

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

  const [session, savedIds, reviewsData] = await Promise.all([
    auth(),
    getSavedPlaceIds(),
    getPlaceReviews(placeId),
  ]);

  const isAuthenticated = !!session?.user;

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-fp-dark overflow-hidden">
      <AppNav />
      <PlaceDetail
        place={place}
        isSaved={savedIds.includes(place.id)}
        reviewsData={reviewsData}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
