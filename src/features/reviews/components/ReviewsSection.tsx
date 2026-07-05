"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StarRatingDisplay } from "./StarRating";
import ReviewForm from "./ReviewForm";
import UserAvatar from "@/components/ui/UserAvatar";
import type { PlaceReview, PlaceReviewsData } from "../types";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-SV" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ReviewCard({ review, locale }: { review: PlaceReview; locale: string }) {
  return (
    <article className="flex gap-3 py-4 border-b border-fp-border last:border-b-0">
      <UserAvatar name={review.author.firstName} image={review.author.image} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-fp-cream text-sm font-semibold">{review.author.firstName}</span>
          <StarRatingDisplay value={review.rating} size={14} />
        </div>
        <p className="text-fp-muted text-xs mt-0.5">{formatDate(review.createdAt, locale)}</p>
        {review.comment && (
          <p className="text-fp-cream text-sm mt-2 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
        )}
      </div>
    </article>
  );
}

interface ReviewsSectionProps {
  placeId: string;
  initialData: PlaceReviewsData;
  isAuthenticated?: boolean;
}

export default function ReviewsSection({ placeId, initialData, isAuthenticated = false }: ReviewsSectionProps) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const [data, setData] = useState<PlaceReviewsData>(initialData);

  const hasAny = data.ratingCount > 0;
  const myReview = data.myReview;
  const otherReviews = data.reviews;

  function handleSubmitted(review: PlaceReview, ratingAvg: number | null, ratingCount: number) {
    setData((prev) => ({
      ...prev,
      myReview: review,
      ratingAvg,
      ratingCount,
    }));
  }

  function handleDeleted(ratingAvg: number | null, ratingCount: number) {
    setData((prev) => ({
      ...prev,
      myReview: null,
      ratingAvg,
      ratingCount,
    }));
  }

  return (
    <section className="px-5 sm:px-7 lg:px-8 py-6 border-t border-fp-border">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-fp-cream text-sm font-semibold">{t("reviews")}</h2>
        {hasAny && (
          <div className="flex items-center gap-2 text-sm">
            <StarRatingDisplay value={data.ratingAvg ?? 0} size={16} />
            <span className="text-fp-cream font-semibold">{data.ratingAvg?.toFixed(1) ?? "0.0"}</span>
            <span className="text-fp-muted text-xs">({t("basedOn", { count: data.ratingCount })})</span>
          </div>
        )}
      </div>

      {isAuthenticated ? (
        <div className="mb-6 pb-6 border-b border-fp-border">
          <ReviewForm
            placeId={placeId}
            myReview={myReview}
            onSubmitted={handleSubmitted}
            onDeleted={handleDeleted}
          />
        </div>
      ) : (
        <div className="mb-6 pb-6 border-b border-fp-border">
          <p className="text-fp-muted text-sm mb-3">{t("loginToReview")}</p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 rounded-full bg-fp-coral text-fp-on-accent text-sm font-semibold hover:bg-fp-red transition-colors"
          >
            {t("login")}
          </Link>
        </div>
      )}

      {otherReviews.length === 0 ? (
        <p className="text-fp-muted text-sm">{t("noReviewsYet")}</p>
      ) : (
        <ul className="space-y-0">
          {otherReviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
