"use client";

/** Decorative hero mascot — plain img avoids next/image soft-nav glitches. */
export default function HeroCatMascot() {
  return (
    <img
      src="/mascot/hero-cat.webp"
      alt=""
      aria-hidden
      width={653}
      height={367}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      style={{
        width: "min(100%, clamp(14rem, 28vw, 22rem))",
        height: "auto",
      }}
      className="pointer-events-none block h-auto w-full max-w-[clamp(14rem,28vw,22rem)] drop-shadow-[0_20px_48px_rgba(0,0,0,0.28)]"
    />
  );
}
