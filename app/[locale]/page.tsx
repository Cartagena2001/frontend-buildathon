import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SearchBar from "@/features/search/components/SearchBar";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

const TAG_KEYS = [
  "surfing",
  "pupusas",
  "nightlife",
  "beaches",
  "coffee",
] as const;

const ACTIVE_TAG = "nightlife";

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="hero-bg min-h-screen flex flex-col">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="hero-content w-full flex items-center justify-between px-8 py-6 fade-up">
        <Link
          href="/"
          className="text-fp-cream font-sans text-[1.05rem] font-light tracking-wide"
        >
          findy<span className="text-fp-cyan">.</span>place
        </Link>

        <div className="flex items-center gap-6">
          <LocaleSwitcher />
          <Link
            href="/explore"
            className="text-fp-muted hover:text-fp-cream text-sm font-medium transition-colors"
          >
            {t("nav.destinations")}
          </Link>
          <Link
            href="/explore?sort=trending"
            className="text-fp-muted hover:text-fp-cream text-sm font-medium transition-colors"
          >
            {t("nav.trending")}
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-fp-red text-fp-cream text-sm font-semibold hover:bg-fp-cyan hover:text-fp-dark transition-colors"
          >
            {t("nav.signIn")}
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <div className="hero-content flex-1 flex flex-col justify-center px-8 pb-24 max-w-4xl">
        <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] text-fp-cream mb-10">
          <span className="fade-up delay-100 block">{t("home.headline1")}</span>
          <span className="fade-up delay-200 block italic">
            {t("home.headline2")}
          </span>
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
              <Link
                key={key}
                href={`/explore?q=${encodeURIComponent(t(`home.tags.${key}`))}`}
                className={`tag-pill ${key === ACTIVE_TAG ? "active" : ""}`}
              >
                {t(`home.tags.${key}`)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#040404] to-transparent pointer-events-none" />
    </main>
  );
}
