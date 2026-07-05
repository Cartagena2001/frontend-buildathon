import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PlaceCard from "./PlaceCard";
import { BEACHES, RESTAURANTS } from "@/features/places/data/mock-places";

interface CategorySection {
  key: string;
  label: string;
  places: typeof BEACHES;
}

const SECTIONS: CategorySection[] = [
  { key: "beaches", label: "🏄 Beaches", places: BEACHES },
  { key: "food", label: "🍽️ Food & Dining", places: RESTAURANTS },
];

export default function PopularPlaces() {
  const t = useTranslations("home.popular");

  return (
    <section className="bg-fp-dark px-4 sm:px-8 md:px-12 lg:px-20 py-14 sm:py-20">
      {/* Section header */}
      <div className="flex items-end justify-between mb-14">
        <div>
          <p className="text-fp-muted text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2">
            {t("eyebrow")}
          </p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] text-fp-cream leading-tight">
            {t("title")}
          </h2>
        </div>
        <Link
          href="/explore"
          className="hidden sm:inline-flex items-center gap-1.5 text-fp-coral text-sm font-medium hover:underline"
        >
          {t("viewAll")} →
        </Link>
      </div>

      {/* Category sections */}
      <div className="space-y-16">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            <h3 className="font-sans text-fp-cream text-sm font-semibold uppercase tracking-widest mb-6 flex items-center gap-3">
              {section.label}
              <span className="flex-1 h-px bg-fp-border" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile view-all */}
      <div className="sm:hidden mt-10 text-center">
        <Link
          href="/explore"
          className="inline-flex px-6 py-3 rounded-full border border-fp-border text-fp-cream text-sm font-medium hover:border-fp-coral/50 hover:text-fp-coral transition-colors"
        >
          {t("viewAll")}
        </Link>
      </div>
    </section>
  );
}
