"use client";

import React, { useEffect, useRef } from "react";
import { getStateConfig } from "@/lib/stateConfig";

interface SituacionalMapProps {
  onSelectMunicipio?: (nombre: string) => void;
}

export default function SituacionalMap({ onSelectMunicipio }: SituacionalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const stateCfg = getStateConfig();

    // Inject Leaflet CSS dynamically if not present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Dynamically import Leaflet client-side only
    import("leaflet").then((L) => {
      if (mapInstanceRef.current) return;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map centered dynamically at current State capital/center
      const map = L.map(mapRef.current!, {
        center: stateCfg.center,
        zoom: stateCfg.zoom,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add CartoDB Voyager / Positron LIGHT tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Force map to fill parent container cleanly
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

      // Custom markers for State Municipalities
      const municipalities = stateCfg.municipios.slice(0, 5).map((m, idx) => ({
        name: m.nombre,
        lat: m.lat || (stateCfg.center[0] + (idx * 0.08 - 0.16)),
        lng: m.lng || (stateCfg.center[1] + (idx * 0.08 - 0.16)),
        events: m.eventos_24h,
        color: idx === 0 ? "#e63946" : idx === 1 ? "#d97706" : idx === 2 ? "#2563eb" : "#059669",
        status: `Estatus Operativo ${m.region}`,
      }));

      municipalities.forEach((m) => {
        const circle = L.circleMarker([m.lat, m.lng], {
          radius: 14 + m.events * 1.5,
          fillColor: m.color,
          color: "#ffffff",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(map);

        circle.on("click", () => {
          if (onSelectMunicipio) {
            onSelectMunicipio(m.name);
          }
        });

        circle.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px;">
            <strong style="font-size: 15px; color: #1e293b;">${m.name}</strong><br/>
            <span style="font-size: 12px; color: #475569;">Incidentes Activos: <strong>${m.events}</strong></span><br/>
            <small style="color: ${m.color}; font-weight: bold; display: block; margin-top: 4px;">${m.status}</small>
            <button id="btn-drill-${m.name.replace(/\s+/g, "")}" style="margin-top: 8px; width: 100%; border: none; background: #2563eb; color: white; border-radius: 4px; padding: 6px 10px; font-size: 11px; font-weight: bold; cursor: pointer;">
              Ver Detalle en Gabinete &darr;
            </button>
          </div>
        `);

        circle.on("popupopen", () => {
          const btn = document.getElementById(`btn-drill-${m.name.replace(/\s+/g, "")}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectMunicipio) {
                onSelectMunicipio(m.name);
              }
            };
          }
        });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onSelectMunicipio]);

  return (
    <div
      ref={mapRef}
      className="w-100 bg-white"
      style={{ height: "460px", minHeight: "460px", zIndex: 1 }}
    />
  );
}
