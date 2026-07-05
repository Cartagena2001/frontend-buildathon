"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { StarRatingInput } from "./StarRating";
import { submitReview, deleteReview } from "../actions";
import type { PlaceReview } from "../types";

interface ReviewFormProps {
  placeId: string;
  myReview: PlaceReview | null;
  onSubmitted?: (review: PlaceReview, ratingAvg: number | null, ratingCount: number) => void;
  onDeleted?: (ratingAvg: number | null, ratingCount: number) => void;
}

export default function ReviewForm({ placeId, myReview, onSubmitted, onDeleted }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = !!myReview;
  const isDirty = rating !== (myReview?.rating ?? 0) || comment !== (myReview?.comment ?? "");
  const canSubmit = rating >= 1 && !isPending;

  function handleSubmit() {
    if (rating < 1) return;
    setError(null);

    startTransition(async () => {
      const result = await submitReview(placeId, { rating, comment });
      if (result.ok) {
        setComment(result.data.review.comment ?? "");
        setRating(result.data.review.rating);
        router.refresh();
        onSubmitted?.(result.data.review, result.data.ratingAvg, result.data.ratingCount);
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!isEditing) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteReview(placeId);
      if (result.ok) {
        setRating(0);
        setComment("");
        router.refresh();
        onDeleted?.(result.data.ratingAvg, result.data.ratingCount);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-fp-cream text-sm font-medium mb-2">{isEditing ? t("editYourRating") : t("yourRating")}</p>
        <StarRatingInput value={rating} onChange={setRating} disabled={isPending} />
      </div>

      <div>
        <label htmlFor="review-comment" className="text-fp-cream text-sm font-medium block mb-2">
          {t("comment")}
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 1000))}
          placeholder={t("commentPlaceholder")}
          disabled={isPending}
          rows={3}
          className="w-full rounded-xl bg-fp-dark border border-fp-border px-4 py-3 text-fp-cream text-sm placeholder:text-fp-muted focus:border-fp-coral focus:outline-none resize-none disabled:opacity-50"
        />
        <p className="text-fp-muted text-xs mt-1 text-right">{comment.length}/1000</p>
      </div>

      {error && <p className="text-fp-red text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || !isDirty}
          className="px-5 py-2.5 rounded-full bg-fp-coral text-fp-on-accent text-sm font-semibold hover:bg-fp-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? t("saving") : isEditing ? t("update") : t("submit")}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-5 py-2.5 rounded-full border border-fp-border text-fp-cream text-sm font-semibold hover:border-fp-red hover:text-fp-red transition-colors disabled:opacity-50"
          >
            {t("delete")}
          </button>
        )}
      </div>
    </div>
  );
}
