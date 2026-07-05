"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SaveButton from "./SaveButton";
import { createClient } from "@/lib/supabase/client";
import type { PlaceCardData } from "./PlaceCard";

const MapView = dynamic(() => import("@/features/map/components/MapView"), {
  ssr: false,
});

const badgeClasses: Record<PlaceCardData["badgeColor"], string> = {
  red: "bg-fp-orange text-fp-on-accent",
  cyan: "bg-fp-teal text-fp-on-cyan",
  rose: "bg-fp-coral/20 text-fp-coral border border-fp-coral/40",
};

const sentimentClasses: Record<string, string> = {
  high: "text-fp-teal",
  medium: "text-fp-coral",
  low: "text-fp-orange",
};

const sentimentDot: Record<string, string> = {
  high: "bg-fp-teal",
  medium: "bg-fp-coral",
  low: "bg-fp-orange",
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function clipDate(index: number, locale: string): string {
  const intervals = [1, 3, 7, 14, 21, 30, 45, 60];
  const daysAgo = intervals[index] ?? index * 5 + 1;
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString(locale === "es" ? "es-SV" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function hqSrc(src: string): string {
  return src.replace(/w=\d+/, "w=1400").replace(/q=\d+/, "q=90");
}

/** Fire-and-forget: notifica al backend que el usuario visitó este lugar */
async function trackClickedPlace(placeId: string) {
  const apiUrl = process.env.FINDY_CORE_API;
  if (!apiUrl) return;
  try {
    let token: string | undefined;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    } catch {
      // Supabase no disponible — intentar de todas formas sin token
    }
    await fetch(`${apiUrl}/clicked-places`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ placeId }),
    });
  } catch {
    // fire-and-forget: ignorar errores silenciosamente
  }
}

interface PlaceDetailProps {
  place: PlaceCardData;
  isSaved?: boolean;
}

