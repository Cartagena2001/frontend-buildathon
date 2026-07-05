"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { FONT_DISPLAY, FONT_SANS } from "@/lib/typography";
import "leaflet/dist/leaflet.css";

const EL_SALVADOR_CENTER: L.LatLngTuple = [13.6929, -89.2182];

/* ── Pill label marker ── */
function createNameLabel(name: string, selected: boolean) {
  const bg     = selected ? "#FF5A5F" : "#222";
  const shadow = selected
    ? "0 3px 14px rgba(255,90,95,0.5)"
    : "0 2px 8px rgba(0,0,0,0.45)";
  const short  = name.length > 22 ? name.slice(0, 20) + "…" : name;

  return L.divIcon({
    className: "",
    html: `<span style="
      display:inline-block;
      background:${bg};
      color:#fff;
      font-family:${FONT_SANS};
      font-size:11px;
      font-weight:700;
      padding:4px 9px;
      border-radius:20px;
      white-space:nowrap;
      box-shadow:${shadow};
      cursor:pointer;
      user-select:none;
      transform:${selected ? "scale(1.1)" : "scale(1)"};
      transition:transform 0.15s,background 0.15s;
      border:${selected ? "2px solid #fff" : "1.5px solid rgba(255,255,255,0.15)"};
    ">${short}</span>`,
    iconSize:    [0, 0],
    iconAnchor:  [0, 20],
    popupAnchor: [0, -30],
  });
}

/* ── Rich popup with "Ver más" button ── */
function buildPopupHtml(place: PlaceCardData, locale: string) {
  const sentColor =
    place.sentiment === "high"   ? "#00B39F" :
    place.sentiment === "medium" ? "#FF5A5F" : "#FF8C42";

  const href = `/${locale}/explore/${place.id}`;

  return `
    <div style="font-family:${FONT_SANS};width:220px;border-radius:14px;overflow:hidden;background:#fff">
      <div style="position:relative;width:100%;height:120px;overflow:hidden">
        <img
          src="${place.coverImage}"
          alt="${place.name}"
          style="width:100%;height:100%;object-fit:cover;display:block"
          loading="lazy"
        />
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 55%)"></div>
      </div>
      <div style="padding:11px 13px 13px">
        <p style="font-family:${FONT_DISPLAY};margin:0 0 2px;font-weight:600;font-size:15px;color:#111;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${place.name}</p>
        <p style="margin:0 0 7px;font-size:11px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${place.location}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:12px;font-weight:700;color:#111">${place.viralScore} <span style="font-weight:400;color:#aaa;font-size:10px">viral</span></span>
          <span style="font-size:10px;font-weight:600;color:${sentColor}">${place.sentimentLabel}</span>
        </div>
        <a
          href="${href}"
          style="
            display:block;
            width:100%;
            padding:7px 0;
            background:#FF5A5F;
            color:#fff;
            text-align:center;
            font-size:11px;
            font-weight:700;
            border-radius:8px;
            text-decoration:none;
            letter-spacing:0.02em;
          "
        >Ver más información →</a>
      </div>
    </div>`;
}

interface MapViewProps {
  places:         PlaceCardData[];
  selectedId?:    string | null;
  locale?:        string;
  onSelectPlace?: (id: string) => void;
}

export default function MapView({
  places,
  selectedId,
  locale = "en",
  onSelectPlace,
}: MapViewProps) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const layerRef        = useRef<L.LayerGroup | null>(null);
  /* map placeId → marker so we can open the selected popup */
  const markerMapRef    = useRef<Map<string, L.Marker>>(new Map());

  /* ── Init map once ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: EL_SALVADOR_CENTER,
      zoom: 8,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    /* Carto Light — minimal, no street clutter */
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
      },
    ).addTo(map);

    layerRef.current  = L.layerGroup().addTo(map);
    mapRef.current    = map;

    const invalidate = () => map.invalidateSize({ animate: false });
    requestAnimationFrame(invalidate);
    const t1 = window.setTimeout(invalidate, 100);
    const t2 = window.setTimeout(invalidate, 400);
    const obs = new ResizeObserver(invalidate);
    obs.observe(container);
    const markerMap = markerMapRef.current;

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      obs.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markerMap.clear();
    };
  }, []);

  /* ── Rebuild markers when places list or locale changes ── */
  useEffect(() => {
    const map   = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    places.forEach((place) => {
      const selected = selectedId === place.id;

      const marker = L.marker([place.lat, place.lng], {
        icon:         createNameLabel(place.name, selected),
        opacity:      selectedId && !selected ? 0.6 : 1,
        zIndexOffset: selected ? 1000 : 0,
      });

      marker.bindPopup(buildPopupHtml(place, locale), {
        maxWidth:    240,
        className:   "fp-map-popup",
        closeButton: true,
        offset:      [60, 0],
        autoPan:     true,
      });

      marker.on("click", () => {
        onSelectPlace?.(place.id);
        marker.openPopup();
      });

      marker.addTo(layer);
      markerMapRef.current.set(place.id, marker);
    });

    if (places.length === 0) {
      map.setView(EL_SALVADOR_CENTER, 8);
    } else if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
    }

    window.setTimeout(() => map.invalidateSize({ animate: false }), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, locale]);

  /* ── Open popup for the selected marker whenever selectedId changes ── */
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markerMapRef.current.get(selectedId);
    if (!marker) return;

    /* Re-render icon as selected */
    markerMapRef.current.forEach((m, id) => {
      const place = places.find((p) => p.id === id);
      if (!place) return;
      m.setIcon(createNameLabel(place.name, id === selectedId));
      m.setOpacity(id === selectedId ? 1 : 0.6);
      (m.options as L.MarkerOptions).zIndexOffset = id === selectedId ? 1000 : 0;
    });

    marker.openPopup();
    mapRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.4 });
  }, [selectedId, places]);

  return (
    <>
      <style>{`
        .fp-map-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          border: none;
        }
        .fp-map-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1;
        }
        .fp-map-popup .leaflet-popup-tip-container {
          display: none;
        }
        .fp-map-popup .leaflet-popup-close-button {
          color: #666 !important;
          font-size: 16px !important;
          top: 6px !important;
          right: 8px !important;
          z-index: 10;
        }
        .fp-map-popup .leaflet-popup-close-button:hover {
          color: #FF5A5F !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full z-0"
        aria-label="Map"
      />
    </>
  );
}
