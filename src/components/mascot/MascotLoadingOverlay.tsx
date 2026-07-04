"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import MascotVideo from "./MascotVideo";
import LoadingProgressBar from "./LoadingProgressBar";
import { useSlowLoadingCopy } from "./useSlowLoadingCopy";
import { MASCOT_ASSETS, type MascotVariant } from "./types";

interface Props {
  variant?: MascotVariant;
}

function OverlayContent({ variant = "search" }: Props) {
  const t = useTranslations("loading");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const assets = MASCOT_ASSETS[variant];

  const { title, subtitle } = useSlowLoadingCopy({
    visible: true,
    defaultTitle: t("search.title"),
    defaultSubtitle: t("search.subtitle"),
    slowTitle: t("slow.title"),
    slowSteps: [t("slow.step1"), t("slow.step2"), t("slow.step3")],
  });

  return (
    <div
      className="mascot-loading-overlay overflow-y-auto overscroll-none"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mascot-loading-overlay__viewport">
        <div className="mascot-loading-overlay__shell">
          <div className="mascot-loading-overlay__media" aria-hidden="true">
            <img
              src={assets.poster}
              alt=""
              className={`mascot-loading-video mascot-loading-video__poster${videoPlaying ? " mascot-loading-video__poster--hidden" : ""}`}
            />
            {showVideo ? (
              <MascotVideo
                variant={variant}
                essential
                stallTimeoutMs={1500}
                className={`mascot-loading-video mascot-loading-video__player${videoPlaying ? " mascot-loading-video--playing" : ""}`}
                onUnavailable={() => setShowVideo(false)}
                onPlaying={() => setVideoPlaying(true)}
              />
            ) : null}
          </div>

          <div className="mascot-loading-overlay__footer">
            <div className="mascot-loading-overlay__copy">
              <p className="font-display text-xl sm:text-2xl leading-tight">
                {title}
              </p>
              <p className="font-sans text-sm sm:text-base">{subtitle}</p>
            </div>
            <LoadingProgressBar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MascotLoadingOverlay(props: Props) {
  if (typeof document === "undefined") return null;
  return createPortal(<OverlayContent {...props} />, document.body);
}
