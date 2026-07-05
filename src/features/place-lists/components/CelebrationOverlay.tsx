"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface Props {
  title: string;
  subtitle?: string;
  titleId: string;
  onDismiss: () => void;
  autoDismissMs?: number;
  children?: ReactNode;
}

export default function CelebrationOverlay({
  title,
  subtitle,
  titleId,
  onDismiss,
  autoDismissMs,
  children,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (autoDismissMs == null) return;
    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="place-added-success-overlay fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
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
        <div className="place-added-success-overlay__copy mt-6 space-y-2 px-2 w-full">
          <h2
            id={titleId}
            className="place-added-success-overlay__title font-display text-xl sm:text-2xl leading-tight text-balance"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="place-added-success-overlay__subtitle text-sm sm:text-base leading-relaxed text-pretty">
              {subtitle}
            </p>
          ) : null}
          {children ? (
            <div className="pt-4 space-y-3 w-full">{children}</div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
