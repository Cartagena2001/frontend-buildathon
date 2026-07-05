"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import type { LatLngTuple, Map as LeafletMap, LayerGroup, Marker, MarkerOptions } from "leaflet";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { FONT_DISPLAY, FONT_SANS } from "@/lib/typography";
import "leaflet/dist/leaflet.css";

type LeafletApi = typeof Leaflet;

const EL_SALVADOR_CENTER: LatLngTuple = [13.6929, -89.2182];

function hasValidMapCoords(place: PlaceCardData): boolean {
  const { lat, lng } = place;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= 12.5 && lat <= 14.5 && lng >= -90.5 && lng <= -87.5;
}
const LOCATION_PIN_SRC = "/map/location-pin.webp";
const PIN_WIDTH = 48;
const PIN_HEIGHT = Math.round(PIN_WIDTH * (655 / 535));
const POPUP_GAP = 6;

function centerMapOnMarkerWithPopup(
  L: LeafletApi,
  map: LeafletMap,
  marker: Marker,
  animate = true,
) {
  const latLng = marker.getLatLng();
  const pinHeight = PIN_HEIGHT;

  const applyCenter = () => {
    const popupHeight = marker.getPopup()?.getElement()?.offsetHeight ?? 0;
    const offsetY = (pinHeight + POPUP_GAP + popupHeight) / 2;
    const size = map.getSize();
    const markerPoint = map.latLngToContainerPoint(latLng);
    const desiredMarkerPoint = L.point(size.x / 2, size.y / 2 + offsetY);
    const delta = markerPoint.subtract(desiredMarkerPoint);
    const newCenterPoint = L.point(size.x / 2, size.y / 2).add(delta);
    const newCenter = map.containerPointToLatLng(newCenterPoint);

    map.setView(newCenter, map.getZoom(), {
      animate,
      duration: animate ? 0.4 : 0,
    });
  };

  const popupEl = marker.getPopup()?.getElement();
  if (marker.isPopupOpen() && popupEl && popupEl.offsetHeight > 0) {
    requestAnimationFrame(applyCenter);
    return;
  }

  marker.once("popupopen", () => {
    requestAnimationFrame(applyCenter);
  });
}

function createLocationPinIcon(L: LeafletApi, selected: boolean) {
  const filter = selected
    ? "drop-shadow(0 3px 8px rgba(255,90,95,0.45))"
    : "grayscale(1) brightness(0.72) saturate(0.4)";

  return L.divIcon({
    className: "",
    html: `<img
      src="${LOCATION_PIN_SRC}"
      alt=""
      draggable="false"
      style="
        display:block;
        width:${PIN_WIDTH}px;
        height:${PIN_HEIGHT}px;
        cursor:pointer;
        user-select:none;
        pointer-events:auto;
        filter:${filter};
        transition:filter 0.15s ease;
      "
    />`,
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
    popupAnchor: [0, -PIN_HEIGHT - 6],
  });
}

function buildPopupHtml(place: PlaceCardData, locale: string) {
  const sentColor =
    place.sentiment === "high"
      ? "#00B39F"
      : place.sentiment === "medium"
        ? "#FF5A5F"
        : "#FF8C42";

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
  places: PlaceCardData[];
  selectedId?: string | null;
  locale?: string;
  showPopup?: boolean;
  onSelectPlace?: (id: string) => void;
}

export default function MapView({
  places,
  selectedId,
  locale = "en",
  showPopup = true,
  onSelectPlace,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markerMapRef = useRef(new Map<string, Marker>());
  const leafletRef = useRef<LeafletApi | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void import("leaflet").then((mod) => {
      if (cancelled) return;
      leafletRef.current = (mod.default ?? mod) as LeafletApi;
      setLeafletReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const container = containerRef.current;
    if (!leafletReady || !L || !container || mapRef.current) return;

    const map = L.map(container, {
      center: EL_SALVADOR_CENTER,
      zoom: 8,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
      },
    ).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

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
  }, [leafletReady]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    const mappablePlaces = places.filter(hasValidMapCoords);

    mappablePlaces.forEach((place) => {
      const selected = selectedId === place.id;

      const marker = L.marker([place.lat, place.lng], {
        icon: createLocationPinIcon(L, selected),
        zIndexOffset: selected ? 1000 : 0,
      });

      if (showPopup) {
        marker.bindPopup(buildPopupHtml(place, locale), {
          maxWidth: 240,
          className: "fp-map-popup",
          closeButton: true,
          autoPan: false,
        });
      }

      marker.on("click", () => {
        onSelectPlace?.(place.id);
        if (showPopup) marker.openPopup();
      });

      marker.addTo(layer);
      markerMapRef.current.set(place.id, marker);
    });

    const fitMapToPlaces = () => {
      if (mappablePlaces.length === 0) {
        map.setView(EL_SALVADOR_CENTER, 8);
      } else if (mappablePlaces.length === 1) {
        map.setView([mappablePlaces[0].lat, mappablePlaces[0].lng], 13);
      } else {
        const bounds = L.latLngBounds(
          mappablePlaces.map((p) => [p.lat, p.lng] as LatLngTuple),
        );
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
      }
    };

    fitMapToPlaces();
    requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
      fitMapToPlaces();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, locale, showPopup, leafletReady]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !selectedId || !mapRef.current) return;
    const marker = markerMapRef.current.get(selectedId);
    if (!marker) return;

    markerMapRef.current.forEach((m, id) => {
      m.setIcon(createLocationPinIcon(L, id === selectedId));
      (m.options as MarkerOptions).zIndexOffset = id === selectedId ? 1000 : 0;
    });

    if (showPopup) {
      marker.openPopup();
      centerMapOnMarkerWithPopup(L, mapRef.current, marker);
    } else {
      mapRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.4 });
    }
  }, [selectedId, places, showPopup, leafletReady]);

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
