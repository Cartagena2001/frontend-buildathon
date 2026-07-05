import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";
import ExploreResults from "@/features/search/components/ExploreResults";
import ExploreSearchBar from "@/features/search/components/ExploreSearchBar";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavAuth from "@/components/ui/NavAuth";
import { getSavedPlaceIds } from "@/features/place-lists/actions";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const [{ q }, savedIds] = await Promise.all([
    searchParams,
    getSavedPlaceIds(),
  ]);

  const query = q?.trim() ?? "";

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

      <ExploreResults query={query} savedPlaceIds={savedIds} />
    </div>
  );
}
