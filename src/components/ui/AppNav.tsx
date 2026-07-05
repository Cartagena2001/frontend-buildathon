import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";
import ExploreSearchBar from "@/features/search/components/ExploreSearchBar";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavAuth from "@/components/ui/NavAuth";

interface AppNavProps {
  initialQuery?: string;
}

export default function AppNav({ initialQuery = "" }: AppNavProps) {
  return (
    <nav className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-fp-border bg-fp-dark z-30 overflow-visible">
      <Link href="/" className={navLogoLinkClassName}>
        <BrandLogo size="nav" />
      </Link>

      <div className="flex-1 min-w-0 max-w-xl">
        <ExploreSearchBar initialQuery={initialQuery} />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <LocaleSwitcher />
        <NavAuth />
      </div>
    </nav>
  );
}
