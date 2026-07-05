import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";
import NavAuth from "@/components/ui/NavAuth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { getMyPlaceLists } from "@/features/place-lists/actions";
import ListCard from "@/features/place-lists/components/ListCard";
import CreateListButton from "@/features/place-lists/components/CreateListButton";

export default async function ListsPage() {
  const [session, t, locale, lists] = await Promise.all([
    auth(),
    getTranslations("lists"),
    getLocale(),
    getMyPlaceLists(),
  ]);

  if (!session?.user) redirect(`/${locale}/login`);

  return (
    <div className="min-h-screen" style={{ background: "var(--fp-dark)" }}>
      <nav className="w-full flex items-center justify-between px-6 sm:px-8 py-5 border-b border-fp-border">
        <Link href="/" className={navLogoLinkClassName}>
          <BrandLogo size="nav" />
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LocaleSwitcher />
          <NavAuth />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl text-fp-cream mb-2">
              {t("title")}
            </h1>
            <p className="text-fp-muted text-sm">{t("subtitle")}</p>
          </div>
          <CreateListButton />
        </div>

        {lists.length === 0 ? (
          <div className="glass rounded-2xl flex flex-col items-center justify-center gap-5 py-20 text-center px-6">
            <BookmarkIcon />
            <div>
              <p className="text-fp-cream font-semibold text-lg mb-1">{t("empty")}</p>
              <p className="text-fp-muted text-sm max-w-xs">{t("emptySub")}</p>
            </div>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
            >
              {t("exploreNow")}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookmarkIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-fp-border">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
