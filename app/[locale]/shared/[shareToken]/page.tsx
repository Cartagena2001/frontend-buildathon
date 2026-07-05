import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSharedPlaceListEnriched } from "@/features/place-lists/actions";
import ListsPageShell from "@/features/place-lists/components/ListsPageShell";
import SharedListHero from "@/features/place-lists/components/SharedListHero";
import SharedPlaceCard from "@/features/place-lists/components/SharedPlaceCard";

type Props = {
  params: Promise<{ shareToken: string }>;
};

export default async function SharedListPage({ params }: Props) {
  const { shareToken } = await params;
  const [list, t] = await Promise.all([
    getSharedPlaceListEnriched(shareToken),
    getTranslations("lists"),
  ]);

  if (!list) notFound();

  const placeCountLabel = t("placeCount", { count: list.places.length });

  return (
    <ListsPageShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <SharedListHero
          name={list.name}
          description={list.description}
          ownerName={list.owner.firstName}
          places={list.places}
          placeCountLabel={placeCountLabel}
          sharedListLabel={t("sharedList")}
          sharedByLabel={t("sharedBy", { name: list.owner.firstName })}
        />

        {list.places.length === 0 ? (
          <div className="bg-fp-dim border border-fp-border rounded-2xl flex flex-col items-center justify-center gap-4 py-16 sm:py-20 text-center px-6 fade-up delay-100">
            <span className="w-14 h-14 rounded-2xl bg-fp-teal/10 flex items-center justify-center text-fp-teal">
              <MapPinIcon />
            </span>
            <p className="text-fp-muted text-sm max-w-sm leading-relaxed">{t("emptyShared")}</p>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full bg-fp-coral text-white text-sm font-semibold hover:bg-fp-coral/90 transition-colors"
            >
              {t("exploreNow")}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-4 mb-5 fade-up delay-100">
              <h2 className="font-display text-fp-cream text-lg sm:text-xl">
                {t("placesInList")}
              </h2>
              <span className="text-fp-muted text-xs font-semibold uppercase tracking-widest">
                {placeCountLabel}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {list.places.map((place, i) => (
                <SharedPlaceCard
                  key={place.id}
                  place={place}
                  viewPlaceLabel={t("viewPlace")}
                  index={i}
                />
              ))}
            </div>

            <div className="mt-12 sm:mt-16 text-center fade-up delay-200">
              <p className="text-fp-muted text-sm mb-4">{t("sharedDiscover")}</p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-fp-border bg-fp-dim text-fp-cream text-sm font-semibold hover:border-fp-coral/50 hover:text-fp-coral transition-colors"
              >
                {t("exploreNow")}
                <span aria-hidden>→</span>
              </Link>
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
