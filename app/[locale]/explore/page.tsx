import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ExploreLayout from "@/features/search/components/ExploreLayout";
import ExploreSearchBar from "@/features/search/components/ExploreSearchBar";
import { searchPlaces } from "@/features/search/search-service";
import { mapSearchResultsToPlaces } from "@/features/search/map-search-result";
import { enrichPlacesWithGooglePhotos } from "@/features/search/enrich-google-photos";
import { EXPLORE_PLACES } from "@/features/places/data/mock-places";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavAuth from "@/components/ui/NavAuth";
import { getSavedPlaceIds } from "@/lib/saved/actions";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const [{ q }, t, savedIds] = await Promise.all([
    searchParams,
    getTranslations("explore"),
    getSavedPlaceIds(),
  ]);

  const query = q?.trim() ?? "";

  let places: PlaceCardData[] = EXPLORE_PLACES;
  if (query) {
    try {
      const results = await searchPlaces({ query });
      places = await enrichPlacesWithGooglePhotos(mapSearchResultsToPlaces(results));
    } catch {
      places = [];
    }
  }

  return (
    <div className="flex flex-col h-screen bg-fp-dark overflow-hidden">
      <nav className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-fp-border bg-fp-dark z-30 overflow-visible">
        <Link
          href="/"
          className="text-fp-cream font-sans text-[1rem] font-light tracking-wide shrink-0"
        >
          findy<span className="text-fp-coral">.</span>place
        </Link>

        <div className="flex-1 min-w-0 max-w-xl">
          <ExploreSearchBar initialQuery={query} />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <LocaleSwitcher />
          <NavAuth />
        </div>
      </nav>

      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-fp-border">
        <div>
          <h1 className="font-display text-fp-cream text-lg sm:text-xl leading-tight">
            {t("title")}
          </h1>
          <p className="text-fp-muted text-[0.68rem] mt-0.5 hidden sm:block">
            {t("subtitle", { count: String(places.length), clips: "1,420" })}
          </p>
        </div>
      </div>

      <ExploreLayout places={places} savedPlaceIds={savedIds} />
    </div>
  );
}
