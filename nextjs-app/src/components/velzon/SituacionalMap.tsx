"use client";

import React, { useEffect, useRef } from "react";

interface SituacionalMapProps {
  onSelectMunicipio?: (nombre: string) => void;
}

export default function SituacionalMap({ onSelectMunicipio }: SituacionalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

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

      // Initialize map centered at Santiago de Querétaro
      const map = L.map(mapRef.current!, {
        center: [20.5888, -100.3899],
        zoom: 10,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add CartoDB Voyager / Positron LIGHT tile layer (High Contrast, Ultra-Clear - FREE & NO API KEY REQUIRED)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Custom markers for Querétaro Municipalities (Bright, High-Contrast colors for Light Mode)
      const municipalities = [
        {
          name: "Santiago de Querétaro",
          lat: 20.5888,
          lng: -100.3899,
          events: 12,
          color: "#e63946", // Bright Red
          status: "Alerta Vial Paseo 5 de Febrero",
        },
        {
          name: "El Marqués",
          lat: 20.6720,
          lng: -100.2811,
          events: 7,
          color: "#d97706", // Amber
          status: "Monitoreo Hidrológico Preventivo",
        },
        {
          name: "Corregidora",
          lat: 20.5367,
          lng: -100.4439,
          events: 6,
          color: "#2563eb", // Vibrant Blue
          status: "Operativo de Seguridad ZMQ",
        },
        {
          name: "San Juan del Río",
          lat: 20.3872,
          lng: -99.9961,
          events: 3,
          color: "#059669", // Emerald Green
          status: "Vigilancia Industrial & Carretera",
        },
      ];

      municipalities.forEach((m) => {
        const circle = L.circleMarker([m.lat, m.lng], {
          radius: 14 + m.events * 1.5,
          fillColor: m.color,
          color: "#ffffff",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(map);

        // Click handler on circle marker to trigger drilldown
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
      className="w-100 rounded-bottom cursor-pointer shadow-inner"
      style={{ height: "380px", minHeight: "380px", zIndex: 1 }}
    />
  );
}
