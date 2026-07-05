"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import CelebrationOverlay from "@/features/place-lists/components/CelebrationOverlay";

interface Props {
  placeId: string;
  placeName: string;
  open: boolean;
  onClose: () => void;
}

export default function SharePlaceModal({
  placeId,
  placeName,
  open,
  onClose,
}: Props) {
  const t = useTranslations("lists");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/explore/${placeId}`
      : `/${locale}/explore/${placeId}`;

  const resetFeedback = useCallback(() => {
    setCopied(false);
    setShareError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetFeedback();
    onClose();
  }, [onClose, resetFeedback]);

  const handleCopy = async () => {
    setShareError(null);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareError(t("copyError"));
    }
  };

  const handleNativeShare = async () => {
    setShareError(null);
    if (!navigator.share) {
      await handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: placeName,
        text: t("sharePlaceNativeText", { placeName }),
        url: shareUrl,
      });
      handleClose();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setShareError(t("shareError"));
    }
  };

  if (!open) return null;

  return (
    <CelebrationOverlay
      title={t("sharePlaceTitle")}
      subtitle={t("sharePlacePrompt", { placeName })}
      titleId="share-place-title"
      onDismiss={handleClose}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => void handleNativeShare()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-fp-coral text-white text-sm font-semibold hover:bg-fp-coral/90 transition-colors shadow-sm"
        >
          <ShareIcon />
          {t("sharePlaceAction")}
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border ${
            copied
              ? "bg-fp-teal/15 text-fp-teal border-fp-teal/30"
              : "bg-white/10 text-white border-white/20 hover:bg-white/15"
          }`}
        >
          {copied ? (
            <>
              <CheckIcon />
              {t("copied")}
            </>
          ) : (
            <>
              <LinkIcon />
              {t("copyLink")}
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="text-white/55 text-sm hover:text-white/80 transition-colors"
      >
        {t("close")}
      </button>

      {shareError ? (
        <p className="text-fp-red text-sm" role="alert">
          {shareError}
        </p>
      ) : null}
    </CelebrationOverlay>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
