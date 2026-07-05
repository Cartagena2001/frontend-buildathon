import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMyPlaceLists } from "@/features/place-lists/actions";
import ListCard from "@/features/place-lists/components/ListCard";
import CreateListButton from "@/features/place-lists/components/CreateListButton";
import ListsPageShell from "@/features/place-lists/components/ListsPageShell";

export default async function ListsPage() {
  const [session, t, locale, lists] = await Promise.all([
    auth(),
    getTranslations("lists"),
    getLocale(),
    getMyPlaceLists(),
  ]);

  if (!session?.user) redirect(`/${locale}/login`);

  const totalPlaces = lists.reduce((sum, l) => sum + l.placeCount, 0);

  return (
    <ListsPageShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Page header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 sm:mb-10 fade-up">
          <div className="max-w-xl">
            <p className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-[0.2em] mb-2">
              findy.place
            </p>
            <h1 className="font-display text-fp-cream text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight mb-2">
              {t("title")}
            </h1>
            <p className="text-fp-muted text-sm sm:text-base leading-relaxed">
              {t("subtitle")}
            </p>
            {lists.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="tag-pill active text-xs">
                  {t("statsLists", { count: lists.length })}
                </span>
                <span className="tag-pill text-xs">
                  {t("statsPlaces", { count: totalPlaces })}
                </span>
              </div>
            )}
          </div>
          <CreateListButton />
        </div>

        {lists.length === 0 ? (
          <div className="bg-fp-dim border border-fp-border rounded-2xl flex flex-col items-center justify-center gap-5 py-20 sm:py-24 text-center px-6 fade-up delay-100">
            <span className="w-16 h-16 rounded-2xl bg-fp-coral/10 flex items-center justify-center text-fp-coral">
              <BookmarkIcon />
            </span>
            <div>
              <p className="text-fp-cream font-display text-xl sm:text-2xl mb-2">{t("empty")}</p>
              <p className="text-fp-muted text-sm max-w-sm mx-auto leading-relaxed">{t("emptySub")}</p>
            </div>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full bg-fp-coral text-white text-sm font-semibold hover:bg-fp-coral/90 transition-colors shadow-sm"
            >
              {t("exploreNow")}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {lists.map((list, i) => (
              <ListCard key={list.id} list={list} index={i} />
            ))}
          </div>
        )}
      </div>
    </ListsPageShell>
  );
}

function BookmarkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
