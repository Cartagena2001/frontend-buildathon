import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";

export default function PrivacyPage() {
  const t = useTranslations("legal");
  const p = useTranslations("legal.privacy");

  const sections = [
    { title: p("s1title"), body: p("s1body") },
    { title: p("s2title"), body: p("s2body") },
    { title: p("s3title"), body: p("s3body") },
    { title: p("s4title"), body: p("s4body") },
    { title: p("s5title"), body: p("s5body") },
    { title: p("s6title"), body: p("s6body") },
    { title: p("s7title"), body: p("s7body") },
    { title: p("s8title"), body: p("s8body") },
    { title: p("s9title"), body: p("s9body") },
    { title: p("s10title"), body: p("s10body") },
  ];

  return (
    <div className="min-h-screen bg-fp-dark">
      {/* Top bar */}
      <div className="border-b border-fp-border">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className={navLogoLinkClassName}>
            <BrandLogo size="nav" />
          </Link>
          <Link
            href="/"
            className="text-fp-muted hover:text-fp-teal text-sm transition-colors"
          >
            ← {t("backHome")}
          </Link>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-14 fade-up">
        <header className="mb-12">
          <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] text-fp-cream mb-3">
            {p("title")}
          </h1>
          <p className="text-fp-muted text-sm">
            {t("lastUpdated")}: {p("date")}
          </p>
          <p className="text-fp-muted text-sm leading-7 mt-6 p-5 rounded-xl fp-legal-intro">
            {p("intro")}
          </p>
        </header>

        <div className="space-y-10">
          {sections.map((sec) => (
            <section key={sec.title}>
              <h2 className="font-sans font-semibold text-fp-cream text-base mb-3">
                {sec.title}
              </h2>
              <p className="text-fp-muted text-sm leading-7">{sec.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-fp-border flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <Link
            href="/legal/terms"
            className="text-fp-teal hover:underline text-sm"
          >
            Terms of Service →
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-coral transition-colors"
          >
            Back to Sign Up
          </Link>
        </div>
      </article>
    </div>
  );
}
