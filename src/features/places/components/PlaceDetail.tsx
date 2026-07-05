"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import SaveButton from "./SaveButton";
import { createClient } from "@/lib/supabase/client";
import type { PlaceDetailData, PlaceMentionView } from "@/features/places/place-detail.types";
import { toMapPlace } from "@/features/places/place-detail.types";
import { badgeOnImageClasses } from "./place-badge-styles";

const MapView = dynamic(() => import("@/features/map/components/MapView"), {
  ssr: false,
});


const sentimentClasses: Record<string, string> = {
  high: "text-fp-teal",
  medium: "text-fp-coral",
  low: "text-fp-orange",
};

const sentimentDot: Record<string, string> = {
  high: "bg-fp-teal",
  medium: "bg-fp-coral",
  low: "bg-fp-orange",
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-SV" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mentionSentimentLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.66) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

function mentionEngagement(mention: PlaceMentionView): number {
  return mention.likes + mention.comments + mention.shares + mention.bookmarks;
}

async function trackClickedPlace(placeId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_FINDY_CORE_API;
  if (!apiUrl) return;
  try {
    let token: string | undefined;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    } catch {
      // Supabase unavailable — attempt without token
    }
    await fetch(`${apiUrl}/clicked-places`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ placeId }),
    });
  } catch {
    // fire-and-forget
  }
}

interface PlaceDetailProps {
  place: PlaceDetailData;
  isSaved?: boolean;
}

export default function PlaceDetail({ place, isSaved = false }: PlaceDetailProps) {
  const t = useTranslations("place");

  useEffect(() => {
    void trackClickedPlace(place.id);
  }, [place.id]);

  const mapPlace = toMapPlace(place);

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex-col lg:flex-row">
      <main className="lg:flex-1 lg:min-w-0 lg:overflow-y-auto lg:min-h-0">
        <PlaceDetailHero place={place} isSaved={isSaved} />
        <PlaceDetailEvidence place={place} />
      </main>

      <aside className="relative shrink-0 h-72 sm:h-80 lg:h-auto lg:w-[380px] xl:w-[460px] 2xl:w-[520px] lg:border-l border-fp-border bg-fp-dim lg:flex lg:flex-col lg:min-h-0">
        <div className="shrink-0 px-5 py-3 border-b border-fp-border hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <MapPinIcon />
            <span className="text-fp-cream text-sm truncate">{place.location}</span>
          </div>
          <span className="text-fp-muted text-[0.62rem] tabular-nums shrink-0 ml-3">
            {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
          </span>
        </div>

        <div className="relative flex-1 min-h-[16rem] lg:min-h-0">
          <MapView places={[mapPlace]} selectedId={place.id} showPopup={false} />
        </div>

        <div className="shrink-0 hidden lg:flex items-center gap-2 px-5 py-3 border-t border-fp-border">
          <OpenInMapButton
            label={t("openInMaps")}
            href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
            icon={<GoogleMapsIcon />}
          />
          <OpenInMapButton
            label={t("openInWaze")}
            href={`https://waze.com/ul?ll=${place.lat},${place.lng}&navigate=yes`}
            icon={<WazeIcon />}
          />
        </div>
      </aside>
    </div>
  );
}

function PlaceDetailHero({
  place,
  isSaved,
}: {
  place: PlaceDetailData;
  isSaved: boolean;
}) {
  return (
    <div className="relative h-52 sm:h-60 lg:h-64 shrink-0 overflow-hidden">
      <Image
        src={place.coverImage}
        alt={place.name}
        fill
        priority
        className="object-cover"
        sizes="(min-width: 1024px) 60vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-fp-dark/95 via-fp-dark/30 to-transparent" />

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <SaveButton
          placeId={place.id}
          placeName={place.name}
          isSaved={isSaved}
          className="w-10 h-10 fp-badge-overlay hover:!bg-fp-coral hover:!text-fp-on-accent hover:!border-fp-coral shadow-lg"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-5 sm:px-7 lg:px-8 pb-6">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${badgeOnImageClasses[place.badgeColor]}`}>
            {place.badge}
          </span>
        </div>
        <h1 className="font-display text-fp-cream text-2xl sm:text-3xl lg:text-[2rem] leading-tight mb-1 text-balance">
          {place.name}
        </h1>
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <p className="text-fp-muted text-xs sm:text-sm truncate">
            {place.location}
          </p>
          {place.category ? (
            <span className="fp-category-chip shrink-0">{place.category}</span>
          ) : null}
          <span className={`w-2 h-2 rounded-full shrink-0 ${sentimentDot[place.sentiment]}`} aria-hidden />
        </div>
      </div>
    </div>
  );
}

