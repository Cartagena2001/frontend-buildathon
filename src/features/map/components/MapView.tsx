"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { FONT_DISPLAY, FONT_SANS } from "@/lib/typography";
import "leaflet/dist/leaflet.css";

const EL_SALVADOR_CENTER: L.LatLngTuple = [13.6929, -89.2182];

function createIcon(selected: boolean) {
  const size = selected ? 18 : 14;
  const html = selected
    ? `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#FF5A5F;border:2px solid #FFF6EE;box-shadow:0 0 0 6px rgba(255,90,95,0.3);"></span>`
    : `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#00B39F;border:2px solid #FFF6EE;box-shadow:0 0 0 4px rgba(0,179,159,0.25);"></span>`;

  return L.divIcon({
    className: "",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, selected ? -12 : -10],
  });
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: EL_SALVADOR_CENTER,
      zoom: 8,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };

    requestAnimationFrame(invalidate);
    const t1 = window.setTimeout(invalidate, 100);
    const t2 = window.setTimeout(invalidate, 400);

    const observer = new ResizeObserver(invalidate);
    observer.observe(container);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    places.forEach((place) => {
      const selected = selectedId === place.id;
      const marker = L.marker([place.lat, place.lng], {
        icon: createIcon(selected),
        opacity: selectedId && !selected ? 0.55 : 1,
      });

      marker.bindPopup(
        `<div style="font-family:${FONT_SANS};font-size:14px;color:#1a1a1a">
          <p style="font-family:${FONT_DISPLAY};font-weight:600;margin:0">${place.name}</p>
          <p style="color:#666;margin:4px 0 0">${place.location}</p>
        </div>`,
      );

      marker.on("click", () => onSelectPlace?.(place.id));
      marker.addTo(layer);
    });

    if (places.length === 0) {
      map.setView(EL_SALVADOR_CENTER, 8);
    } else if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(places.map((place) => [place.lat, place.lng]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
    }

    window.setTimeout(() => map.invalidateSize({ animate: false }), 0);
  }, [places, selectedId, onSelectPlace]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full z-0"
      aria-label="Map"
    />
  );
}
