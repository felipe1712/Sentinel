"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BaseLayerType, ChoroplethMode, ElectoralResult, GisEventItem } from "@/lib/electoralTypes";
import { getPartyColor, getParticipationColor, getMarginColor, getSwingColor } from "@/lib/gisColors";

interface WebGisMapProps {
  baseBoundary: BaseLayerType;
  choroplethMode: ChoroplethMode;
  selectedYear: number;
  selectedMunicipio: number | null;
  electoralCache: Record<string, Record<string, ElectoralResult>>;
  activeEventLayers: Record<string, boolean>;
  tileProvider: "osm" | "carto" | "satellite";
  onSelectSection: (sectionProps: any, result: ElectoralResult | null) => void;
  swingYears?: { year1: number; year2: number };
}

// Mapas base 100% abiertos y libres de costo (Sin necesidad de API Key)
const TILE_URLS = {
  osm: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  carto: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export const WebGisMap: React.FC<WebGisMapProps> = ({
  baseBoundary,
  choroplethMode,
  selectedYear,
  selectedMunicipio,
  electoralCache,
  activeEventLayers,
  tileProvider,
  onSelectSection,
  swingYears,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [geoData, setGeoData] = useState<any>(null);
  const [loadingGeo, setLoadingGeo] = useState(true);

  // 1. Inicializar Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centrado en el Estado de Guanajuato (Lat 21.0190, Lon -101.2574)
    const map = L.map(mapContainerRef.current, {
      center: [21.019, -101.2574],
      zoom: 9,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    const tileLayer = L.tileLayer(TILE_URLS[tileProvider], {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | SentinelIQ WebGIS',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Actualizar Tile Provider
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_URLS[tileProvider]);
  }, [tileProvider]);

  // 3. Cargar GeoJSON según la Capa Base Seleccionada
  useEffect(() => {
    setLoadingGeo(true);
    let filePath = "/data/gto_secciones.geojson";
    if (baseBoundary === "municipios") filePath = "/data/gto_municipios.geojson";
    if (baseBoundary === "distritos_locales") filePath = "/data/gto_distritos_locales.geojson";
    if (baseBoundary === "distritos_federales") filePath = "/data/gto_distritos_federales.geojson";

    fetch(filePath)
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
        setLoadingGeo(false);
      })
      .catch((err) => {
        console.error("Error cargando GeoJSON:", err);
        setLoadingGeo(false);
      });
  }, [baseBoundary]);

  // 4. Renderizar Polígonos, Filtro de Municipio y Auto-Zoom (fitBounds)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const yearData = electoralCache[String(selectedYear)] || {};

    const getFeatureStyle = (feature: any) => {
      const props = feature.properties || {};
      const seccionId = props.seccion || props.id;
      const mpioId = props.municipio;
      const res = yearData[String(seccionId)];

      // Si hay un municipio seleccionado y no coincide, atenuar o resaltar
      const isSelectedMpio = selectedMunicipio === null || mpioId === selectedMunicipio;

      let fillColor = "#cbd5e1";
      let fillOpacity = isSelectedMpio ? 0.7 : 0.15;
      let strokeColor = isSelectedMpio ? "#ffffff" : "#94a3b8";
      let weight = isSelectedMpio ? (baseBoundary === "secciones" ? 0.9 : 2) : 0.3;

      if (baseBoundary === "secciones" && res) {
        if (choroplethMode === "ganador") {
          fillColor = getPartyColor(res.ganador_partido);
        } else if (choroplethMode === "porcentaje_ganador") {
          fillColor = getPartyColor(res.ganador_partido);
          fillOpacity = isSelectedMpio ? Math.max(0.3, Math.min(0.9, res.ganador_pct / 100)) : 0.15;
        } else if (choroplethMode === "participacion") {
          fillColor = getParticipationColor(res.participacion_pct);
        } else if (choroplethMode === "margen_victoria") {
          fillColor = getMarginColor(res.margen_victoria_pct);
        } else if (choroplethMode === "swing" && swingYears) {
          const d1 = electoralCache[String(swingYears.year1)]?.[String(seccionId)];
          const d2 = electoralCache[String(swingYears.year2)]?.[String(seccionId)];
          if (d1 && d2) {
            const alternancia = d1.ganador_partido !== d2.ganador_partido;
            const swing = (d2.ganador_pct || 0) - (d1.ganador_pct || 0);
            fillColor = getSwingColor(alternancia, swing);
          }
        }
      } else if (baseBoundary === "municipios") {
        fillColor = isSelectedMpio ? "#2563eb" : "#94a3b8";
        fillOpacity = isSelectedMpio ? (selectedMunicipio ? 0.45 : 0.25) : 0.08;
        strokeColor = isSelectedMpio ? "#1d4ed8" : "#cbd5e1";
        weight = isSelectedMpio ? 2.5 : 1;
      }

      return {
        fillColor,
        weight,
        opacity: isSelectedMpio ? 1 : 0.4,
        color: strokeColor,
        fillOpacity,
      };
    };

    // Función de filtrado: si hay un municipio seleccionado, solo mostramos/enfocamos sus polígonos
    const geoLayer = L.geoJSON(geoData, {
      filter: (feature) => {
        if (!selectedMunicipio) return true;
        const mpioId = feature.properties?.municipio;
        return mpioId === selectedMunicipio;
      },
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const seccionId = props.seccion || props.id;
        const res = yearData[String(seccionId)];

        const tooltipContent = `
          <div style="font-family: sans-serif; min-width: 170px;">
            <strong style="font-size: 13px; color: #0f172a;">
              ${baseBoundary === "municipios" ? props.nombre || `Municipio ${props.municipio}` : `Sección Electoral ${seccionId}`}
            </strong>
            <br/>
            <span style="font-size: 11px; color: #64748b;">
              Municipio: ${props.municipio} · Dtto Local: ${props.distrito_l || "N/D"}
            </span>
            ${
              res
                ? `
                <hr style="margin: 4px 0; border: none; border-top: 1px solid #e2e8f0;"/>
                <span style="font-size: 12px; font-weight: bold; color: ${getPartyColor(res.ganador_partido)};">
                  🏆 Ganador ${selectedYear}: ${res.ganador_partido} (${res.ganador_pct}%)
                </span>
                <br/>
                <span style="font-size: 11px; color: #059669;">
                  🗳️ Participación: ${res.participacion_pct}% (${res.total_votos?.toLocaleString()} votos)
                </span>
              `
                : ""
            }
          </div>
        `;

        layer.bindTooltip(tooltipContent, { sticky: true, className: "custom-gis-tooltip" });

        layer.on({
          click: () => {
            onSelectSection(props, res || null);
          },
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 3, color: "#0f172a", fillOpacity: 0.9 });
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          },
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = geoLayer;

    // AUTO-ZOOM (fitBounds): Ajustar la vista automáticamente al municipio seleccionado
    if (selectedMunicipio && geoLayer.getLayers().length > 0) {
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13, animate: true });
      }
    } else if (!selectedMunicipio) {
      // Regresar al estado completo
      map.setView([21.019, -101.2574], 9, { animate: true });
    }
  }, [geoData, choroplethMode, selectedYear, baseBoundary, electoralCache, selectedMunicipio, swingYears]);

  return (
    <div className="position-relative w-100 h-100 rounded-3 overflow-hidden shadow-sm border border-gray-200">
      <div ref={mapContainerRef} className="w-100 h-100" style={{ minHeight: "580px", zIndex: 1 }}></div>

      {/* Indicador de Carga */}
      {loadingGeo && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75"
          style={{ zIndex: 1000 }}
        >
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <span className="fw-bold text-dark fs-13">Cargando Polígonos INE de Guanajuato...</span>
        </div>
      )}
    </div>
  );
};

export default WebGisMap;
