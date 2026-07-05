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
import ReviewsSection from "@/features/reviews/components/ReviewsSection";
import type { PlaceReviewsData } from "@/features/reviews/types";
import {
  isRedundantLocation,
  mentionSentimentKey,
} from "@/features/places/place-detail-labels";
import PlaceGoogleInfo from "./PlaceGoogleInfo";

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

const mentionSentimentPill: Record<string, string> = {
  high: "bg-fp-cyan-dim text-fp-teal border-fp-teal/20",
  medium: "bg-fp-coral/12 text-fp-coral border-fp-coral/25",
  low: "bg-fp-orange/12 text-fp-orange border-fp-orange/25",
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
  reviewsData?: PlaceReviewsData;
  isAuthenticated?: boolean;
}

export default function PlaceDetail({ place, isSaved = false, reviewsData, isAuthenticated = false }: PlaceDetailProps) {
  const t = useTranslations("place");
  const locale = useLocale();

  useEffect(() => {
    void trackClickedPlace(place.id);
  }, [place.id]);

  const mapPlace = toMapPlace(place);
  const mapsHref =
    place.google?.googleMapsUri ??
    `https://www.google.com/maps?q=${place.lat},${place.lng}`;

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex-col lg:flex-row">
      <main className="lg:flex-1 lg:min-w-0 lg:overflow-y-auto lg:min-h-0">
        <PlaceDetailHero place={place} isSaved={isSaved} />
        <PlaceDetailHeader place={place} />
        <PlaceDetailEvidence place={place} />
        {reviewsData && (
          <ReviewsSection placeId={place.id} initialData={reviewsData} isAuthenticated={isAuthenticated} />
        )}
      </main>

      <aside className="relative shrink-0 h-72 sm:h-80 lg:h-auto lg:w-[380px] xl:w-[460px] 2xl:w-[520px] lg:border-l border-fp-border bg-fp-dim lg:flex lg:flex-col lg:min-h-0">
        <div className="relative flex-1 min-h-[18rem] lg:min-h-0">
          <MapView
            places={[mapPlace]}
            selectedId={place.id}
            locale={locale}
            showPopup
            showPopupCta={false}
          />
        </div>

        <div className="shrink-0 hidden lg:flex items-center gap-2 px-5 py-3 border-t border-fp-border">
          <OpenInMapButton
            label={t("openInMaps")}
            href={mapsHref}
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

      <span className={`absolute z-[2] top-3 left-3 sm:top-4 sm:left-4 inline-flex px-2.5 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-wider shadow-sm ${badgeOnImageClasses[place.badgeColor]}`}>
        {place.badge}
      </span>

      <div className="absolute z-[2] top-3 right-3 sm:top-4 sm:right-4">
        <SaveButton
          placeId={place.id}
          placeName={place.name}
          isSaved={isSaved}
          className="w-10 h-10 fp-badge-overlay hover:!bg-fp-coral hover:!text-fp-on-accent hover:!border-fp-coral shadow-lg"
        />
      </div>
    </div>
  );
}

