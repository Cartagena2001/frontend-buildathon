import { getTranslations } from "next-intl/server";
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
      <div className="hero-bg min-h-screen flex flex-col">
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

        <div className="hero-content flex-1 flex flex-col justify-center px-6 sm:px-8 pb-20 sm:pb-24 max-w-4xl">
          <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] text-fp-cream mb-10">
            <span className="fade-up delay-100 block">{t("home.headline1")}</span>
            <span className="fade-up delay-200 block italic">{t("home.headline2")}</span>
          </h1>

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

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-fp-dark to-transparent pointer-events-none" />
      </div>

      <PopularPlaces />

      <Footer />
    </>
  );
}
