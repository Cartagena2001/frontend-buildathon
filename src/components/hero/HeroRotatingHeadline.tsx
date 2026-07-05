"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const VARIANTS = ["popular", "viewed", "commented"] as const;
const ROTATE_MS = 2200;

export default function HeroRotatingHeadline() {
  const t = useTranslations("home");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % VARIANTS.length);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, []);

  return (
    <h1 className="hero-headline font-display text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.08] text-balance text-white">
      <span className="block">{t("headline1")}</span>
      <span
        className="hero-headline__rotator relative mx-auto mt-0 block w-fit italic"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="pointer-events-none invisible block" aria-hidden>
          {t("headline2Variants.commented")}
        </span>
        {VARIANTS.map((key, variantIndex) => (
          <span
            key={key}
            className={`hero-headline__word absolute inset-x-0 top-0 block ${
              variantIndex === index ? "is-active" : ""
            }`}
            aria-hidden={variantIndex !== index}
          >
            {t(`headline2Variants.${key}`)}
          </span>
        ))}
      </span>
    </h1>
  );
}
