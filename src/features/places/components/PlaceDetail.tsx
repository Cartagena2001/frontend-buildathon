"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import MapView from "@/features/map/components/MapView";
import SaveButton from "@/features/places/components/SaveButton";
import type { PlaceCardData } from "./PlaceCard";

const badgeClasses: Record<PlaceCardData["badgeColor"], string> = {
  red: "bg-fp-orange text-fp-on-accent",
  cyan: "bg-fp-teal text-fp-on-cyan",
  rose: "border border-fp-coral/50 text-fp-coral",
};

const sentimentClasses: Record<string, string> = {
  high: "text-fp-teal",
  medium: "text-fp-coral",
  low: "text-fp-orange",
};

interface PlaceDetailProps {
  place: PlaceCardData;
  isSaved?: boolean;
}

export default function PlaceDetail({ place, isSaved = false }: PlaceDetailProps) {
  const t = useTranslations("place");

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-fp-dark overflow-hidden">
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-fp-border bg-fp-dark z-30">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-fp-muted hover:text-fp-cyan transition-colors shrink-0"
        >
          ← {t("backToExplore")}
        </Link>

        <div className="flex-1 min-w-0 text-center">
          <h1 className="font-display text-fp-cream text-base sm:text-lg leading-tight truncate">
            {place.name}
          </h1>
          <p className="text-fp-muted text-xs truncate hidden sm:block">
            {place.location}
          </p>
        </div>

        <SaveButton
          placeId={place.id}
          placeName={place.name}
          isSaved={isSaved}
          className="shrink-0"
        />
      </header>

      {/* Single layout tree — one MapView, responsive position */}
      <div className="flex flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex-col lg:flex-row">
        <main className="lg:flex-1 lg:min-w-0 lg:overflow-y-auto lg:min-h-0">
          <PlaceDetailHero place={place} />
          <PlaceDetailSections place={place} />

          <div className="lg:hidden px-4 sm:px-6">
            <h2 className="font-sans text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-3">
              {t("location")}
            </h2>
          </div>
        </main>

        <aside className="relative shrink-0 h-64 lg:h-auto lg:w-[380px] xl:w-[480px] 2xl:w-[560px] lg:shrink-0 lg:border-l border-fp-border bg-fp-dim lg:flex lg:flex-col lg:min-h-0">
          <div className="relative flex-1 min-h-[16rem] lg:min-h-0">
            <MapView places={[place]} selectedId={place.id} />
          </div>
          <p className="lg:hidden px-4 sm:px-6 pb-8 text-fp-muted text-sm">
            {place.location}
          </p>
        </aside>
      </div>
    </div>
  );
}

function PlaceDetailHero({ place }: { place: PlaceCardData }) {
  return (
    <>
      <div className="hidden lg:block hero-bg relative h-44 lg:h-52 overflow-hidden">
        <div className="hero-content flex flex-col justify-end h-full px-8 pb-7 gap-2.5">
          <span
            className={`self-start inline-block px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${badgeClasses[place.badgeColor]}`}
          >
            {place.badge}
          </span>
          <p className="text-fp-muted text-sm">
            {place.location} · {place.categories.join(" · ")}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-fp-dark to-transparent pointer-events-none z-[2]" />
      </div>

      <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden lg:hidden">
        <Image
          src={place.coverImage}
          alt={place.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-fp-dark/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 sm:left-6">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${badgeClasses[place.badgeColor]}`}
          >
            {place.badge}
          </span>
          <p className="text-fp-muted text-xs mt-2">
            {place.location} · {place.categories.join(" · ")}
          </p>
        </div>
      </div>
    </>
  );
}

function PlaceDetailSections({ place }: { place: PlaceCardData }) {
  const t = useTranslations("place");
  const explore = useTranslations("explore");

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <section>
        <h2 className="font-sans text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-3">
          {t("about")}
        </h2>
        <p className="text-fp-cream/90 text-base leading-relaxed">
          {place.description}
        </p>
      </section>

      <section>
        <h2 className="font-sans text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-4">
          {t("socialProof")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
          <StatCard label={t("rank")} value={`#${String(place.rank).padStart(2, "0")}`} />
        </div>
      </section>

      <section className="lg:pb-8">
        <h2 className="font-sans text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-4">
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
