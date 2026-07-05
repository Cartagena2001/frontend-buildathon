import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";
import NavAuth from "@/components/ui/NavAuth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { getPlaceListDetail } from "@/features/place-lists/actions";
import ListPlaceCard from "@/features/place-lists/components/ListPlaceCard";
import ListDetailActions from "@/features/place-lists/components/ListDetailActions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params;
  const [list, t] = await Promise.all([
    getPlaceListDetail(id),
    getTranslations("lists"),
  ]);

  if (!list) notFound();

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
        <Link
          href="/lists"
          className="inline-flex items-center gap-1 text-sm text-fp-muted hover:text-fp-cyan transition-colors mb-6"
        >
          ← {t("backToLists")}
        </Link>

        <header className="mb-6">
          <h1 className="font-display text-4xl sm:text-5xl text-fp-cream mb-2">
            {list.name}
          </h1>
          {list.description && (
            <p className="text-fp-muted text-sm max-w-2xl">{list.description}</p>
          )}
          <p className="text-fp-muted text-xs mt-2">
            {t("placeCount", { count: list.placeCount })}
          </p>
        </header>

        {/* Actions: share + edit + delete — single card */}
        <div className="mb-8">
          <ListDetailActions list={list} />
        </div>

        {list.places.length === 0 ? (
          <div className="glass rounded-2xl flex flex-col items-center justify-center gap-4 py-16 text-center px-6">
            <p className="text-fp-cream font-medium">{t("emptyList")}</p>
            <p className="text-fp-muted text-sm max-w-sm">{t("emptyListSub")}</p>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
            >
              {t("exploreNow")}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {list.places.map((place) => (
              <ListPlaceCard key={place.id} listId={list.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
