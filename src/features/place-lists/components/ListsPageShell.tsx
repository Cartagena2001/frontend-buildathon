import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";
import NavAuth from "@/components/ui/NavAuth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

interface Props {
  children: React.ReactNode;
}

export default function ListsPageShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-fp-dark">
      <nav className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-fp-border bg-fp-dim/95 backdrop-blur-md">
        <Link href="/" className={navLogoLinkClassName}>
          <BrandLogo size="nav" />
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <LocaleSwitcher />
          <NavAuth />
        </div>
      </nav>
      {children}
    </div>
  );
}
