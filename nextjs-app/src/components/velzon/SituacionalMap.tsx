"use client";

import React, { useEffect, useRef, useState } from "react";
import { getStateConfig, MunicipioItem } from "@/lib/stateConfig";
import api from "@/lib/api";

interface SituacionalMapProps {
  onSelectMunicipio?: (nombre: string) => void;
  height?: string;
  selectedMunicipio?: string | null;
  showLegend?: boolean;
}

interface AlertData {
  nombre: string;
  clave: string;
  region: string;
  level: "critica" | "preventiva" | "informativa" | "calma";
  levelLabel: string;
  color: string;
  borderColor: string;
  eventCount: number;
  topAlertTitle: string;
  topAlertTime?: string;
}

function cleanString(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

export default function SituacionalMap({
  onSelectMunicipio,
  height = "470px",
  selectedMunicipio,
  showLegend = true,
}: SituacionalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const [stats, setStats] = useState({ criticas: 0, preventivas: 0, calma: 0, total: 46 });

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const stateCfg = getStateConfig();

    // Inyectar CSS de Leaflet si no existe
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inyectar estilos para el tooltip ejecutivo
    if (!document.getElementById("sentinel-map-style")) {
      const style = document.createElement("style");
      style.id = "sentinel-map-style";
      style.innerHTML = `
        .sentinel-map-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .sentinel-map-tooltip::before {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    let isMounted = true;

    // Cargar dependencias y datos en paralelo
    Promise.all([
      import("leaflet"),
      fetch("/data/gto_municipios.geojson")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      api
        .get("/events/live?hours=36&limit=100")
        .then((r) => r.data)
        .catch(() => []),
    ]).then(([leafletMod, geojsonData, liveEvents]) => {
      if (!isMounted || !mapRef.current) return;

      const L = (leafletMod as any).default || leafletMod;

      // 1. Construir índice de alertas por municipio
      const alertsByMun: Record<string, AlertData> = {};
      let criticasCount = 0;
      let preventivasCount = 0;
      let calmaCount = 0;

      stateCfg.municipios.forEach((m: MunicipioItem) => {
        const key = cleanString(m.nombre);
        // Filtrar eventos de las últimas 36h de este municipio
        const mEvents = Array.isArray(liveEvents)
          ? liveEvents.filter(
              (ev: any) =>
                ev.municipio &&
                (cleanString(ev.municipio) === key ||
                  cleanString(ev.municipio).includes(key) ||
                  key.includes(cleanString(ev.municipio)))
            )
          : [];

        const hasCritical =
          mEvents.some((e: any) => e.severity === "CRITICAL" || e.severity === "HIGH") ||
          m.actividad_nivel === "alto";

        const hasWarning =
          mEvents.some((e: any) => e.severity === "MEDIUM") ||
          m.actividad_nivel === "medio";

        let level: "critica" | "preventiva" | "informativa" | "calma" = "calma";
        let levelLabel = "Sin Alertas Activas";
        // Municipio sin alertas: gris más oscuro que el fondo claro del mapa (solicitud explícita)
        let color = "#475569";
        let borderColor = "#334155";
        let topAlertTitle = "Sin incidentes ni eventos de riesgo reportados en las últimas 36 horas.";

        if (hasCritical) {
          level = "critica";
          levelLabel = "Alerta Prioritaria";
          color = "#ef4444";
          borderColor = "#991b1b";
          criticasCount++;
          topAlertTitle =
            mEvents[0]?.title ||
            `Operativo especial de paz y patrullaje reforzado en ${m.nombre}.`;
        } else if (hasWarning) {
          level = "preventiva";
          levelLabel = "Vigilancia Activa";
          color = "#f59e0b";
          borderColor = "#b45309";
          preventivasCount++;
          topAlertTitle =
            mEvents[0]?.title ||
            `Monitoreo preventivo continuo y supervisión vial en ${m.nombre}.`;
        } else if (mEvents.length > 0) {
          level = "informativa";
          levelLabel = "Actividad Ordinaria";
          color = "#3b82f6";
          borderColor = "#1d4ed8";
          preventivasCount++;
          topAlertTitle = mEvents[0]?.title || `Reporte institucional en ${m.nombre}.`;
        } else {
          calmaCount++;
        }

        alertsByMun[key] = {
          nombre: m.nombre,
          clave: m.clave,
          region: m.region,
          level,
          levelLabel,
          color,
          borderColor,
          eventCount: Math.max(mEvents.length, m.eventos_24h || 0),
          topAlertTitle,
        };
      });

      setStats({
        criticas: criticasCount,
        preventivas: preventivasCount,
        calma: calmaCount,
        total: stateCfg.municipios.length,
      });

      // 2. Inicializar o reutilizar Leaflet Map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center: stateCfg.center,
        zoom: stateCfg.zoom,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      L.control.zoom({ position: "topright" }).addTo(map);

      // Capa base ArcGIS Canvas Light Gray Base (Sin API Key, mapa claro)
      L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
        }
      ).addTo(map);

      // 3. Renderizar Polígonos GeoJSON con Delineamiento y Coloreado
      if (geojsonData && geojsonData.features) {
        const getStyle = (feature: any) => {
          const rawName = feature.properties?.nombre || "";
          const key = cleanString(rawName);
          const alert = alertsByMun[key] || {
            color: "#475569",
            borderColor: "#334155",
            level: "calma",
          };

          const isSelected =
            selectedMunicipio &&
            cleanString(selectedMunicipio) === key;

          return {
            fillColor: alert.color,
            weight: isSelected ? 3.5 : 1.5,
            opacity: 1,
            color: isSelected ? "#ffffff" : alert.borderColor,
            // Los municipios sin alerta tienen opacidad equilibrada de 0.65 para verse claramente delineados en gris oscuro
            fillOpacity: alert.level === "calma" ? 0.65 : 0.85,
          };
        };

        const geojsonLayer = L.geoJSON(geojsonData, {
          style: getStyle,
          onEachFeature: (feature: any, layer: any) => {
            const rawName = feature.properties?.nombre || "";
            const key = cleanString(rawName);
            const alert = alertsByMun[key] || {
              nombre: rawName,
              clave: String(feature.properties?.municipio || ""),
              region: "Estado de Guanajuato",
              level: "calma",
              levelLabel: "Sin Alertas Activas",
              color: "#475569",
              eventCount: 0,
              topAlertTitle: "Sin incidentes reportados en las últimas 36 horas.",
            };

            const badgeBg =
              alert.level === "critica"
                ? "#dc2626"
                : alert.level === "preventiva"
                ? "#d97706"
                : alert.level === "informativa"
                ? "#2563eb"
                : "#334155";

            // Tooltip interactivo HUD Ejecutivo al hacer Hover
            const tooltipHtml = `
              <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 250px; max-width: 320px; background: rgba(15, 23, 42, 0.96); color: #f8fafc; border-radius: 8px; padding: 10px 12px; box-shadow: 0 12px 28px rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.18);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">
                  <strong style="font-size: 14px; font-weight: 800; color: #ffffff;">${alert.nombre}</strong>
                  <span style="font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; background: ${badgeBg}; color: #ffffff; text-transform: uppercase;">${alert.levelLabel}</span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
                  <span>${alert.region}</span> &middot; <span>Clave ${alert.clave}</span>
                </div>
                <div style="background: rgba(255,255,255,0.06); border-radius: 6px; padding: 7px; margin-bottom: 6px; border-left: 3px solid ${alert.color};">
                  <span style="color: #38bdf8; font-size: 10px; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 2px;">Alerta Más Importante (36h):</span>
                  <div style="font-size: 12px; font-weight: 600; color: #f1f5f9; line-height: 1.35;">
                    ${alert.topAlertTitle}
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #cbd5e1; padding-top: 2px;">
                  <span>Eventos procesados: <strong style="color: #ffffff;">${alert.eventCount}</strong></span>
                  <span style="color: #60a5fa; font-weight: 700; font-size: 10px;">Clic para inspeccionar &rarr;</span>
                </div>
              </div>
            `;

            layer.bindTooltip(tooltipHtml, {
              sticky: true,
              direction: "top",
              className: "sentinel-map-tooltip",
              opacity: 1,
            });

            layer.on({
              mouseover: (e: any) => {
                const target = e.target;
                target.setStyle({
                  weight: 3.5,
                  color: "#ffffff",
                  fillOpacity: 0.95,
                });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  target.bringToFront();
                }
              },
              mouseout: (e: any) => {
                geojsonLayer.resetStyle(e.target);
              },
              click: () => {
                if (onSelectMunicipio) {
                  onSelectMunicipio(alert.nombre);
                }
              },
            });
          },
        }).addTo(map);

        geojsonLayerRef.current = geojsonLayer;

        try {
          if (geojsonLayer.getBounds && geojsonLayer.getBounds().isValid()) {
            map.fitBounds(geojsonLayer.getBounds(), { padding: [12, 12] });
          }
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onSelectMunicipio, selectedMunicipio]);

  return (
    <div className="position-relative w-100 bg-white" style={{ height, minHeight: height }}>
      {/* Contenedor del Mapa Leaflet */}
      <div
        ref={mapRef}
        className="w-100 h-100 bg-white"
        style={{ width: "100%", height: "100%", zIndex: 1 }}
      />

      {/* Leyenda Flotante Ejecutiva */}
      {showLegend && (
        <div
          className="position-absolute bottom-0 start-0 m-3 p-2 px-3 rounded-3 shadow-lg"
          style={{
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.15)",
            fontSize: "11px",
            color: "#f8fafc",
            maxWidth: "340px",
          }}
        >
          <div className="fw-bold mb-1 fs-11 text-uppercase text-light d-flex justify-content-between align-items-center">
            <span>Semáforo Territorial (46 Municipios)</span>
            <span className="badge bg-secondary text-white ms-2" style={{ fontSize: "9px" }}>
              36 Horas
            </span>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center pt-1">
            <span className="d-flex align-items-center gap-1">
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  backgroundColor: "#ef4444",
                }}
              />
              <span className="fw-semibold">Prioritaria ({stats.criticas})</span>
            </span>
            <span className="d-flex align-items-center gap-1">
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  backgroundColor: "#f59e0b",
                }}
              />
              <span className="fw-semibold">Vigilancia ({stats.preventivas})</span>
            </span>
            <span className="d-flex align-items-center gap-1">
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  backgroundColor: "#475569",
                  border: "1px solid #334155",
                }}
              />
              <span className="fw-semibold text-white">Sin Alerta ({stats.calma})</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
