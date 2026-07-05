import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";

export default function TermsPage() {
  const t = useTranslations("legal");
  const s = useTranslations("legal.terms");

  const sections = [
    { title: s("s1title"), body: s("s1body") },
    { title: s("s2title"), body: s("s2body") },
    { title: s("s3title"), body: s("s3body") },
    { title: s("s4title"), body: s("s4body") },
    { title: s("s5title"), body: s("s5body") },
    { title: s("s6title"), body: s("s6body") },
    { title: s("s7title"), body: s("s7body") },
    { title: s("s8title"), body: s("s8body") },
    { title: s("s9title"), body: s("s9body") },
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
            className="text-fp-muted hover:text-fp-teal text-sm transition-colors flex items-center gap-1.5"
          >
            ← {t("backHome")}
          </Link>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-14 fade-up">
        <header className="mb-12">
          <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] text-fp-cream mb-3">
            {s("title")}
          </h1>
          <p className="text-fp-muted text-sm">
            {t("lastUpdated")}: {s("date")}
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
            href="/legal/privacy"
            className="text-fp-teal hover:underline text-sm"
          >
            Privacy Policy →
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
