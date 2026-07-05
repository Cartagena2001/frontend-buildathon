import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HeroSection from "@/components/hero/HeroSection";
import BrandLogo from "@/components/ui/BrandLogo";
import MobileNav from "@/components/ui/MobileNav";
import {
  NavBarCluster,
  NavBarDivider,
  navLinkClassName,
  navLogoLinkClassName,
} from "@/components/ui/NavBarCluster";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import NavAuth from "@/components/ui/NavAuth";
import { auth } from "@/lib/auth";

const NOT_FOUND_IMAGE = {
  src: "/mascot/404.webp",
  width: 822,
  height: 570,
} as const;

export default async function NotFoundScreen() {
  const [t, tNotFound, session] = await Promise.all([
    getTranslations(),
    getTranslations("notFound"),
    auth(),
  ]);

  const user = session?.user
    ? { name: session.user.name ?? "", email: session.user.email ?? "" }
    : null;

  return (
    <HeroSection>
      <nav className="hero-content relative z-50 flex w-full shrink-0 items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
        <Link href="/" className={navLogoLinkClassName}>
          <BrandLogo size="nav" priority />
        </Link>

        <NavBarCluster className="hidden lg:flex">
          <LocaleSwitcher />
          <NavBarDivider />
          <Link href="/explore" className={navLinkClassName}>
            {t("nav.destinations")}
          </Link>
          <Link href="/explore?sort=trending" className={navLinkClassName}>
            {t("nav.trending")}
          </Link>
          <NavBarDivider />
          <NavAuth />
        </NavBarCluster>

        <NavBarCluster className="flex lg:hidden">
          <LocaleSwitcher />
          <NavBarDivider />
          <MobileNav user={user} />
        </NavBarCluster>
      </nav>

      <div className="hero-content relative flex flex-1 items-center justify-center px-4 py-8">
        {/* Plain img — transparent WebP; avoid mascot-loading-video bg + next/image nav glitches */}
        <img
          src={NOT_FOUND_IMAGE.src}
          alt={tNotFound("imageAlt")}
          width={NOT_FOUND_IMAGE.width}
          height={NOT_FOUND_IMAGE.height}
          decoding="async"
          fetchPriority="high"
          className="mascot-elevation pointer-events-none block h-auto max-h-[80dvh] w-auto max-w-[min(92vw,48rem)] object-contain"
        />
      </div>
    </HeroSection>
  );
}
