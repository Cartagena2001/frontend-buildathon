"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Place } from "@/features/places/types";
import "leaflet/dist/leaflet.css";

const EL_SALVADOR_CENTER: [number, number] = [13.6929, -89.2182];

const markerIcon = L.divIcon({
  className: "",
  html: `<span style="
    display:block;
    width:14px;
    height:14px;
    border-radius:9999px;
    background:#fe2858;
    border:2px solid #f0e8ec;
    box-shadow:0 0 0 4px rgba(254,40,88,0.25);
  "></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) {
      map.setView(EL_SALVADOR_CENTER, 8);
      return;
    }

    if (places.length === 1) {
      const place = places[0];
      map.setView([place.location.lat, place.location.lng], 13);
      return;
    }

    const bounds = L.latLngBounds(
      places.map((place) => [place.location.lat, place.location.lng]),
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }, [map, places]);

  return null;
}

interface MapViewProps {
  places: Place[];
  selectedId?: string | null;
  onSelectPlace?: (id: string) => void;
}

export default function MapView({
  places,
  selectedId,
  onSelectPlace,
}: MapViewProps) {
  return (
    <MapContainer
      center={EL_SALVADOR_CENTER}
      zoom={8}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds places={places} />
      {places.map((place) => (
        <Marker
          key={place.id_place}
          position={[place.location.lat, place.location.lng]}
          icon={markerIcon}
          eventHandlers={{
            click: () => onSelectPlace?.(place.id_place),
          }}
          opacity={selectedId && selectedId !== place.id_place ? 0.55 : 1}
        >
          <Popup>
            <div className="text-sm text-fp-dark">
              <p className="font-semibold">{place.name}</p>
              <p className="text-gray-600">{place.location.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
