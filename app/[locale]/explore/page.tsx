import AppNav from "@/components/ui/AppNav";
import ExploreResults from "@/features/search/components/ExploreResults";
import { parseExploreCategory } from "@/features/search/explore-categories";
import { getSavedPlaceIds } from "@/features/place-lists/actions";

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const [{ q, category }, savedIds] = await Promise.all([
    searchParams,
    getSavedPlaceIds(),
  ]);

  const query = q?.trim() ?? "";
  const initialCategory = parseExploreCategory(category);

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-fp-dark overflow-hidden">
      <AppNav initialQuery={query} />

      <ExploreResults
        query={query}
        initialCategory={initialCategory}
        savedPlaceIds={savedIds}
      />
    </div>
  );
}
