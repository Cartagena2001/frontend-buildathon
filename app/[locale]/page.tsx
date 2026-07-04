import { getTranslations } from "next-intl/server";
import HeroCatMascot from "@/components/mascot/HeroCatMascot";
import { Link } from "@/i18n/navigation";
import SearchBar from "@/features/search/components/SearchBar";
import TagSearchLink from "@/features/search/components/TagSearchLink";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import MobileNav from "@/components/ui/MobileNav";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavAuth from "@/components/ui/NavAuth";
import PopularPlaces from "@/features/places/components/PopularPlaces";
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
      <div className="hero-bg min-h-screen flex flex-col overflow-hidden">
        <nav className="hero-content relative z-50 w-full flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 fade-up">
          <Link
            href="/"
            className="text-fp-cream font-sans text-[1.05rem] font-light tracking-wide"
          >
            findy<span className="text-fp-coral">.</span>place
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <LocaleSwitcher />
            <Link
              href="/explore"
              className="text-fp-muted hover:text-fp-coral text-sm font-medium transition-colors"
            >
              {t("nav.destinations")}
            </Link>
            <Link
              href="/explore?sort=trending"
              className="text-fp-muted hover:text-fp-coral text-sm font-medium transition-colors"
            >
              {t("nav.trending")}
            </Link>
            <NavAuth />
          </div>

          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <LocaleSwitcher />
            <MobileNav user={user} />
          </div>
        </nav>

        <div className="hero-content relative flex-1 grid items-center gap-8 px-6 pb-16 sm:px-8 sm:pb-20 lg:grid-cols-[minmax(0,36rem)_minmax(20rem,1fr)] xl:grid-cols-[minmax(0,40rem)_minmax(24rem,1fr)]">
          <div className="relative z-20 w-full max-w-3xl lg:max-w-none">
            <div className="relative mb-10">
              <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] text-fp-cream">
                <span className="fade-up delay-100 block">{t("home.headline1")}</span>
                <span className="fade-up delay-200 block italic">{t("home.headline2")}</span>
              </h1>
            </div>

            <div className="fade-up delay-300 w-full max-w-2xl">
              <SearchBar />
            </div>

            <div className="fade-up delay-400 mt-6">
              <p className="text-fp-muted text-[0.7rem] font-semibold tracking-[0.12em] uppercase mb-3">
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

          <div className="relative z-10 hidden h-full min-h-[28rem] items-end justify-end lg:flex">
            <HeroCatMascot />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-[1] h-40 bg-gradient-to-t from-fp-dark to-transparent pointer-events-none" />
      </div>

      <PopularPlaces />

      <Footer />
    </>
  );
}
