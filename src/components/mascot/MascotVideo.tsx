"use client";

import { useEffect, useRef, useState } from "react";
import { MASCOT_ASSETS, type MascotVariant } from "./types";

const STALL_FAILSAFE_MS = 4000;

interface Props {
  variant?: MascotVariant;
  size?: number | string;
  className?: string;
  essential?: boolean;
  onUnavailable?: () => void;
  onPlaying?: () => void;
}

export default function MascotVideo({
  variant = "search",
  size = "clamp(96px, 20vw, 120px)",
  className = "",
  essential = false,
  onUnavailable,
  onPlaying,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const unavailableRef = useRef(false);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hidden, setHidden] = useState(false);
  const assets = MASCOT_ASSETS[variant];

  function clearStallTimer() {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }

  function markUnavailable() {
    if (unavailableRef.current) return;
    unavailableRef.current = true;
    clearStallTimer();
    setHidden(true);
    onUnavailable?.();
  }

  function handleStalled() {
    clearStallTimer();
    stallTimerRef.current = setTimeout(() => {
      const el = videoRef.current;
      if (!el || unavailableRef.current) return;
      if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !el.paused) return;
      markUnavailable();
    }, STALL_FAILSAFE_MS);
  }

  useEffect(() => {
    unavailableRef.current = false;
    setHidden(false);
  }, [assets.mp4]);

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
  }, [assets.mp4, essential, hidden, onPlaying]);

  if (hidden) return null;

  return (
    <video
      ref={videoRef}
      src={assets.mp4}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
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
