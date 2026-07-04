import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ExploreResults from "@/features/search/components/ExploreResults";
import { mockSearchPlaces } from "@/features/search/services/mock-search";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const [t, params] = await Promise.all([
    getTranslations("explore"),
    searchParams,
  ]);
  const query = params.q?.trim() ?? "";

  if (!query) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-3xl text-fp-cream mb-3">
            {t("emptyQueryTitle")}
          </h1>
          <p className="text-fp-muted mb-6">{t("emptyQueryBody")}</p>
          <Link
            href="/"
            className="inline-flex px-5 py-2.5 rounded-full bg-fp-red text-fp-cream text-sm font-semibold hover:bg-fp-cyan hover:text-fp-dark transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  const places = mockSearchPlaces(query);

  if (places.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-3xl text-fp-cream mb-3">
            {t("noResultsTitle")}
          </h1>
          <p className="text-fp-muted mb-2">{t("noResultsBody")}</p>
          <p className="text-sm text-fp-rose mb-6">
            &ldquo;{query}&rdquo;
          </p>
          <Link
            href="/"
            className="inline-flex px-5 py-2.5 rounded-full bg-fp-red text-fp-cream text-sm font-semibold hover:bg-fp-cyan hover:text-fp-dark transition-colors"
          >
            {t("tryAnotherSearch")}
          </Link>
        </div>
      </div>
    );
  }

  return <ExploreResults places={places} query={query} />;
}
