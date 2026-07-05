"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { PlaceDetailData } from "@/features/places/place-detail.types";
import type { GooglePriceLevel } from "@/lib/google-places/types";

const PRICE_LEVEL_KEYS: Record<GooglePriceLevel, string> = {
  PRICE_LEVEL_FREE: "free",
  PRICE_LEVEL_INEXPENSIVE: "inexpensive",
  PRICE_LEVEL_MODERATE: "moderate",
  PRICE_LEVEL_EXPENSIVE: "expensive",
  PRICE_LEVEL_VERY_EXPENSIVE: "veryExpensive",
};

function formatWebsiteLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-fp-orange" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = rating >= i + 1;
        const partial = !filled && rating > i;
        return (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={filled || partial ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={!filled && !partial ? "opacity-25" : partial ? "opacity-60" : ""}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </span>
  );
}

interface Props {
  place: PlaceDetailData;
}

export default function PlaceGoogleInfo({ place }: Props) {
  const t = useTranslations("place.google");
  const google = place.google;

  if (!google) return null;

  const hasDetails = Boolean(
    google.formattedAddress ||
      google.phone ||
      google.website ||
      google.rating != null ||
      google.priceLevel ||
      google.weekdayDescriptions?.length ||
      google.editorialSummary,
  );

  if (!hasDetails && !google.extraPhotos?.length) return null;

  const priceKey = google.priceLevel ? PRICE_LEVEL_KEYS[google.priceLevel] : null;

  return (
    <section className="px-5 sm:px-7 lg:px-8 py-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4">
        <h2 className="text-fp-cream text-sm font-semibold">{t("title")}</h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {google.rating != null ? (
            <div className="flex items-center gap-1.5">
              <StarRating rating={google.rating} />
              <span className="text-fp-cream text-sm font-semibold tabular-nums">
                {google.rating.toFixed(1)}
              </span>
              {google.userRatingCount != null ? (
                <span className="text-fp-muted text-xs tabular-nums">
                  ({formatCount(google.userRatingCount)} {t("reviews")})
                </span>
              ) : null}
            </div>
          ) : null}
          {priceKey ? (
            <span className="fp-category-chip">{t(`priceLevel.${priceKey}`)}</span>
          ) : null}
        </div>
      </div>

      <dl className="grid gap-3.5 text-sm sm:grid-cols-2">
        {google.formattedAddress ? (
          <InfoRow label={t("address")} value={google.formattedAddress} />
        ) : null}
        {google.phone ? (
          <InfoRow
            label={t("phone")}
            value={
              <a href={`tel:${google.phone.replace(/\s/g, "")}`} className="text-fp-teal hover:text-fp-coral transition-colors">
                {google.phone}
              </a>
            }
          />
        ) : null}
        {google.website ? (
          <InfoRow
            label={t("website")}
            value={
              <a
                href={google.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fp-teal hover:text-fp-coral transition-colors truncate block max-w-full"
              >
                {formatWebsiteLabel(google.website)}
              </a>
            }
          />
        ) : null}
        {google.weekdayDescriptions && google.weekdayDescriptions.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="text-fp-muted text-[0.58rem] font-bold uppercase tracking-widest mb-1.5">
              {t("hours")}
              {typeof google.openNow === "boolean" ? (
                <span className={`ml-2 normal-case tracking-normal font-semibold ${google.openNow ? "text-fp-teal" : "text-fp-coral"}`}>
                  · {google.openNow ? t("openNow") : t("closedNow")}
                </span>
              ) : null}
            </dt>
            <dd>
              <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 text-fp-cream/90 text-xs leading-relaxed">
                {google.weekdayDescriptions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>

      {google.extraPhotos && google.extraPhotos.length > 0 ? (
        <div className="mt-5">
          <p className="text-fp-muted text-[0.58rem] font-bold uppercase tracking-widest mb-2">
            {t("photos")}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {google.extraPhotos.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-fp-border"
              >
                <Image src={src} alt="" fill className="object-cover" sizes="128px" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-fp-muted text-[0.58rem] font-bold uppercase tracking-widest mb-1">
        {label}
      </dt>
      <dd className="text-fp-cream leading-snug">{value}</dd>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
