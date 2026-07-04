"use client";

import { useTranslations } from "next-intl";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";

interface Props {
  places: PlaceCardData[];
  clusterLabel?: string;
}

// Approximate positions within El Salvador for demo pins
const DEMO_POSITIONS: Record<string, { top: string; left: string }> = {
  "el-tunco":          { top: "38%", left: "28%" },
  "el-zonte":          { top: "44%", left: "26%" },
  "el-sunzal":         { top: "36%", left: "30%" },
  "costa-del-sol":     { top: "62%", left: "42%" },
  "pupuseria-la-palma":{ top: "28%", left: "52%" },
  "restaurante-atunero":{ top: "40%", left: "24%" },
  "cafe-escalon":      { top: "26%", left: "55%" },
  "olocuilta-market":  { top: "55%", left: "46%" },
};

export default function MapPanel({ places, clusterLabel = "La Libertad Cluster" }: Props) {
  const t = useTranslations("explore");

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "var(--map-bg)" }}>
      {/* Current view label */}
      <div className="absolute top-4 right-4 z-10 fp-tooltip rounded-xl px-3 py-2 backdrop-blur-sm">
        <p className="text-fp-muted text-[0.6rem] font-bold uppercase tracking-widest mb-0.5">
          {t("currentView")}
        </p>
        <p className="text-fp-cream text-xs font-medium">{clusterLabel}</p>
      </div>

      {/* Stylised SVG map of El Salvador */}
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full opacity-30"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#397684" />
            <stop offset="100%" stopColor="#0e1a1f" />
          </linearGradient>
        </defs>
        {/* Rough outline of El Salvador */}
        <path
          d="M60,80 C80,60 140,55 200,58 C260,61 320,70 360,90
             C370,110 365,140 355,160 C340,185 310,200 270,210
             C230,220 180,215 140,205 C100,195 70,175 55,150
             C40,125 45,98 60,80 Z"
          fill="url(#landGrad)"
          stroke="#397684"
          strokeWidth="1.5"
        />
        {/* Coast highlight */}
        <path
          d="M55,150 C70,175 100,195 140,205 C180,215 230,220 270,210 C310,200 340,185 355,160"
          fill="none"
          stroke="#2af0ea"
          strokeWidth="0.8"
          strokeDasharray="4 3"
          opacity="0.5"
        />
      </svg>

      {/* Pin markers */}
      {places.map((place, i) => {
        const pos = DEMO_POSITIONS[place.id];
        if (!pos) return null;
        return (
          <div
            key={place.id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ top: pos.top, left: pos.left }}
          >
            {/* Ping animation */}
            <span className="absolute inset-0 rounded-full bg-fp-cyan opacity-30 animate-ping" />
            <div className="relative w-8 h-8 rounded-full bg-fp-dark border-2 border-fp-cyan flex items-center justify-center shadow-lg shadow-fp-cyan/20">
              <span className="text-fp-cream text-[0.6rem] font-bold">{i + 1}</span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="fp-tooltip rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                <p className="text-fp-cream text-xs font-semibold">{place.name}</p>
                <p className="text-fp-muted text-[0.65rem]">{place.viralScore} hits</p>
              </div>
              <div className="w-2 h-2 bg-fp-dark border-b border-r border-fp-border rotate-45 mx-auto -mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
