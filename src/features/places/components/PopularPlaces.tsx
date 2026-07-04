import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PlaceCard, { type PlaceCardData } from "./PlaceCard";

// ── Mock data (replace with DB/vector query) ──────────────────────────────────
const BEACHES: PlaceCardData[] = [
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
    rank: 2, id: "el-zonte",
    name: "El Zonte Bitcoin Beach",
    location: "La Libertad, El Salvador",
    categories: ["Beach", "Culture"],
    description: "The original Bitcoin Beach. Trending hard on Instagram for its bohemian vibe, surf lessons, and legendary fish tacos at sunset.",
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
    rank: 3, id: "el-sunzal",
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
    rank: 4, id: "costa-del-sol",
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

const RESTAURANTS: PlaceCardData[] = [
  {
    rank: 1, id: "pupuseria-la-palma",
    name: "Pupusería La Palma",
    location: "San Salvador, El Salvador",
    categories: ["Food", "Traditional"],
    description: "Going viral for the curtido recipe that's been in the family for 60 years. TikTok creators can't stop posting the cheese-pull videos.",
    viralScore: "980K", sentiment: "high", sentimentLabel: "High Vibe",
    badge: "Explosive", badgeColor: "red",
    coverImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=60",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&q=60",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=60",
    ],
  },
  {
    rank: 2, id: "restaurante-atunero",
    name: "El Atunero",
    location: "La Libertad, El Salvador",
    categories: ["Seafood", "Casual"],
    description: "Fresh tuna straight off the boat. The TikTok of the grilled marlin platter has 4M views and counting.",
    viralScore: "760K", sentiment: "high", sentimentLabel: "High Vibe",
    badge: "Trending", badgeColor: "cyan",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=60",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=60",
    ],
  },
  {
    rank: 3, id: "cafe-escalon",
    name: "Café de los Sueños",
    location: "Escalón, San Salvador",
    categories: ["Café", "Brunch"],
    description: "The Salvadoran specialty coffee scene in one room. Trending for the aesthetics, pour-overs and the banana bread that sells out every morning.",
    viralScore: "430K", sentiment: "high", sentimentLabel: "High Vibe",
    badge: "Rising", badgeColor: "rose",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=60",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=60",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=60",
    ],
  },
  {
    rank: 4, id: "olocuilta-market",
    name: "Mercado de Olocuilta",
    location: "Olocuilta, La Paz",
    categories: ["Food", "Market"],
    description: "The undisputed pupusa capital. Queues form at 7am on weekends. Every foodie reel about El Salvador passes through here.",
    viralScore: "1.1M", sentiment: "high", sentimentLabel: "High Vibe",
    badge: "Iconic", badgeColor: "cyan",
    coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&q=60",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=60",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=60",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=60",
    ],
  },
];

interface CategorySection {
  key: string;
  label: string;
  places: PlaceCardData[];
}

const SECTIONS: CategorySection[] = [
  { key: "beaches", label: "🏄 Beaches", places: BEACHES },
  { key: "food", label: "🍽️ Food & Dining", places: RESTAURANTS },
];

export default function PopularPlaces() {
  const t = useTranslations("home.popular");

  return (
    <section className="bg-fp-dark px-4 sm:px-8 md:px-12 lg:px-20 py-14 sm:py-20">
      {/* Section header */}
      <div className="flex items-end justify-between mb-14">
        <div>
          <p className="text-fp-muted text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2">
            {t("eyebrow")}
          </p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] text-fp-cream leading-tight">
            {t("title")}
          </h2>
        </div>
        <Link
          href="/explore"
          className="hidden sm:inline-flex items-center gap-1.5 text-fp-cyan text-sm font-medium hover:underline"
        >
          {t("viewAll")} →
        </Link>
      </div>

      {/* Category sections */}
      <div className="space-y-16">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            <h3 className="text-fp-cream text-sm font-semibold uppercase tracking-widest mb-6 flex items-center gap-3">
              {section.label}
              <span className="flex-1 h-px bg-fp-border" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile view-all */}
      <div className="sm:hidden mt-10 text-center">
        <Link
          href="/explore"
          className="inline-flex px-6 py-3 rounded-full border border-fp-border text-fp-cream text-sm font-medium hover:bg-fp-surface transition-colors"
        >
          {t("viewAll")}
        </Link>
      </div>
    </section>
  );
}
