import { getTranslations } from "next-intl/server";
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
  navLinkClassName,
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
        <nav className="hero-content relative z-50 flex w-full items-center justify-between px-6 py-5 sm:px-8 sm:py-6 fade-up">
          <Link href="/" className={navLogoLinkClassName}>
            <BrandLogo size="nav" priority />
          </Link>

          <NavBarCluster className="hidden lg:flex">
            <ThemeToggle />
            <NavBarDivider />
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
            <ThemeToggle />
            <NavBarDivider />
            <LocaleSwitcher />
            <NavBarDivider />
            <MobileNav user={user} />
          </NavBarCluster>
        </nav>

        <div className="hero-content relative flex-1 flex items-center px-6 pb-16 sm:px-8 sm:pb-20">
          <div className="relative z-20 w-full max-w-3xl">
            <div className="relative mb-10">
              <h1 className="hero-headline font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] text-fp-cream">
                <span className="fade-up delay-100 block">{t("home.headline1")}</span>
                <span className="fade-up delay-200 block italic">{t("home.headline2")}</span>
              </h1>
            </div>

            <div className="fade-up delay-300 w-full max-w-2xl">
              <SearchBar />
            </div>

            <div className="fade-up delay-500 mt-6">
              <p className="hero-viral-label text-[0.7rem] font-semibold tracking-[0.12em] uppercase mb-3">
                {t("home.viralLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
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
          </div>

          <div className="fade-up delay-300 pointer-events-none absolute bottom-[clamp(5rem,11vh,7.5rem)] right-6 z-10 hidden w-[min(50vw,45rem)] justify-end sm:right-8 lg:flex xl:right-10">
            <HeroCatMascot />
          </div>
        </div>
      </HeroSection>

      <Footer />
    </>
  );
}
