import { getTranslations } from "next-intl/server";
import HeroRotatingHeadline from "@/components/hero/HeroRotatingHeadline";
import HeroCatMascot from "@/components/mascot/HeroCatMascot";
import HeroSection from "@/components/hero/HeroSection";
import BrandLogo from "@/components/ui/BrandLogo";
import { Link } from "@/i18n/navigation";
import SearchBar from "@/features/search/components/SearchBar";
import TagSearchLink from "@/features/search/components/TagSearchLink";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import MobileNav from "@/components/ui/MobileNav";
import {
  NavBarCluster,
  NavBarDivider,
  navLogoLinkClassName,
} from "@/components/ui/NavBarCluster";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavAuth from "@/components/ui/NavAuth";
import Footer from "@/components/ui/Footer";
import { auth } from "@/lib/auth";

const TAG_KEYS = [
  "surfing",
  "pupusas",
  "nightlife",
  "beaches",
  "coffee",
] as const;

const ACTIVE_TAG = "nightlife";

export default async function HomePage() {
  const [t, session] = await Promise.all([
    getTranslations(),
    auth(),
  ]);

  const user = session?.user
    ? { name: session.user.name ?? "", email: session.user.email ?? "" }
    : null;

  return (
    <>
      <HeroSection>
        <nav
          className="hero-nav hero-content fade-up relative z-50 w-full px-6 py-5 sm:px-8 sm:py-6"
          aria-label="Main"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link href="/" className={navLogoLinkClassName}>
                <BrandLogo size="nav" priority forceVariant="onDark" />
              </Link>
            </div>

            <NavBarCluster variant="hero" className="hero-nav-cluster hidden lg:flex">
              <ThemeToggle variant="hero" />
              <NavBarDivider variant="hero" />
              <LocaleSwitcher variant="hero" />
              <NavBarDivider variant="hero" />
              <NavAuth variant="hero" />
            </NavBarCluster>

            <NavBarCluster variant="hero" className="hero-nav-cluster flex lg:hidden">
              <ThemeToggle variant="hero" />
              <NavBarDivider variant="hero" />
              <LocaleSwitcher variant="hero" />
              <NavBarDivider variant="hero" />
              <MobileNav user={user} />
            </NavBarCluster>
          </div>
        </nav>

        <div className="hero-content relative flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-4 sm:px-8 sm:pb-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-[clamp(1.5rem,4vh,2.5rem)] text-center">
            <div className="fade-up delay-100 w-full max-w-[38rem]">
              <HeroRotatingHeadline />
            </div>

            <div className="fade-up delay-300 w-full max-w-2xl">
              <SearchBar />
            </div>

            <div className="fade-up delay-500 w-full max-w-[36rem]">
              <p className="hero-viral-label mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em]">
                {t("home.viralLabel")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {TAG_KEYS.map((key) => (
                  <TagSearchLink
                    key={key}
                    query={t(`home.tags.${key}`)}
                    className={`tag-pill ${key === ACTIVE_TAG ? "active" : ""}`}
                  >
                    {t(`home.tags.${key}`)}
                  </TagSearchLink>
                ))}
              </div>
            </div>

            <div className="fade-up delay-400 pointer-events-none hidden w-full max-w-md justify-center pt-1 lg:flex">
              <HeroCatMascot />
            </div>
          </div>
        </div>
      </HeroSection>

      <Footer />
    </>
  );
}
