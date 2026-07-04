"use client";

/** Decorative hero mascot — plain img avoids next/image soft-nav glitches. */
export default function HeroCatMascot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none flex w-full justify-end"
    >
      <img
        src="/mascot/hero-cat.webp"
        alt=""
        width={1672}
        height={941}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="block h-auto w-full max-w-[min(42vw,34rem)] translate-x-[4%] drop-shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
      />
    </div>
  );
}
