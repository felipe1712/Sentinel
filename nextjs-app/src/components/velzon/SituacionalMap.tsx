"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function SituacionalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Dynamically import Leaflet client-side
    import("leaflet").then((L) => {
      if (mapInstanceRef.current) return; // Prevent double init

      // Fix default marker icon issues in Webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map centered at Querétaro City
      const map = L.map(mapRef.current!, {
        center: [20.5888, -100.3899],
        zoom: 10,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add CartoDB Dark Matter tile layer (FREE - NO API KEY REQUIRED)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Custom circle markers for Querétaro Municipalities
      const municipalities = [
        {
          name: "Santiago de Querétaro",
          lat: 20.5888,
          lng: -100.3899,
          events: 12,
          color: "#f06548", // Red
          status: "Alerta Vial Paseo 5 de Febrero",
        },
        {
          name: "El Marqués",
          lat: 20.6720,
          lng: -100.2811,
          events: 7,
          color: "#f7b84b", // Warning
          status: "Monitoreo Hidrológico Preventivo",
        },
        {
          name: "Corregidora",
          lat: 20.5367,
          lng: -100.4439,
          events: 6,
          color: "#3577f1", // Info
          status: "Operativo de Seguridad ZMQ",
        },
        {
          name: "San Juan del Río",
          lat: 20.3872,
          lng: -99.9961,
          events: 3,
          color: "#0ab39c", // Success
          status: "Vigilancia Industrial & Carretera",
        },
      ];

      municipalities.forEach((m) => {
        const circle = L.circleMarker([m.lat, m.lng], {
          radius: 12 + m.events * 1.5,
          fillColor: m.color,
          color: "#ffffff",
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.7,
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
            <strong style="font-size: 14px; color: #212529;">${m.name}</strong><br/>
            <span style="font-size: 12px; color: #6c757d;">Incidentes Activos: <strong>${m.events}</strong></span><br/>
            <small style="color: ${m.color}; font-weight: bold;">${m.status}</small>
          </div>
        `);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-100 rounded-bottom"
      style={{ height: "350px", minHeight: "350px", zIndex: 1 }}
    />
  );
}
