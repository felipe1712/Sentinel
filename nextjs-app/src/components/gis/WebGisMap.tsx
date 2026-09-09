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
  electionType: "gubernatura" | "diputaciones";
  selectedMunicipio: number | null;
  electoralCache: any;
  activeEventLayers: Record<string, boolean>;
  tileProvider: "osm" | "carto" | "satellite";
  onSelectTileProvider?: (provider: "osm" | "carto" | "satellite") => void;
  onSelectSection: (sectionProps: any, result: ElectoralResult | null) => void;
  swingYears?: { year1: number; year2: number };
}

// Mapas base 100% abiertos y limpios (Sin marcas de agua de API Key)
const TILE_URLS = {
  osm: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  carto: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export const WebGisMap: React.FC<WebGisMapProps> = ({
  baseBoundary,
  choroplethMode,
  selectedYear,
  electionType = "gubernatura",
  selectedMunicipio,
  electoralCache,
  activeEventLayers,
  tileProvider,
  onSelectTileProvider,
  onSelectSection,
  swingYears,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [loadingGeo, setLoadingGeo] = useState<boolean>(true);
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{
    featureTitle: string;
    featureSubtitle: string;
    res: ElectoralResult | null;
  } | null>(null);

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

    const tileLayer = L.tileLayer(TILE_URLS[tileProvider] || TILE_URLS.carto, {
      attribution: '&copy; SentinelIQ Sovereign Intelligence WebGIS',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Actualizar Tile Provider
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_URLS[tileProvider] || TILE_URLS.carto);
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

  // 4. Helper para obtener el resultado electoral exacto según la capa activa
  const getElectoralResultForFeature = (props: any): any | null => {
    if (!electoralCache) return null;
    const yr = String(selectedYear);

    if (baseBoundary === "secciones") {
      const secId = String(props.seccion || props.id || "");
      return (
        electoralCache[electionType]?.[yr]?.[secId] ||
        electoralCache[yr]?.[secId] ||
        null
      );
    } else if (baseBoundary === "distritos_locales") {
      const dlId = String(props.distrito_l || props.id || "");
      return (
        electoralCache.distritos_locales?.[electionType]?.[yr]?.[dlId] ||
        null
      );
    } else if (baseBoundary === "distritos_federales") {
      const dfId = String(props.distrito_f || props.id || "");
      return (
        electoralCache.distritos_federales?.[electionType]?.[yr]?.[dfId] ||
        null
      );
    } else if (baseBoundary === "municipios") {
      const mpioId = String(props.municipio || props.id || "");
      return (
        electoralCache.municipios?.[electionType]?.[yr]?.[mpioId] ||
        null
      );
    }
    return null;
  };

  // 5. Renderizar Polígonos, Estilos y Tooltips
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const getFeatureStyle = (feature: any) => {
      const props = feature.properties || {};
      const res = getElectoralResultForFeature(props);
      const mpioId = props.municipio;

      // Si hay un municipio seleccionado y no coincide (para capas que tienen municipio)
      const isSelectedMpio = selectedMunicipio === null || mpioId === selectedMunicipio || !mpioId;

      let fillColor = "#cbd5e1";
      let fillOpacity = isSelectedMpio ? 0.82 : 0.25;
      let strokeColor = isSelectedMpio ? "#ffffff" : "#64748b";
      let weight = isSelectedMpio ? (baseBoundary === "secciones" ? 1.0 : 2.5) : 0.4;

      if (res) {
        if (choroplethMode === "ganador") {
          fillColor = getPartyColor(res.ganador_partido);
        } else if (choroplethMode === "porcentaje_ganador") {
          fillColor = getPartyColor(res.ganador_partido);
          fillOpacity = isSelectedMpio ? Math.max(0.45, Math.min(0.95, res.ganador_pct / 100)) : 0.20;
        } else if (choroplethMode === "participacion") {
          fillColor = getParticipationColor(res.participacion_pct);
        } else if (choroplethMode === "margen_victoria") {
          fillColor = getMarginColor(res.margen_victoria_pct);
        } else if (choroplethMode === "swing" && swingYears) {
          const secId = String(props.seccion || props.id || "");
          const d1 = electoralCache[electionType]?.[String(swingYears.year1)]?.[secId];
          const d2 = electoralCache[electionType]?.[String(swingYears.year2)]?.[secId];
          if (d1 && d2) {
            const alternancia = d1.ganador_partido !== d2.ganador_partido;
            const swing = (d2.ganador_pct || 0) - (d1.ganador_pct || 0);
            fillColor = getSwingColor(alternancia, swing);
          }
        }
      } else {
        fillColor = "#94a3b8";
        fillOpacity = 0.2;
      }

      return {
        fillColor,
        weight,
        opacity: isSelectedMpio ? 1 : 0.4,
        color: strokeColor,
        fillOpacity,
      };
    };

    const geoLayer = L.geoJSON(geoData, {
      filter: (feature) => {
        if (!selectedMunicipio) return true;
        const mpioId = feature.properties?.municipio;
        return !mpioId || mpioId === selectedMunicipio;
      },
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const res = getElectoralResultForFeature(props);

        let featureTitle = "";
        let featureSubtitle = "";

        if (baseBoundary === "secciones") {
          const secId = props.seccion || props.id;
          featureTitle = `Sección Electoral ${secId}`;
          featureSubtitle = `${res?.municipio_nombre || props.nombre || `Mpio ${props.municipio || "Gto"}`} · Dtto Local ${props.distrito_l || "N/D"} · Dtto Fed ${props.distrito_f || "N/D"}`;
        } else if (baseBoundary === "distritos_locales") {
          const dlId = props.distrito_l || props.id;
          featureTitle = `Distrito Local ${dlId}`;
          featureSubtitle = `Guanajuato · ${res?.secciones_count || 0} Secciones Electorales`;
        } else if (baseBoundary === "distritos_federales") {
          const dfId = props.distrito_f || props.id;
          featureTitle = `Distrito Federal ${dfId}`;
          featureSubtitle = `Guanajuato · ${res?.secciones_count || 0} Secciones Electorales`;
        } else if (baseBoundary === "municipios") {
          const mpioId = props.municipio || props.id;
          featureTitle = res?.nombre || props.nombre || `Municipio ${mpioId}`;
          featureSubtitle = `Guanajuato (Clave ${mpioId}) · ${res?.secciones_count || 0} Secciones`;
        }

        layer.on({
          click: () => {
            const enrichedProps = {
              ...props,
              featureTitle,
              featureSubtitle,
              baseBoundary,
              geometry: feature.geometry,
            };
            onSelectSection(enrichedProps, res || null);
          },
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 3, color: "#0f172a", fillOpacity: 0.95 });
            setHoveredInfo({
              featureTitle,
              featureSubtitle,
              res: res || null,
            });
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          },
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = geoLayer;

    // AUTO-ZOOM (fitBounds): Ajustar vista al municipio seleccionado si aplica
    if (selectedMunicipio && geoLayer.getLayers().length > 0) {
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13, animate: true });
      }
    } else if (!selectedMunicipio && baseBoundary === "secciones") {
      map.setView([21.019, -101.2574], 9, { animate: true });
    }
  }, [geoData, choroplethMode, selectedYear, electionType, baseBoundary, electoralCache, selectedMunicipio, swingYears]);

  return (
    <div className="position-relative w-100 rounded-3 overflow-hidden shadow-sm border border-gray-200" style={{ width: "100%", height: "650px", minHeight: "650px" }}>
      {loadingGeo && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white"
          style={{ zIndex: 1000, opacity: 0.85 }}
        >
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <span className="fw-bold text-dark fs-13">Cargando Capa Territorial ({baseBoundary.replace("_", " ")})...</span>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet */}
      <div ref={mapContainerRef} className="w-100 h-100" style={{ width: "100%", height: "650px", minHeight: "650px" }} />

      {/* 1. HUD Fijo Superior Izquierdo: Ficha Rápida al Vuelo (Sin solapar el cursor) */}
      <div
        className="position-absolute top-0 start-0 m-3 p-3 bg-white rounded-3 shadow border border-gray-300"
        style={{
          zIndex: 1000,
          width: "285px",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
          pointerEvents: "auto",
        }}
      >
        {hoveredInfo ? (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="badge bg-primary-subtle text-primary fs-10 fw-bold text-uppercase">
                {baseBoundary.replace("_", " ")}
              </span>
              <span className="fs-10 text-muted fw-semibold d-flex align-items-center gap-1">
                <span style={{ width: 6, height: 6, backgroundColor: "#10b981", borderRadius: "50%", display: "inline-block" }}></span>
                Inspección Activa
              </span>
            </div>
            <h6 className="fw-extrabold text-dark fs-13 mb-0" style={{ color: "#0f172a" }}>
              {hoveredInfo.featureTitle}
            </h6>
            <small className="text-muted fs-11 d-block mb-2">
              {hoveredInfo.featureSubtitle}
            </small>

            {hoveredInfo.res ? (
              <div>
                <div
                  className="d-flex align-items-center justify-content-between p-1.5 px-2 rounded mb-2 text-white fs-12 fw-bold shadow-sm"
                  style={{ backgroundColor: getPartyColor(hoveredInfo.res.ganador_partido) }}
                >
                  <span className="text-truncate">{hoveredInfo.res.ganador_partido}</span>
                  <span className="badge bg-white text-dark fs-11 ms-1">
                    {hoveredInfo.res.ganador_pct}%
                  </span>
                </div>
                <div className="d-flex justify-content-between fs-11 text-dark fw-bold mb-1">
                  <span>Votos: {Number(hoveredInfo.res.total_votos || 0).toLocaleString()}</span>
                  <span className="text-success">Part: {hoveredInfo.res.participacion_pct}%</span>
                </div>
                {hoveredInfo.res.segundo_partido && (
                  <div className="fs-10 text-muted d-flex justify-content-between">
                    <span>2° {hoveredInfo.res.segundo_partido} ({hoveredInfo.res.segundo_pct}%)</span>
                    <span className="text-primary fw-bold">+{hoveredInfo.res.margen_victoria_pct}%</span>
                  </div>
                )}
                <div className="mt-2 pt-1 border-top text-center text-primary fs-10 fw-bold">
                  <i className="ri-cursor-fill me-1"></i>Clic para abrir Ficha Técnica
                </div>
              </div>
            ) : (
              <div className="text-muted fs-11 py-1">
                Sin datos electorales cargados
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 text-center text-muted">
            <i className="ri-cursor-line text-primary fs-20 d-block mb-1"></i>
            <span className="fs-12 fw-bold text-dark d-block">Inspección de Territorio</span>
            <small className="fs-11 text-muted">Pase el cursor sobre cualquier polígono para ver métricas</small>
          </div>
        )}
      </div>

      {/* 2. Selector Flotante de Mapa Base en Esquina Superior Derecha */}
      {onSelectTileProvider && (
        <div
          className="position-absolute top-0 end-0 m-3 me-5 bg-white p-1 rounded-3 shadow border border-gray-300 d-flex gap-1"
          style={{ zIndex: 999 }}
        >
          {(["carto", "osm", "satellite"] as const).map((prov) => (
            <button
              key={prov}
              type="button"
              className={`btn btn-xs px-2 py-1 fs-11 fw-bold text-capitalize ${tileProvider === prov ? "btn-primary text-white shadow-sm" : "btn-outline-secondary"}`}
              onClick={() => onSelectTileProvider(prov)}
            >
              {prov === "satellite" ? "Satélite" : prov.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Leyenda Visual de Partidos y Coaliciones */}
      <div
        className="position-absolute bottom-0 start-0 m-3 p-2 bg-white rounded-3 shadow border border-gray-300"
        style={{ zIndex: 999, maxWidth: "340px", fontSize: "11px", backgroundColor: "rgba(255, 255, 255, 0.95)" }}
      >
        <div className="fw-extrabold text-dark text-uppercase mb-1 fs-11 d-flex align-items-center gap-1">
          <i className="ri-palette-fill text-primary"></i> Partidos y Coaliciones
        </div>
        <div className="d-flex flex-wrap gap-2 fw-bold text-dark fs-11">
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, backgroundColor: "#0055B8", borderRadius: 2, display: "inline-block" }}></span>
            PAN / Coalición
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, backgroundColor: "#70112C", borderRadius: 2, display: "inline-block" }}></span>
            MORENA / Coalición
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, backgroundColor: "#D92128", borderRadius: 2, display: "inline-block" }}></span>
            PRI
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, backgroundColor: "#50B848", borderRadius: 2, display: "inline-block" }}></span>
            PVEM
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, backgroundColor: "#1B5E20", borderRadius: 2, display: "inline-block" }}></span>
            PRD
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, backgroundColor: "#FF8200", borderRadius: 2, display: "inline-block" }}></span>
            MC
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebGisMap;
