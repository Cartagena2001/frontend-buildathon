"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";

const AUTO_DISMISS_MS = 3500;

interface Props {
  onDismiss: () => void;
}

export default function PlaceAddedSuccessOverlay({ onDismiss }: Props) {
  const t = useTranslations("lists");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="place-added-success-overlay fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-added-title"
    >
      <div
        className="flex flex-col items-center text-center max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src="/mascot/good-cat.png"
          alt=""
          width={320}
          height={320}
          priority
          className="place-added-success-overlay__cat w-[min(72vw,20rem)] h-auto mascot-elevation select-none"
        />
        <div className="place-added-success-overlay__copy mt-6 space-y-2 px-2">
          <h2
            id="place-added-title"
            className="place-added-success-overlay__title font-display text-xl sm:text-2xl leading-tight"
          >
            {t("placeAddedSuccess")}
          </h2>
          <p className="place-added-success-overlay__subtitle text-sm sm:text-base leading-relaxed">
            {t("placeAddedShareHint")}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
