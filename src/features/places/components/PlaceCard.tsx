import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface PlaceCardData {
  rank: number;
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  categories: string[];
  description: string;
  viralScore: string;
  sentiment: string;
  sentimentLabel: string;
  badge: string;
  badgeColor: "red" | "cyan" | "rose";
  coverImage: string;
  thumbnails: string[];
}

const badgeClasses: Record<PlaceCardData["badgeColor"], string> = {
  red:  "bg-fp-orange text-fp-on-accent",
  cyan: "bg-fp-teal text-fp-on-cyan",
  rose: "bg-fp-coral/20 text-fp-coral border border-fp-coral/40",
};

const sentimentClasses: Record<string, string> = {
  high:    "text-fp-teal",
  medium:  "text-fp-coral",
  low:     "text-fp-orange",
};

export default function PlaceCard({ place }: { place: PlaceCardData }) {
  return (
    <Link
      href={`/explore/${place.id}`}
      className="group block bg-fp-dim border border-fp-border rounded-2xl overflow-hidden hover:border-fp-coral/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={place.coverImage}
          alt={place.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        {/* Rank badge */}
        <span className="absolute top-3 left-3 w-8 h-8 rounded-full fp-badge-overlay flex items-center justify-center text-xs font-semibold tabular-nums">
          {String(place.rank).padStart(2, "0")}
        </span>
        {/* Trending badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${badgeClasses[place.badgeColor]}`}>
          {place.badge}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-display text-fp-cream text-lg leading-tight mb-1 group-hover:text-fp-coral transition-colors">
          {place.name}
        </h3>
        <p className="text-fp-muted text-xs mb-3">
          {place.location} · {place.categories.join(" · ")}
        </p>
        <p className="text-fp-muted text-xs leading-5 line-clamp-3 mb-4">
          {place.description}
        </p>

        {/* Stats row */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-fp-muted text-[0.6rem] font-semibold uppercase tracking-widest mb-0.5">
              Viral Score
            </p>
            <p className="text-fp-cream text-sm font-semibold">
              {place.viralScore}{" "}
              <span className="text-fp-muted font-normal text-xs">hits</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-fp-muted text-[0.6rem] font-semibold uppercase tracking-widest mb-0.5">
              Sentiment
            </p>
            <p className={`text-sm font-semibold ${sentimentClasses[place.sentiment]}`}>
              {place.sentimentLabel}
            </p>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex items-center gap-1.5">
          {place.thumbnails.slice(0, 3).map((src, i) => (
            <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <Image src={src} alt="" fill className="object-cover" sizes="40px" />
            </div>
          ))}
          {place.thumbnails.length > 3 && (
            <div className="w-10 h-10 rounded-lg bg-fp-surface border border-fp-border flex items-center justify-center shrink-0">
              <span className="text-fp-muted text-[0.65rem] font-semibold">
                +{place.thumbnails.length - 3}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