function PlaceDetailEvidence({ place }: { place: PlaceDetailData }) {
  const t = useTranslations("place");
  const locale = useLocale();

  return (
    <div className="divide-y divide-fp-border">
      <div className="px-5 sm:px-7 lg:px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:divide-x sm:divide-fp-border">
        <StatInline
          label={t("mentions")}
          value={t("creators", { count: place.mentionCount })}
        />
        <StatInline
          label={t("sentiment")}
          value={place.sentimentLabel}
          valueClass={sentimentClasses[place.sentiment]}
        />
        <StatInline
          label={t("likes")}
          value={formatCount(place.totalLikes)}
        />
        <StatInline
          label={t("lastMention")}
          value={place.lastMentionAt ? formatDate(place.lastMentionAt, locale) : "—"}
        />
      </div>

      {place.featuredMention ? (
        <section className="px-5 sm:px-7 lg:px-8 py-6">
          <h2 className="text-fp-cream text-sm font-semibold mb-4">{t("featuredMention")}</h2>
          <FeaturedMentionCard mention={place.featuredMention} locale={locale} />
        </section>
      ) : (
        <section className="px-5 sm:px-7 lg:px-8 py-8">
          <p className="text-fp-muted text-sm">{t("noMentions")}</p>
        </section>
      )}

      {place.otherMentions.length > 0 && (
        <section className="px-5 sm:px-7 lg:px-8 py-6">
          <h2 className="text-fp-cream text-sm font-semibold mb-4">
            {t("moreMentions", { count: place.otherMentions.length })}
          </h2>
          <ul className="space-y-3">
            {place.otherMentions.map((mention) => (
              <MentionListItem key={mention.id} mention={mention} locale={locale} />
            ))}
          </ul>
        </section>
      )}

      <section className="lg:hidden px-5 sm:px-7 py-4">
        <div className="flex items-center gap-2 text-fp-muted text-xs mb-3">
          <MapPinIcon />
          <span>{place.location}</span>
        </div>
        <div className="flex gap-2">
          <OpenInMapButton
            label={t("openInMaps")}
            href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
            icon={<GoogleMapsIcon />}
          />
          <OpenInMapButton
            label={t("openInWaze")}
            href={`https://waze.com/ul?ll=${place.lat},${place.lng}&navigate=yes`}
            icon={<WazeIcon />}
          />
        </div>
      </section>
    </div>
  );
}

function FeaturedMentionCard({
  mention,
  locale,
}: {
  mention: PlaceMentionView;
  locale: string;
}) {
  const t = useTranslations("place");
  const level = mentionSentimentLevel(mention.sentimentScore);

  return (
    <article className="rounded-xl border border-fp-border bg-fp-surface/40 p-5 sm:p-6">
      {mention.summary ? (
        <p className="text-fp-cream/90 text-[0.95rem] sm:text-base leading-relaxed max-w-prose text-pretty">
          {mention.summary}
        </p>
      ) : (
        <p className="text-fp-muted text-sm italic">{t("noSummary")}</p>
      )}

      <div className="mt-4 pt-4 border-t border-fp-border flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className={`font-medium ${sentimentClasses[level]}`}>
          {mention.sentiment}
        </span>
        <span className="text-fp-muted tabular-nums">
          {formatCount(mentionEngagement(mention))} {t("engagementTotal")}
        </span>
        <span className="text-fp-muted text-xs tabular-nums ml-auto">
          {formatDate(mention.createdAt, locale)}
        </span>
      </div>
    </article>
  );
}

function MentionListItem({
  mention,
  locale,
}: {
  mention: PlaceMentionView;
  locale: string;
}) {
  const level = mentionSentimentLevel(mention.sentimentScore);

  return (
    <li className="flex gap-3 rounded-lg border border-fp-border/80 bg-fp-surface/20 px-4 py-3.5">
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${sentimentDot[level]}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-fp-cream/85 text-sm leading-snug line-clamp-2">
          {mention.summary ?? "—"}
        </p>
        <div className="mt-2 flex items-center gap-3 text-[0.68rem] text-fp-muted tabular-nums">
          <span>{formatCount(mentionEngagement(mention))}</span>
          <span>{formatDate(mention.createdAt, locale)}</span>
        </div>
      </div>
    </li>
  );
}

function OpenInMapButton({ label, href, icon }: { label: string; href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-fp-border bg-fp-surface text-fp-cream text-[0.72rem] font-medium hover:border-fp-coral/50 hover:text-fp-coral transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

function StatInline({ label, value, valueClass = "text-fp-cream" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="px-0 sm:px-5 sm:first:pl-0">
      <p className="text-fp-muted text-[0.58rem] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-base sm:text-lg font-semibold leading-none ${valueClass}`}>{value}</p>
    </div>
  );
}

function MapPinIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function GoogleMapsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function WazeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="10" r="7" />
      <path d="M8 10h.01M16 10h.01" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9.5 13.5c.8.8 3.2.8 4 0" />
      <path d="M12 17v4" />
    </svg>
  );
}
