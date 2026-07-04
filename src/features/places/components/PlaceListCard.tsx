import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { PlaceCardData } from "./PlaceCard";

const badgeClasses: Record<PlaceCardData["badgeColor"], string> = {
  red:  "bg-fp-red text-fp-on-accent",
  cyan: "bg-fp-cyan text-fp-on-cyan",
  rose: "border border-fp-rose/50 text-fp-rose",
};

const sentimentClasses: Record<string, string> = {
  high:   "text-fp-cyan",
  medium: "text-fp-rose",
  low:    "text-fp-red",
};

export default function PlaceListCard({
  place,
  selected = false,
}: {
  place: PlaceCardData;
  selected?: boolean;
}) {
  const t = useTranslations("explore");

  return (
    <Link
      id={`place-${place.id}`}
      href={`/explore/${place.id}`}
      className={`group flex flex-col sm:flex-row bg-fp-dim border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/20 ${
        selected
          ? "border-fp-cyan ring-1 ring-fp-cyan/30"
          : "border-fp-border hover:border-fp-rose/40"
      }`}
    >
      {/* Image */}
      <div className="relative w-full sm:w-[200px] lg:w-[220px] aspect-[16/9] sm:aspect-auto shrink-0 overflow-hidden">
        <Image
          src={place.coverImage}
          alt={place.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="220px"
        />
        {/* Rank */}
        <span className="absolute top-3 left-3 w-8 h-8 rounded-full fp-badge-overlay flex items-center justify-center text-xs font-semibold">
          {String(place.rank).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 p-5">
        <div>
          {/* Top row: name + badge */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-display text-fp-cream text-[1.35rem] leading-tight group-hover:text-fp-rose transition-colors">
              {place.name}
            </h3>
            <span className={`shrink-0 mt-1 px-2.5 py-1 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${badgeClasses[place.badgeColor]}`}>
              {place.badge}
            </span>
          </div>

          {/* Location + categories */}
          <p className="text-fp-muted text-xs mb-3">
            {place.location} · {place.categories.join(" · ")}
          </p>

          {/* Description */}
          <p className="text-fp-muted text-xs leading-5 line-clamp-3 mb-4">
            {place.description}
          </p>
        </div>

        <div className="flex items-end justify-between">
          {/* Stats */}
          <div className="flex items-end gap-6">
            <div>
              <p className="text-fp-muted text-[0.58rem] font-bold uppercase tracking-widest mb-0.5">
                {t("viralScore")}
              </p>
              <p className="text-fp-cream text-sm font-semibold">
                {place.viralScore}{" "}
                <span className="text-fp-muted font-normal text-xs">{t("hits")}</span>
              </p>
            </div>
            <div>
              <p className="text-fp-muted text-[0.58rem] font-bold uppercase tracking-widest mb-0.5">
                {t("sentiment")}
              </p>
              <p className={`text-sm font-semibold ${sentimentClasses[place.sentiment]}`}>
                {place.sentimentLabel}
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-1.5">
            {place.thumbnails.slice(0, 3).map((src, i) => (
              <div key={i} className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                <Image src={src} alt="" fill className="object-cover" sizes="36px" />
              </div>
            ))}
            {place.thumbnails.length > 3 && (
              <div className="w-9 h-9 rounded-lg bg-fp-surface border border-fp-border flex items-center justify-center shrink-0">
                <span className="text-fp-muted text-[0.6rem] font-semibold">
                  +{place.thumbnails.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
