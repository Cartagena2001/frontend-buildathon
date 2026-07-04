"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PlaceCardData } from "./PlaceCard";

const MapView = dynamic(() => import("@/features/map/components/MapView"), {
  ssr: false,
});

const badgeClasses: Record<PlaceCardData["badgeColor"], string> = {
  red: "bg-fp-red text-fp-on-accent",
  cyan: "bg-fp-cyan text-fp-on-cyan",
  rose: "border border-fp-rose/50 text-fp-rose",
};

const sentimentClasses: Record<string, string> = {
  high: "text-fp-cyan",
  medium: "text-fp-rose",
  low: "text-fp-red",
};

interface PlaceDetailProps {
  place: PlaceCardData;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  const t = useTranslations("place");
  const explore = useTranslations("explore");

  return (
    <div className="min-h-screen bg-fp-dark">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[280px] max-h-[480px] overflow-hidden">
        <Image
          src={place.coverImage}
          alt={place.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-fp-dark via-fp-dark/40 to-transparent" />

        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 sm:px-6 py-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full fp-tooltip px-4 py-2 text-sm text-fp-cream backdrop-blur-sm hover:text-fp-cyan transition-colors"
          >
            ← {t("backToExplore")}
          </Link>
          <span className="w-10 h-10 rounded-full fp-badge-overlay flex items-center justify-center text-sm font-semibold tabular-nums">
            {String(place.rank).padStart(2, "0")}
          </span>
        </div>

        <div className="absolute bottom-0 inset-x-0 px-4 sm:px-8 pb-8">
          <span
            className={`inline-block mb-3 px-2.5 py-1 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${badgeClasses[place.badgeColor]}`}
          >
            {place.badge}
          </span>
          <h1 className="font-display text-fp-cream text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-2">
            {place.name}
          </h1>
          <p className="text-fp-muted text-sm">
            {place.location} · {place.categories.join(" · ")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          <div>
            <section className="mb-10">
              <h2 className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-3">
                {t("about")}
              </h2>
              <p className="text-fp-cream/90 text-base leading-relaxed">
                {place.description}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-4">
                {t("socialProof")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard
                  label={explore("viralScore")}
                  value={place.viralScore}
                  suffix={explore("hits")}
                />
                <StatCard
                  label={explore("sentiment")}
                  value={place.sentimentLabel}
                  valueClass={sentimentClasses[place.sentiment]}
                />
                <StatCard
                  label={t("rank")}
                  value={`#${String(place.rank).padStart(2, "0")}`}
                />
              </div>
            </section>

            <section>
              <h2 className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-4">
                {t("clips")}
              </h2>
              <div className="flex flex-wrap gap-3">
                {place.thumbnails.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-fp-border"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Map — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <h2 className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-3">
                {t("location")}
              </h2>
              <div className="h-[320px] rounded-2xl overflow-hidden border border-fp-border">
                <MapView places={[place]} selectedId={place.id} />
              </div>
              <p className="text-fp-muted text-sm mt-3">{place.location}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  valueClass = "text-fp-cream",
}: {
  label: string;
  value: string;
  suffix?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-fp-border bg-fp-dim p-4">
      <p className="text-fp-muted text-[0.58rem] font-bold uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`text-lg font-semibold ${valueClass}`}>
        {value}
        {suffix ? (
          <span className="text-fp-muted font-normal text-xs ml-1">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
}
