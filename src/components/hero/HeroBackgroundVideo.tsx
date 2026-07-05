"use client";

import { useEffect, useRef } from "react";
import { HERO_BG_ASSETS } from "@/components/hero/types";

export default function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const tryPlay = async () => {
      if (motionQuery.matches) {
        video.pause();
        return;
      }
      try {
        await video.play();
      } catch {
        setTimeout(() => void video.play().catch(() => {}), 150);
      }
    };

    void tryPlay();
    motionQuery.addEventListener("change", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    return () => {
      motionQuery.removeEventListener("change", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={HERO_BG_ASSETS.mp4}
      className="h-full w-full object-cover object-[center_40%]"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={HERO_BG_ASSETS.poster}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
    />
  );
}
