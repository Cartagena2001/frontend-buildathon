import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import PlaceListCard from "@/features/places/components/PlaceListCard";
import ExploreLayout from "@/features/search/components/ExploreLayout";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavAuth from "@/components/ui/NavAuth";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { getSavedPlaceIds } from "@/lib/saved/actions";

const PLACES: PlaceCardData[] = [
  {
    rank: 1, id: "el-tunco",
    name: "El Tunco Surf Hub",
    location: "La Libertad, El Salvador",
    categories: ["Beach", "Nightlife"],
    description: "The definitive ground zero for Salvadoran surf culture. Currently peaking on TikTok for the new boardwalk nightlife and sunset drum circles.",
    viralScore: "1.2M", sentiment: "high", sentimentLabel: "High Vibe",
    badge: "Explosive", badgeColor: "red",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&q=60",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=80&q=60",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=80&q=60",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=80&q=60",
    ],
  },
  {
    rank: 2, id: "nawi-beach",
    name: "Nawi Beach House",
    location: "Mizata, La Libertad",
    categories: ["Beach Club", "Stay"],
    description: "The boutique hideaway that blew up on Instagram for its infinity pool overlooking the Pacific. A word-of-mouth favourite now going completely mainstream.",
    viralScore: "740K", sentiment: "high", sentimentLabel: "High Vibe",
    badge: "Steady Rise", badgeColor: "rose",
    coverImage: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=80&q=60",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&q=60",
    ],
  },
  {
    rank: 3, id: "el-zonte",
    name: "El Zonte Bitcoin Beach",
    location: "La Libertad, El Salvador",
    categories: ["Beach", "Culture"],
    description: "The original Bitcoin Beach. Trending hard on Instagram for bohemian vibe, surf lessons, and legendary fish tacos at sunset.",
    viralScore: "890K", sentiment: "high", sentimentLabel: "High Vibe",
    badge: "Trending", badgeColor: "cyan",
    coverImage: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=80&q=60",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&q=60",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=80&q=60",
    ],
  },
  {
    rank: 4, id: "el-sunzal",
    name: "El Sunzal Point Break",
    location: "La Libertad, El Salvador",
    categories: ["Beach", "Surf"],
    description: "World-class right-hand point break. Viral for drone footage catching perfect sets at dawn. A pilgrimage spot for serious surfers.",
    viralScore: "670K", sentiment: "high", sentimentLabel: "High Vibe",
    badge: "Rising", badgeColor: "rose",
    coverImage: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=80&q=60",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&q=60",
    ],
  },
  {
    rank: 5, id: "costa-del-sol",
    name: "Costa del Sol",
    location: "La Paz, El Salvador",
    categories: ["Beach", "Family"],
    description: "El Salvador's most beloved weekend escape. Trending for cabana culture, fresh ceviche and those impossible Pacific sunsets.",
    viralScore: "510K", sentiment: "medium", sentimentLabel: "Good Vibes",
    badge: "Popular", badgeColor: "cyan",
    coverImage: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=80&q=60",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=80&q=60",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&q=60",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=80&q=60",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&q=60",
    ],
  },
];

export default async function ExplorePage() {
  const [t, savedIds] = await Promise.all([
    getTranslations("explore"),
    getSavedPlaceIds(),
  ]);

  return (
    <div className="flex flex-col h-screen bg-fp-dark overflow-hidden">
      {/* ── Top nav ──────────────────────────────────────── */}
      <nav className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-fp-border bg-fp-dark z-30 overflow-visible">
        <Link
          href="/"
          className="text-fp-cream font-sans text-[1rem] font-light tracking-wide shrink-0"
        >
          findy<span className="text-fp-cyan">.</span>place
        </Link>

        <div className="flex-1 min-w-0 max-w-xl">
          <ExploreSearchBar />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <LocaleSwitcher />
          <NavAuth />
        </div>
      </nav>

      {/* ── Results header (inside scroll area frame) ─── */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-fp-border">
        <div>
          <h1 className="font-display text-fp-cream text-xl sm:text-2xl leading-tight">
            {t("title")}
          </h1>
          <p className="text-fp-muted text-xs mt-0.5 hidden sm:block">
            {t("subtitle", { count: "24", clips: "1,420" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-fp-muted text-xs hidden sm:block">{t("sortedBy")}</span>
          <SortDropdown />
        </div>
      </div>

      {/* ── 3-col layout ─────────────────────────────── */}
      <ExploreLayout places={PLACES}>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {PLACES.map((place) => (
            <PlaceListCard key={place.id} place={place} isSaved={savedIds.includes(place.id)} />
          ))}
        </div>
      </ExploreLayout>
    </div>
  );
}

function ExploreSearchBar() {
  return (
    <div className="flex items-center fp-search-bar rounded-full px-4 py-2 gap-2">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fp-muted shrink-0">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder="Search places…"
        className="flex-1 min-w-0 bg-transparent text-fp-cream placeholder:text-fp-muted text-sm outline-none"
      />
    </div>
  );
}

function SortDropdown() {
  return (
    <div className="flex items-center gap-1.5 border border-fp-border rounded-full px-3 py-1.5 cursor-pointer hover:border-fp-rose/40 transition-colors">
      <span className="text-fp-cream text-xs font-medium whitespace-nowrap">Viral Momentum</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-fp-muted shrink-0">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
