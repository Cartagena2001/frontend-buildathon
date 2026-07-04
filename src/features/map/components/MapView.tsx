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
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import "leaflet/dist/leaflet.css";

const EL_SALVADOR_CENTER: [number, number] = [13.6929, -89.2182];

const markerIcon = L.divIcon({
  className: "",
  html: `<span style="
    display:block;
    width:14px;
    height:14px;
    border-radius:9999px;
    background:#00B39F;
    border:2px solid #FFF6EE;
    box-shadow:0 0 0 4px rgba(0,179,159,0.25);
  "></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

const selectedMarkerIcon = L.divIcon({
  className: "",
  html: `<span style="
    display:block;
    width:18px;
    height:18px;
    border-radius:9999px;
    background:#FF5A5F;
    border:2px solid #FFF6EE;
    box-shadow:0 0 0 6px rgba(255,90,95,0.3);
  "></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

function MapResize() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();

    const timer = window.setTimeout(invalidate, 0);
    window.addEventListener("resize", invalidate);

    const container = map.getContainer();
    const observer = new ResizeObserver(invalidate);
    observer.observe(container.parentElement ?? container);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", invalidate);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

function FitBounds({ places }: { places: PlaceCardData[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) {
      map.setView(EL_SALVADOR_CENTER, 8);
      return;
    }

    if (places.length === 1) {
      const place = places[0];
      map.setView([place.lat, place.lng], 13);
      return;
    }

    const bounds = L.latLngBounds(
      places.map((place) => [place.lat, place.lng]),
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }, [map, places]);

  return null;
}

interface MapViewProps {
  places: PlaceCardData[];
  selectedId?: string | null;
  onSelectPlace?: (id: string) => void;
}

export default function MapView({
  places,
  selectedId,
  onSelectPlace,
}: MapViewProps) {
  return (
    <div className="h-full w-full min-h-[inherit]">
      <MapContainer
        center={EL_SALVADOR_CENTER}
        zoom={8}
        className="h-full w-full"
        scrollWheelZoom
      >
        <MapResize />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds places={places} />
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={selectedId === place.id ? selectedMarkerIcon : markerIcon}
          eventHandlers={{
            click: () => onSelectPlace?.(place.id),
          }}
          opacity={selectedId && selectedId !== place.id ? 0.55 : 1}
        >
          <Popup>
            <div className="text-sm text-fp-dark">
              <p className="font-semibold">{place.name}</p>
              <p className="text-gray-600">{place.location}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      </MapContainer>
    </div>
  );
}
