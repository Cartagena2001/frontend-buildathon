import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";
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
        <Link href="/" className={navLogoLinkClassName}>
          <BrandLogo size="nav" />
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

      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-fp-border">
        <div>
          <h1 className="font-display text-fp-cream text-xl sm:text-2xl leading-tight">
            {t("title")}
          </h1>
          <p className="text-fp-muted text-xs mt-0.5 hidden sm:block">
            {t("subtitle", { count: String(places.length), clips: "1,420" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-fp-muted text-xs hidden sm:block">{t("sortedBy")}</span>
          <SortDropdown />
        </div>
      </div>

      <ExploreLayout places={places} savedPlaceIds={savedIds} />
    </div>
  );
}

function SortDropdown() {
  return (
    <div className="flex items-center gap-1.5 border border-fp-border rounded-full px-3 py-1.5 cursor-pointer hover:border-fp-coral/50 transition-colors">
      <span className="font-sans text-fp-cream text-xs font-medium whitespace-nowrap">Viral Momentum</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-fp-muted shrink-0">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