export default function PlaceDetail({ place, isSaved = false }: PlaceDetailProps) {
  const t = useTranslations("place");
  const [activeClip, setActiveClip] = useState<number | null>(null);

  /* Registrar visita al lugar en background */
  useEffect(() => {
    void trackClickedPlace(place.id);
  }, [place.id]);

  const savePayload = {
    placeId: place.id,
    placeName: place.name,
    placeLocation: place.location,
    placeImage: place.coverImage,
    placeCategories: place.categories,
  };

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-fp-dark overflow-hidden">
      {/* ── Nav ── */}
      <header className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-fp-border bg-fp-dark z-30">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-fp-muted hover:text-fp-coral transition-colors shrink-0"
        >
          <BackIcon />
          <span className="hidden sm:inline">{t("backToExplore")}</span>
        </Link>

        <Link
          href="/"
          className="text-fp-cream font-sans text-[1rem] font-light tracking-wide shrink-0"
        >
          findy<span className="text-fp-coral">.</span>place
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex-col lg:flex-row">
        <main className="lg:flex-1 lg:min-w-0 lg:overflow-y-auto lg:min-h-0">
          <PlaceDetailHero place={place} isSaved={isSaved} savePayload={savePayload} />
          <PlaceDetailSections place={place} onOpenClip={setActiveClip} />
        </main>

        {/* ── Mapa lateral ── */}
        <aside className="relative shrink-0 h-72 sm:h-80 lg:h-auto lg:w-[380px] xl:w-[460px] 2xl:w-[520px] lg:border-l border-fp-border bg-fp-dim lg:flex lg:flex-col lg:min-h-0">
          <div className="shrink-0 px-5 py-3 border-b border-fp-border hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPinIcon />
              <span className="text-fp-cream text-sm">{place.location}</span>
            </div>
            <span className="text-fp-muted text-[0.62rem] tabular-nums">
              {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
            </span>
          </div>

          <div className="relative flex-1 min-h-[16rem] lg:min-h-0">
            <MapView places={[place]} selectedId={place.id} showPopup={false} />
          </div>

          {/* Botones abrir en Maps / Waze */}
          <div className="shrink-0 hidden lg:flex items-center gap-2 px-5 py-3 border-t border-fp-border">
            <OpenInMapButton
              label={t("openInMaps")}
              href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
              icon={<GoogleMapsIcon />}
            />
            <OpenInMapButton
              label={t("openInWaze")}
              href={`https://waze.com/ul?ll=${place.lat},${place.lng}&navigate=yes`}
              icon={<WazeIcon />}
            />
          </div>
        </aside>
      </div>

      {/* ── Lightbox ── */}
      {activeClip !== null && (
        <ClipLightbox
          thumbnails={place.thumbnails}
          placeName={place.name}
          activeIndex={activeClip}
          onClose={() => setActiveClip(null)}
          onChange={setActiveClip}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Hero                                               */
/* ─────────────────────────────────────────────────── */
function PlaceDetailHero({
  place,
  isSaved,
  savePayload,
}: {
  place: PlaceCardData;
  isSaved: boolean;
  savePayload: Parameters<typeof SaveButton>[0]["place"];
}) {
  return (
    <div className="relative h-52 sm:h-60 lg:h-64 shrink-0 overflow-hidden">
      <Image
        src={place.coverImage}
        alt={place.name}
        fill
        priority
        className="object-cover"
        sizes="(min-width: 1024px) 60vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-fp-dark/95 via-fp-dark/30 to-transparent" />

      {/* Botón guardar — esquina superior derecha sobre la imagen */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <SaveButton
          isSaved={isSaved}
          place={savePayload}
          className="w-10 h-10 !bg-black/50 backdrop-blur-sm border border-white/20 !text-white hover:!bg-fp-coral/90 hover:!text-white hover:border-transparent shadow-lg"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-5 sm:px-7 lg:px-8 pb-6">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${badgeClasses[place.badgeColor]}`}>
            {place.badge}
          </span>
          <span className="w-6 h-6 rounded-full fp-badge-overlay flex items-center justify-center text-[0.6rem] font-bold tabular-nums">
            {String(place.rank).padStart(2, "0")}
          </span>
        </div>
        <h1 className="font-display text-fp-cream text-2xl sm:text-3xl lg:text-[2rem] leading-tight mb-1">
          {place.name}
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-fp-muted text-xs sm:text-sm">
            {place.location} · {place.categories.join(" · ")}
          </p>
          <span className={`w-2 h-2 rounded-full shrink-0 ${sentimentDot[place.sentiment]}`} aria-hidden />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Sections                                           */
/* ─────────────────────────────────────────────────── */
function PlaceDetailSections({
  place,
  onOpenClip,
}: {
  place: PlaceCardData;
  onOpenClip: (index: number) => void;
}) {
  const t = useTranslations("place");
  const explore = useTranslations("explore");
  const locale = useLocale();

  return (
    <div className="divide-y divide-fp-border">
      {/* Stats */}
      <div className="px-5 sm:px-7 lg:px-8 py-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-fp-border">
        <StatInline label={explore("viralScore")} value={place.viralScore} suffix={explore("hits")} valueClass="text-fp-coral" />
        <StatInline label={explore("sentiment")} value={place.sentimentLabel} valueClass={sentimentClasses[place.sentiment]} />
        <StatInline label={t("rank")} value={`#${String(place.rank).padStart(2, "0")}`} />
        <StatInline label={t("views")} value={formatCount(place.views)} />
      </div>

      {/* About */}
      <section className="px-5 sm:px-7 lg:px-8 py-6">
        <p className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-3">{t("about")}</p>
        <p className="text-fp-cream/90 text-sm sm:text-[0.95rem] leading-relaxed max-w-prose">
          {place.description}
        </p>
      </section>

      {/* Engagement */}
      <section className="px-5 sm:px-7 lg:px-8 py-5">
        <p className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest mb-4">{t("engagement")}</p>
        <div className="flex items-center gap-6 sm:gap-10">
          <EngagementInline icon={<HeartIcon />} value={formatCount(place.likes)} label={t("likes")} />
          <EngagementInline icon={<CommentIcon />} value={formatCount(place.comments)} label={t("comments")} />
          <EngagementInline icon={<EyeIcon />} value={formatCount(place.views)} label={t("views")} />
        </div>
      </section>

      {/* Clips — filmstrip compacto */}
      <section className="px-5 sm:px-7 lg:px-8 py-5 lg:pb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-fp-muted text-[0.65rem] font-bold uppercase tracking-widest">{t("clips")}</p>
          <span className="text-fp-muted text-[0.65rem] tabular-nums">{place.thumbnails.length} clips</span>
        </div>

        {/* Filmstrip: fila horizontal compacta */}
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none -mx-1 px-1">
          {place.thumbnails.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onOpenClip(i)}
              className="group relative h-20 w-14 shrink-0 rounded-lg overflow-hidden border border-fp-border hover:border-fp-coral/60 transition-colors snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fp-coral"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="56px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-fp-dark/70 to-transparent" />
              {/* Icono play — aparece siempre, pequeño */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center group-hover:bg-fp-coral/90 transition-colors">
                  <PlayIcon />
                </span>
              </span>
              {/* Fecha debajo */}
              <span className="absolute bottom-1 inset-x-0 text-center text-[0.45rem] text-fp-cream/80 font-semibold leading-none px-0.5">
                {clipDate(i, locale)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ubicación móvil + links Maps/Waze */}
      <section className="lg:hidden px-5 sm:px-7 py-4">
        <div className="flex items-center gap-2 text-fp-muted text-xs mb-3">
          <MapPinIcon />
          <span>{place.location}</span>
        </div>
        <div className="flex gap-2">
          <OpenInMapButton
            label={t("openInMaps")}
            href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
            icon={<GoogleMapsIcon />}
          />
          <OpenInMapButton
            label={t("openInWaze")}
            href={`https://waze.com/ul?ll=${place.lat},${place.lng}&navigate=yes`}
            icon={<WazeIcon />}
          />
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Lightbox                                           */
/* ─────────────────────────────────────────────────── */
function ClipLightbox({
  thumbnails, placeName, activeIndex, onClose, onChange,
}: {
  thumbnails: string[];
  placeName: string;
  activeIndex: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const t = useTranslations("place");
  const locale = useLocale();
  const total = thumbnails.length;

  const prev = useCallback(() => onChange((activeIndex - 1 + total) % total), [activeIndex, total, onChange]);
  const next = useCallback(() => onChange((activeIndex + 1) % total), [activeIndex, total, onChange]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const src = thumbnails[activeIndex];
  const date = clipDate(activeIndex, locale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-fp-gray-900/92 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 flex flex-col w-full max-w-2xl max-h-[90dvh] mx-4 rounded-2xl overflow-hidden bg-fp-dim border border-fp-border shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-fp-border shrink-0">
          <div className="min-w-0">
            <p className="text-fp-cream text-sm font-semibold leading-tight truncate">{placeName}</p>
            <p className="text-fp-muted text-[0.65rem] mt-0.5">{date}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="text-fp-muted text-[0.65rem] tabular-nums font-semibold">
              {t("clipOf", { n: activeIndex + 1, total })}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full fp-btn-secondary flex items-center justify-center hover:text-fp-coral transition-colors"
              aria-label={t("close")}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative flex-1 min-h-0 bg-black" style={{ minHeight: "320px" }}>
          <Image
            key={src}
            src={hqSrc(src)}
            alt={`${placeName} clip ${activeIndex + 1}`}
            fill
            className="object-contain"
            sizes="(min-width: 768px) 672px, 100vw"
            priority
          />
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-fp-border shrink-0">
          <div className="flex items-center gap-1.5">
            {thumbnails.map((_, i) => (
              <button
                key={i}
                onClick={() => onChange(i)}
                className={`rounded-full transition-all duration-200 ${i === activeIndex ? "w-4 h-2 bg-fp-coral" : "w-2 h-2 bg-fp-border hover:bg-fp-muted"}`}
                aria-label={`Clip ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={total <= 1} className="w-9 h-9 rounded-full fp-btn-secondary flex items-center justify-center hover:text-fp-coral disabled:opacity-30 transition-colors" aria-label={t("previous")}>
              <ChevronLeftIcon />
            </button>
            <button onClick={next} disabled={total <= 1} className="w-9 h-9 rounded-full fp-btn-secondary flex items-center justify-center hover:text-fp-coral disabled:opacity-30 transition-colors" aria-label={t("next")}>
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Open in map button                                 */
/* ─────────────────────────────────────────────────── */
function OpenInMapButton({ label, href, icon }: { label: string; href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-fp-border bg-fp-surface text-fp-cream text-[0.72rem] font-medium hover:border-fp-coral/50 hover:text-fp-coral transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Sub-components                                     */
/* ─────────────────────────────────────────────────── */
function StatInline({ label, value, suffix, valueClass = "text-fp-cream" }: { label: string; value: string; suffix?: string; valueClass?: string }) {
  return (
    <div className="px-4 first:pl-0 sm:px-5 sm:first:pl-0">
      <p className="text-fp-muted text-[0.58rem] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-base sm:text-lg font-semibold leading-none ${valueClass}`}>
        {value}
        {suffix && <span className="text-fp-muted font-normal text-[0.7rem] ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

function EngagementInline({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-fp-coral/80 shrink-0">{icon}</span>
      <div>
        <p className="text-fp-cream text-sm font-semibold tabular-nums leading-none">{value}</p>
        <p className="text-fp-muted text-[0.6rem] font-semibold uppercase tracking-widest mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Icons                                              */
/* ─────────────────────────────────────────────────── */
function BackIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
}
function MapPinIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function HeartIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg>;
}
function CommentIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
function EyeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function PlayIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
}
function CloseIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>;
}
function ChevronLeftIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>;
}
function ChevronRightIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>;
}
function GoogleMapsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function WazeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="10" r="7" />
      <path d="M8 10h.01M16 10h.01" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9.5 13.5c.8.8 3.2.8 4 0" />
      <path d="M12 17v4" />
    </svg>
  );
}
