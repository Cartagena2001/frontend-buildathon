import type { ReactNode } from "react";
import HeroBackgroundVideo from "@/components/hero/HeroBackgroundVideo";
import { HERO_BG_ASSETS } from "@/components/hero/types";

interface HeroSectionProps {
  children: ReactNode;
}

/** Homepage hero — poster paints instantly; video layers on top when ready. */
export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <div
      className="hero-bg hero-bg--video min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundImage: `url(${HERO_BG_ASSETS.poster})` }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <HeroBackgroundVideo />
      </div>
      {children}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-40 bg-gradient-to-t from-fp-dark to-transparent" />
    </div>
  );
}
