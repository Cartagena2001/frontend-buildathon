"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PlaceCardData } from "./PlaceCard";

const MapView = dynamic(() => import("@/features/map/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-fp-dim text-fp-muted text-sm">
      …
    </div>
  ),
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

        <span className="w-9 h-9 rounded-full fp-badge-overlay flex items-center justify-center text-xs font-semibold tabular-nums shrink-0">
          {String(place.rank).padStart(2, "0")}
        </span>
      </header>

      {/* Desktop — full height below header */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        <PlaceDetailDesktop place={place} />
      </div>

      {/* Mobile — scrollable page */}
      <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden flex-col">
        <PlaceDetailMobile place={place} />
      </div>
    </div>
  );
}

function PlaceDetailDesktop({ place }: { place: PlaceCardData }) {
  const t = useTranslations("place");

  return (
    <>
      <main className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
        <PlaceDetailHero place={place} variant="desktop" />
        <div className="flex-1 overflow-y-auto min-h-0">
          <PlaceDetailSections place={place} variant="desktop" />
        </div>
      </main>

      <aside className="w-[380px] xl:w-[480px] 2xl:w-[560px] shrink-0 flex flex-col border-l border-fp-border min-h-0">
        <div className="shrink-0 px-4 py-3 border-b border-fp-border">
          <h2 className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest">
            {t("location")}
          </h2>
          <p className="text-fp-cream text-sm mt-1">{place.location}</p>
        </div>
        <div className="relative flex-1 min-h-0">
          <MapView places={[place]} selectedId={place.id} />
        </div>
      </aside>
    </>
  );
}

function PlaceDetailMobile({ place }: { place: PlaceCardData }) {
  const t = useTranslations("place");

  return (
    <main className="flex-1 overflow-y-auto min-h-0">
      <PlaceDetailHero place={place} variant="mobile" />
      <PlaceDetailSections place={place} variant="mobile" />

      <section className="px-4 sm:px-6 pb-8">
        <h2 className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-3">
          {t("location")}
        </h2>
        <div className="relative h-64 rounded-2xl overflow-hidden border border-fp-border">
          <MapView places={[place]} selectedId={place.id} />
        </div>
        <p className="text-fp-muted text-sm mt-3">{place.location}</p>
      </section>
    </main>
  );
}

function PlaceDetailHero({
  place,
  variant,
}: {
  place: PlaceCardData;
  variant: "mobile" | "desktop";
}) {
  const isDesktop = variant === "desktop";

  return (
    <div
      className={
        isDesktop
          ? "relative flex-[1.15] min-h-[280px] max-h-[min(52vh,520px)] shrink-0 overflow-hidden"
          : "relative h-48 sm:h-56 shrink-0 overflow-hidden"
      }
    >
      <Image
        src={place.coverImage}
        alt={place.name}
        fill
        priority
        className="object-cover"
        sizes={isDesktop ? "50vw" : "100vw"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-fp-dark/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 sm:left-6 lg:left-8">
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${badgeClasses[place.badgeColor]}`}
        >
          {place.badge}
        </span>
        {!isDesktop ? (
          <p className="text-fp-muted text-xs mt-2">
            {place.location} · {place.categories.join(" · ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PlaceDetailSections({
  place,
  variant,
}: {
  place: PlaceCardData;
  variant: "mobile" | "desktop";
}) {
  const t = useTranslations("place");
  const explore = useTranslations("explore");
  const isDesktop = variant === "desktop";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {isDesktop ? (
        <p className="text-fp-muted text-xs">{place.categories.join(" · ")}</p>
      ) : null}

      <section>
        <h2 className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-3">
          {t("about")}
        </h2>
        <p className="text-fp-cream/90 text-base leading-relaxed">
          {place.description}
        </p>
      </section>

      <section>
        <h2 className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-4">
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

      <section className={isDesktop ? "pb-8" : undefined}>
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
