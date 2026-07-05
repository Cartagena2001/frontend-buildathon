import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPlaceListDetail } from "@/features/place-lists/actions";
import ListPlaceCard from "@/features/place-lists/components/ListPlaceCard";
import ListDetailActions from "@/features/place-lists/components/ListDetailActions";
import ListDetailHero from "@/features/place-lists/components/ListDetailHero";
import ListsPageShell from "@/features/place-lists/components/ListsPageShell";

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

  const placeCountLabel = t("placeCount", { count: list.placeCount });

  return (
    <ListsPageShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <Link
          href="/lists"
          className="inline-flex items-center gap-1.5 text-sm text-fp-muted hover:text-fp-coral transition-colors mb-6 fade-up"
        >
          <span aria-hidden>←</span>
          {t("backToLists")}
        </Link>

        <ListDetailHero
          name={list.name}
          description={list.description}
          placeCount={list.placeCount}
          places={list.places}
          placeCountLabel={placeCountLabel}
        />

        <div className="mb-8 fade-up delay-100">
          <ListDetailActions list={list} />
        </div>

        {list.places.length === 0 ? (
          <div className="bg-fp-dim border border-fp-border rounded-2xl flex flex-col items-center justify-center gap-4 py-16 sm:py-20 text-center px-6 fade-up delay-200">
            <span className="w-14 h-14 rounded-2xl bg-fp-teal/10 flex items-center justify-center text-fp-teal">
              <MapPinIcon />
            </span>
            <div>
              <p className="text-fp-cream font-display text-xl mb-1">{t("emptyList")}</p>
              <p className="text-fp-muted text-sm max-w-sm mx-auto leading-relaxed">{t("emptyListSub")}</p>
            </div>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full bg-fp-coral text-white text-sm font-semibold hover:bg-fp-coral/90 transition-colors"
            >
              {t("exploreNow")}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-4 mb-5 fade-up delay-200">
              <h2 className="font-display text-fp-cream text-lg sm:text-xl">
                {t("placesInList")}
              </h2>
              <span className="text-fp-muted text-xs font-semibold uppercase tracking-widest">
                {placeCountLabel}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {list.places.map((place, i) => (
                <ListPlaceCard key={place.id} listId={list.id} place={place} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </ListsPageShell>
  );
}

function MapPinIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
