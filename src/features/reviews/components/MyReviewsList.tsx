"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StarRatingDisplay } from "./StarRating";
import type { MyPlaceReview } from "../types";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-SV" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyReviewsList({ reviews }: { reviews: MyPlaceReview[] }) {
  const locale = useLocale();

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="glass rounded-xl p-4 sm:p-5">
          <Link
            href={`/explore/${review.place.id}`}
            className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-fp-cream text-base font-semibold group-hover:text-fp-coral transition-colors">
                {review.place.canonicalName}
              </h3>
              {review.place.locationText && (
                <p className="text-fp-muted text-xs mt-0.5 truncate">{review.place.locationText}</p>
              )}
              {review.comment ? (
                <p className="text-fp-cream text-sm mt-2 leading-relaxed line-clamp-2">{review.comment}</p>
              ) : null}
            </div>
            <div className="shrink-0 flex flex-col sm:items-end gap-1">
              <StarRatingDisplay value={review.rating} size={16} />
              <span className="text-fp-muted text-xs">{formatDate(review.updatedAt, locale)}</span>
              {review.place.category && (
                <span className="fp-category-chip shrink-0">{review.place.category}</span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
