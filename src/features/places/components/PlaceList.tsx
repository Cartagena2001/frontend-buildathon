import PlaceCard from "@/features/places/components/PlaceCard";
import type { Place } from "@/features/places/types";

interface PlaceListProps {
  places: Place[];
  selectedId?: string | null;
  onSelectPlace?: (id: string) => void;
}

export default function PlaceList({
  places,
  selectedId,
  onSelectPlace,
}: PlaceListProps) {
  return (
    <div className="flex flex-col gap-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id_place}
          place={place}
          selected={selectedId === place.id_place}
          onSelect={onSelectPlace}
        />
      ))}
    </div>
  );
}
