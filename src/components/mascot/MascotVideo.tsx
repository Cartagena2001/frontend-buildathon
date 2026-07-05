"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MASCOT_ASSETS, type MascotVariant } from "./types";

const DEFAULT_STALL_FAILSAFE_MS = 4000;

interface Props {
  variant?: MascotVariant;
  size?: number | string;
  className?: string;
  essential?: boolean;
  stallTimeoutMs?: number;
  onUnavailable?: () => void;
  onPlaying?: () => void;
}

export default function MascotVideo({
  variant = "search",
  size = "clamp(96px, 20vw, 120px)",
  className = "",
  essential = false,
  stallTimeoutMs = DEFAULT_STALL_FAILSAFE_MS,
  onUnavailable,
  onPlaying,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const unavailableRef = useRef(false);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assets = MASCOT_ASSETS[variant];
  const assetKey = `${variant}:${assets.mp4}`;
  const [unavailableAssetKey, setUnavailableAssetKey] = useState<string | null>(
    null,
  );
  const hidden = unavailableAssetKey === assetKey;

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const markUnavailable = useCallback(() => {
    if (unavailableRef.current) return;
    unavailableRef.current = true;
    clearStallTimer();
    setUnavailableAssetKey(assetKey);
    onUnavailable?.();
  }, [assetKey, clearStallTimer, onUnavailable]);

  const handleStalled = useCallback(() => {
    clearStallTimer();
    stallTimerRef.current = setTimeout(() => {
      const el = videoRef.current;
      if (!el || unavailableRef.current) return;
      if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !el.paused) return;
      markUnavailable();
    }, stallTimeoutMs);
  }, [clearStallTimer, markUnavailable, stallTimeoutMs]);

  useEffect(() => {
    unavailableRef.current = false;
  }, [assetKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hidden) return;

    async function tryPlay() {
      const el = videoRef.current;
      if (!el || unavailableRef.current) return;
      el.muted = true;
      try {
        await el.play();
      } catch {
        setTimeout(() => {
          void videoRef.current?.play().catch(() => markUnavailable());
        }, 150);
      }
    }

    function handlePlaying() {
      clearStallTimer();
      onPlaying?.();
    }

    const shouldPlay =
      essential || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldPlay) {
      void tryPlay();
      video.addEventListener("loadeddata", tryPlay);
      video.addEventListener("canplay", tryPlay);
      video.addEventListener("playing", handlePlaying);
    }

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("playing", handlePlaying);
      clearStallTimer();
    };
  }, [assets.mp4, clearStallTimer, essential, hidden, markUnavailable, onPlaying]);

  if (hidden) return null;

  return (
    <video
      ref={videoRef}
      src={assets.mp4}
      autoPlay
      loop
      muted
      playsInline
      preload={essential ? "metadata" : "auto"}
      poster={assets.poster}
      aria-hidden="true"
      onError={markUnavailable}
      onStalled={handleStalled}
      className={`object-contain ${className}`}
      style={
        size !== undefined && !className.includes("mascot-loading-video")
          ? { width: size, height: size, maxWidth: "100%", maxHeight: "100%" }
          : undefined
      }
    />
  );
}
