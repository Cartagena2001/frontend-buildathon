import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import ExploreSearchBar from "@/features/search/components/ExploreSearchBar";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-fp-dark flex flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-fp-border px-5 py-4 lg:px-8">
        <div className="flex items-center gap-6 min-w-0">
          <Link
            href="/"
            className="text-fp-cream font-sans text-[1.05rem] font-light tracking-wide shrink-0"
          >
            findy<span className="text-fp-cyan">.</span>place
          </Link>
          <Link
            href="/"
            className="hidden sm:inline text-fp-muted hover:text-fp-cream text-sm transition-colors"
          >
            {t("explore.backHome")}
          </Link>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="hidden sm:inline-flex px-4 py-2 rounded-full bg-fp-red text-fp-cream text-sm font-semibold hover:bg-fp-cyan hover:text-fp-dark transition-colors"
          >
            {t("nav.signIn")}
          </Link>
        </div>
      </header>

      <div className="border-b border-fp-border px-5 py-4 lg:px-8">
        <Suspense fallback={<div className="h-[58px]" />}>
          <ExploreSearchBar />
        </Suspense>
      </div>

      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