function PlaceDetailHeader({ place }: { place: PlaceDetailData }) {
  const t = useTranslations("place");
  const locale = useLocale();

  const locationIsRedundant = isRedundantLocation(place.location, place.name);
  const locationText = locationIsRedundant ? null : place.location?.trim() || null;
  const summary =
    place.google?.editorialSummary?.trim() ||
    place.featuredMention?.summary?.trim() ||
    null;

  return (
    <header className="px-5 sm:px-7 lg:px-8 pt-5 sm:pt-6 pb-5 border-b border-fp-border">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {place.category ? (
          <span className="fp-category-chip">{place.category}</span>
        ) : null}
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${sentimentClasses[place.sentiment]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sentimentDot[place.sentiment]}`} aria-hidden />
          {t(`sentimentVibe.${place.sentiment}`)}
        </span>
      </div>

      <h1 className="font-display text-fp-cream text-[1.7rem] sm:text-3xl lg:text-[2.1rem] leading-[1.12] text-balance">
        {place.name}
      </h1>

      {locationText ? (
        <p className="mt-2 flex items-start gap-1.5 text-fp-muted text-sm leading-snug">
          <span className="mt-0.5 text-fp-teal shrink-0">
            <MapPinIcon />
          </span>
          <span className="min-w-0">{locationText}</span>
        </p>
      ) : null}

      {summary ? (
        <p className="mt-3.5 text-fp-ink/75 text-sm sm:text-[0.95rem] leading-relaxed max-w-prose text-pretty">
          {summary}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-fp-muted text-sm">
        <span className="text-fp-cream font-semibold">
          {t("creators", { count: place.mentionCount })}
        </span>
        <MetaDot />
        <span>
          <span className="text-fp-cream font-semibold tabular-nums">
            {formatCount(place.totalLikes)}
          </span>{" "}
          {t("likes").toLowerCase()}
        </span>
        {place.lastMentionAt ? (
          <>
            <MetaDot />
            <span>{t("lastSeen", { date: formatDate(place.lastMentionAt, locale) })}</span>
          </>
        ) : null}
      </div>
    </header>
  );
}

function MetaDot() {
  return <span className="text-fp-border" aria-hidden>·</span>;
}

function PlaceDetailEvidence({ place }: { place: PlaceDetailData }) {
  const t = useTranslations("place");
  const locale = useLocale();

  return (
    <div className="divide-y divide-fp-border">
      <PlaceGoogleInfo place={place} />

      {place.featuredMention ? (
        <section className="px-5 sm:px-7 lg:px-8 py-6">
          <h2 className="text-fp-cream text-sm font-semibold mb-4">{t("featuredMention")}</h2>
          <FeaturedMentionCard mention={place.featuredMention} locale={locale} />
        </section>
      ) : place.webMentions.length === 0 ? (
        <section className="px-5 sm:px-7 lg:px-8 py-8">
          <p className="text-fp-muted text-sm">{t("noMentions")}</p>
        </section>
      ) : null}

      {place.webMentions.length > 0 && (
        <section className="px-5 sm:px-7 lg:px-8 py-6">
          <h2 className="text-fp-cream text-sm font-semibold mb-1">{t("webSources")}</h2>
          <p className="text-fp-muted text-xs mb-4">{t("webSourcesHint")}</p>
          <ul className="space-y-3">
            {place.webMentions.map((mention) => (
              <WebMentionCard key={mention.id} mention={mention} locale={locale} />
            ))}
          </ul>
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

      <section className="lg:hidden px-5 sm:px-7 py-4 border-t border-fp-border">
        <div className="flex items-center gap-2 text-fp-teal text-xs mb-3">
          <MapPinIcon />
          <span className="text-fp-cream">{place.name}</span>
        </div>
        <div className="flex gap-2">
          <OpenInMapButton
            label={t("openInMaps")}
            href={
              place.google?.googleMapsUri ??
              `https://www.google.com/maps?q=${place.lat},${place.lng}`
            }
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
  const sentimentKey = mentionSentimentKey(mention.sentiment);
  const sentimentLabel = sentimentKey
    ? t(`mentionSentiments.${sentimentKey}`)
    : mention.sentiment;

  return (
    <article className="rounded-2xl border border-fp-border bg-fp-dim p-5 sm:p-6">
      {mention.summary ? (
        <p className="text-fp-cream text-[0.95rem] sm:text-base leading-relaxed max-w-prose text-pretty">
          {mention.summary}
        </p>
      ) : (
        <p className="text-fp-muted text-sm italic">{t("noSummary")}</p>
      )}

      <div className="mt-4 pt-4 border-t border-fp-border flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${mentionSentimentPill[level]}`}>
          {sentimentLabel}
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
    <li className="flex gap-3 rounded-xl border border-fp-border bg-fp-dim px-4 py-3.5 transition-colors hover:border-fp-coral/30">
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${sentimentDot[level]}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-fp-cream text-sm leading-snug line-clamp-2">
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

function sourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function WebMentionCard({
  mention,
  locale,
}: {
  mention: PlaceMentionView;
  locale: string;
}) {
  const t = useTranslations("place");
  const domain = mention.sourceUrl ? sourceDomain(mention.sourceUrl) : null;

  return (
    <li className="rounded-xl border border-fp-border bg-fp-surface/30 overflow-hidden">
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-fp-coral/10 border border-fp-coral/20 flex items-center justify-center text-fp-coral">
            <BlogIcon />
          </span>
          <div className="min-w-0 flex-1">
            {mention.summary ? (
              <p className="text-fp-cream/90 text-sm sm:text-[0.95rem] leading-relaxed text-pretty">
                {mention.summary}
              </p>
            ) : (
              <p className="text-fp-muted text-sm italic">{t("noSummary")}</p>
            )}

            {mention.evidence ? (
              <blockquote className="mt-3 pl-3 border-l-2 border-fp-coral/30 text-fp-muted text-xs sm:text-sm leading-relaxed italic line-clamp-3">
                {mention.evidence}
              </blockquote>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.68rem] text-fp-muted">
              <span>{formatDate(mention.createdAt, locale)}</span>
              {mention.sourceUrl && domain ? (
                <a
                  href={mention.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-fp-coral hover:text-fp-cream transition-colors font-medium"
                >
                  {t("readOn", { domain })}
                  <ExternalLinkIcon />
                </a>
              ) : null}
            </div>
          </div>
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-fp-border bg-fp-dim text-fp-cream text-[0.72rem] font-medium hover:border-fp-coral/50 hover:text-fp-coral transition-colors"
    >
      {icon}
      {label}
    </a>
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
function BlogIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h6" strokeLinecap="round" />
    </svg>
  );
}
function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
