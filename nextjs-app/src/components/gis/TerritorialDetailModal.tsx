"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ElectoralResult } from "@/lib/electoralTypes";
import { getPartyColor, PARTY_COLORS } from "@/lib/gisColors";

interface TerritorialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSection: any | null;
  initialResult: ElectoralResult | null;
  currentYear: number;
  currentElectionType: "gubernatura" | "diputaciones";
  electoralCache: any;
  municipiosList: { id: number; nombre: string }[];
}

export const TerritorialDetailModal: React.FC<TerritorialDetailModalProps> = ({
  isOpen,
  onClose,
  selectedSection,
  initialResult,
  currentYear,
  currentElectionType,
  electoralCache,
  municipiosList,
}) => {
  const [modalYear, setModalYear] = useState<number>(currentYear);
  const [modalElectionType, setModalElectionType] = useState<"gubernatura" | "diputaciones">(currentElectionType);
  const [activeTab, setActiveTab] = useState<"resultados" | "tendencias" | "secciones">("resultados");
  const [sectionFilter, setSectionFilter] = useState<string>("");

  // Sincronizar estado inicial al abrir modal
  useEffect(() => {
    if (isOpen) {
      setModalYear(currentYear);
      setModalElectionType(currentElectionType);
      setActiveTab("resultados");
      setSectionFilter("");
    }
  }, [isOpen, currentYear, currentElectionType]);

  // Si se cambia a gubernatura mientras estaba en 2021, ajustar a 2024
  const handleElectionTypeChange = (type: "gubernatura" | "diputaciones") => {
    setModalElectionType(type);
    if (type === "gubernatura" && modalYear === 2021) {
      setModalYear(2024);
    }
  };

  const baseBoundary = selectedSection?.baseBoundary || "secciones";

  // Identificadores de territorio
  const territoryId = useMemo(() => {
    if (!selectedSection) return 0;
    if (baseBoundary === "secciones") return selectedSection.seccion || selectedSection.id || 0;
    if (baseBoundary === "distritos_locales") return selectedSection.distrito_l || selectedSection.id || 0;
    if (baseBoundary === "distritos_federales") return selectedSection.distrito_f || selectedSection.id || 0;
    if (baseBoundary === "municipios") return selectedSection.municipio || selectedSection.id || 0;
    return selectedSection.id || 0;
  }, [selectedSection, baseBoundary]);

  const territoryTitle = selectedSection?.featureTitle || `Territorio ${territoryId}`;
  const territorySubtitle = selectedSection?.featureSubtitle || "Guanajuato";

  // Obtener resultado electoral según los filtros internos del modal
  const activeResult: ElectoralResult | null = useMemo(() => {
    if (!selectedSection || !electoralCache) return initialResult;
    const yr = String(modalYear);
    const idKey = String(territoryId);

    try {
      if (baseBoundary === "secciones") {
        return electoralCache[modalElectionType]?.[yr]?.[idKey] || null;
      }
      if (baseBoundary === "distritos_locales") {
        return electoralCache["distritos_locales"]?.[modalElectionType]?.[yr]?.[idKey] || null;
      }
      if (baseBoundary === "distritos_federales") {
        return electoralCache["distritos_federales"]?.[modalElectionType]?.[yr]?.[idKey] || null;
      }
      if (baseBoundary === "municipios") {
        return electoralCache["municipios"]?.[modalElectionType]?.[yr]?.[idKey] || null;
      }
    } catch {
      return null;
    }
    return initialResult;
  }, [selectedSection, electoralCache, modalYear, modalElectionType, baseBoundary, territoryId, initialResult]);

  // Obtener resultados históricos para la pestaña de Swing (2018, 2021, 2024)
  const historicalResults = useMemo(() => {
    if (!selectedSection || !electoralCache) return {};
    const idKey = String(territoryId);
    const results: Record<number, any> = {};

    [2018, 2021, 2024].forEach((yr) => {
      const yrStr = String(yr);
      try {
        if (baseBoundary === "secciones") {
          results[yr] = electoralCache[modalElectionType]?.[yrStr]?.[idKey] || null;
        } else if (baseBoundary === "distritos_locales") {
          results[yr] = electoralCache["distritos_locales"]?.[modalElectionType]?.[yrStr]?.[idKey] || null;
        } else if (baseBoundary === "distritos_federales") {
          results[yr] = electoralCache["distritos_federales"]?.[modalElectionType]?.[yrStr]?.[idKey] || null;
        } else if (baseBoundary === "municipios") {
          results[yr] = electoralCache["municipios"]?.[modalElectionType]?.[yrStr]?.[idKey] || null;
        }
      } catch {
        results[yr] = null;
      }
    });
    return results;
  }, [selectedSection, electoralCache, modalElectionType, baseBoundary, territoryId]);

  // Años y datos para la gráfica de tendencias
  const trendYears = useMemo(() => {
    return modalElectionType === "diputaciones" ? [2018, 2021, 2024] : [2018, 2024];
  }, [modalElectionType]);

  const trendData = useMemo(() => {
    return trendYears.map((yr) => {
      const hRes = historicalResults[yr];
      const vp = hRes?.votos_partidos || {};

      const panVotes = Number(
        vp["PAN_ALIANZA"] ??
        vp["PAN-PRI-PRD"] ??
        vp["PAN-PRD-MC"] ??
        vp["PAN"] ??
        0
      );

      const morenaVotes = Number(
        vp["OPOSICION_ALIANZA"] ??
        vp["MORENA-PT-PVEM"] ??
        vp["MORENA-PT-PES"] ??
        vp["MORENA"] ??
        0
      );

      const mcVotes = Number(vp["MC"] ?? 0);
      const totalVotes = Number(hRes?.total_votos || (panVotes + morenaVotes + mcVotes));

      return {
        year: yr,
        panVotes,
        morenaVotes,
        mcVotes,
        totalVotes,
        winner: hRes?.ganador_partido || null,
        winnerPct: hRes?.ganador_pct || 0,
        participacion: hRes?.participacion_pct || 0,
      };
    });
  }, [trendYears, historicalResults]);

  // Layout geométrico del gráfico SVG de Líneas
  const chartLayout = useMemo(() => {
    const width = 640;
    const height = 270;
    const paddingLeft = 70;
    const paddingRight = 45;
    const paddingTop = 35;
    const paddingBottom = 45;

    const plotW = width - paddingLeft - paddingRight;
    const plotH = height - paddingTop - paddingBottom;

    const allVotes = trendData.flatMap((d) => [d.panVotes, d.morenaVotes, d.mcVotes]);
    const rawMax = Math.max(...allVotes, 10);
    const yMax = Math.ceil(rawMax * 1.25);

    const getY = (v: number) => {
      return paddingTop + plotH - (v / yMax) * plotH;
    };

    const getX = (idx: number) => {
      if (trendYears.length === 1) return paddingLeft + plotW / 2;
      return paddingLeft + (idx / (trendYears.length - 1)) * plotW;
    };

    const panPoints = trendData.map((d, i) => ({ x: getX(i), y: getY(d.panVotes), votes: d.panVotes, year: d.year }));
    const morenaPoints = trendData.map((d, i) => ({ x: getX(i), y: getY(d.morenaVotes), votes: d.morenaVotes, year: d.year }));
    const mcPoints = trendData.map((d, i) => ({ x: getX(i), y: getY(d.mcVotes), votes: d.mcVotes, year: d.year }));

    const panPathD = panPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const morenaPathD = morenaPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const mcPathD = mcPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

    const gridTicks = [0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
      const val = Math.round(yMax * ratio);
      return {
        y: getY(val),
        val,
        label: val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`,
      };
    });

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      plotW,
      plotH,
      yMax,
      gridTicks,
      panPoints,
      morenaPoints,
      mcPoints,
      panPathD,
      morenaPathD,
      mcPathD,
    };
  }, [trendData, trendYears]);

  // Secciones constitutivas (para Municipios y Distritos)
  const constituentSections = useMemo(() => {
    if (!selectedSection || !electoralCache) return [];
    if (baseBoundary === "secciones") return [];

    const yr = String(modalYear);
    const sectionsMap = electoralCache[modalElectionType]?.[yr] || {};
    const list: any[] = [];

    Object.entries(sectionsMap).forEach(([secNum, data]: [string, any]) => {
      let matches = false;
      if (baseBoundary === "municipios" && data.clave_municipio === territoryId) {
        matches = true;
      } else if (baseBoundary === "distritos_locales" && data.distrito_local === territoryId) {
        matches = true;
      } else if (baseBoundary === "distritos_federales" && data.distrito_federal === territoryId) {
        matches = true;
      }

      if (matches) {
        list.push({
          seccion: Number(secNum),
          ...data,
        });
      }
    });

    list.sort((a, b) => (b.margen_victoria_pct || 0) - (a.margen_victoria_pct || 0));
    return list;
  }, [selectedSection, electoralCache, modalElectionType, modalYear, baseBoundary, territoryId]);

  // Filtrado de secciones para la tabla
  const filteredSections = useMemo(() => {
    if (!sectionFilter.trim()) return constituentSections;
    return constituentSections.filter((s) => String(s.seccion).includes(sectionFilter.trim()));
  }, [constituentSections, sectionFilter]);

  // Generador de la Silueta Vectorial SVG
  const svgSilhouettePath = useMemo(() => {
    const geom = selectedSection?.geometry;
    if (!geom || !geom.coordinates) return null;

    let polygons: number[][][][] = [];
    if (geom.type === "Polygon") {
      polygons = [geom.coordinates];
    } else if (geom.type === "MultiPolygon") {
      polygons = geom.coordinates;
    } else {
      return null;
    }

    // Calcular Bounding Box
    let minLng = Infinity,
      maxLng = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity;

    polygons.forEach((poly) => {
      poly.forEach((ring) => {
        ring.forEach(([lng, lat]) => {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        });
      });
    });

    if (!isFinite(minLng) || !isFinite(maxLng) || minLng === maxLng || minLat === maxLat) {
      return null;
    }

    const widthGeo = maxLng - minLng;
    const heightGeo = maxLat - minLat;

    // Dimensiones del lienzo SVG
    const svgSize = 240;
    const padding = 16;
    const drawSize = svgSize - padding * 2;

    const scale = Math.min(drawSize / widthGeo, drawSize / heightGeo);
    const offsetX = padding + (drawSize - widthGeo * scale) / 2;
    const offsetY = padding + (drawSize - heightGeo * scale) / 2;

    // Construir paths SVG
    let pathD = "";
    polygons.forEach((poly) => {
      poly.forEach((ring) => {
        if (ring.length === 0) return;
        ring.forEach(([lng, lat], idx) => {
          const x = offsetX + (lng - minLng) * scale;
          // En SVG 'y' crece hacia abajo; en latitud crece hacia arriba
          const y = offsetY + (maxLat - lat) * scale;
          if (idx === 0) {
            pathD += `M ${x.toFixed(1)} ${y.toFixed(1)} `;
          } else {
            pathD += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
          }
        });
        pathD += "Z ";
      });
    });

    return pathD;
  }, [selectedSection]);

  if (!isOpen || !selectedSection) return null;

  const winnerParty = activeResult?.ganador_partido || "PAN";
  const winnerColor = getPartyColor(winnerParty);

  // Voto de coalición vs Voto Puro
  const vPanAli = activeResult?.votos_partidos?.["PAN_ALIANZA"] ?? activeResult?.votos_partidos?.["PAN-PRI-PRD"] ?? activeResult?.votos_partidos?.["PAN-PRD-MC"] ?? 0;
  const vPanPuro = activeResult?.votos_partidos?.["PAN_PURO"] ?? activeResult?.votos_partidos?.["PAN"] ?? vPanAli;
  const vOppAli = activeResult?.votos_partidos?.["OPOSICION_ALIANZA"] ?? activeResult?.votos_partidos?.["MORENA-PT-PVEM"] ?? activeResult?.votos_partidos?.["MORENA-PT-PES"] ?? 0;
  const vMc = activeResult?.votos_partidos?.["MC"] ?? 0;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header con gradiente según partido ganador */}
          <div
            className="modal-header border-0 py-3 px-4 text-white d-flex align-items-center justify-content-between"
            style={{
              background: `linear-gradient(135deg, ${winnerColor} 0%, #0f172a 120%)`,
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <span
                className="badge px-3 py-2 fs-12 fw-bold text-uppercase rounded-pill shadow-sm"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(6px)" }}
              >
                <i className="ri-map-pin-line me-1"></i> {baseBoundary.replace("_", " ")}
              </span>
              <div>
                <h5 className="modal-title fw-extrabold mb-0 text-white fs-18">
                  {territoryTitle}
                </h5>
                <small className="text-white-50 fs-12 d-block">
                  {territorySubtitle}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          {/* Subheader: Barra de Filtros Internos del Modal */}
          <div className="bg-light border-bottom px-4 py-2 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-12 text-dark fw-bold text-uppercase">
                <i className="ri-government-line text-primary me-1"></i> Elección:
              </span>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm fw-bold ${modalElectionType === "gubernatura" ? "btn-primary text-white shadow-sm" : "btn-outline-secondary bg-white"}`}
                  onClick={() => handleElectionTypeChange("gubernatura")}
                >
                  🏛️ Gubernatura
                </button>
                <button
                  type="button"
                  className={`btn btn-sm fw-bold ${modalElectionType === "diputaciones" ? "btn-primary text-white shadow-sm" : "btn-outline-secondary bg-white"}`}
                  onClick={() => handleElectionTypeChange("diputaciones")}
                >
                  🗳️ Diputaciones
                </button>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="fs-12 text-dark fw-bold text-uppercase">
                <i className="ri-calendar-line text-primary me-1"></i> Ciclo:
              </span>
              <div className="btn-group" role="group">
                {(modalElectionType === "diputaciones" ? [2024, 2021, 2018] : [2024, 2018]).map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    className={`btn btn-sm fw-bold ${modalYear === yr ? "btn-primary text-white shadow-sm" : "btn-outline-secondary bg-white"}`}
                    onClick={() => setModalYear(yr)}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Navegación de Pestañas */}
            <ul className="nav nav-pills nav-fill gap-1 bg-white p-1 rounded-3 border border-gray-200">
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 fs-12 fw-bold ${activeTab === "resultados" ? "active bg-primary text-white" : "text-dark"}`}
                  onClick={() => setActiveTab("resultados")}
                >
                  <i className="ri-pie-chart-2-line me-1"></i> Resultados {modalYear}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 fs-12 fw-bold ${activeTab === "tendencias" ? "active bg-primary text-white" : "text-dark"}`}
                  onClick={() => setActiveTab("tendencias")}
                >
                  <i className="ri-line-chart-line me-1"></i> Tendencias
                </button>
              </li>
              {baseBoundary !== "secciones" && (
                <li className="nav-item">
                  <button
                    className={`nav-link py-1 px-3 fs-12 fw-bold ${activeTab === "secciones" ? "active bg-primary text-white" : "text-dark"}`}
                    onClick={() => setActiveTab("secciones")}
                  >
                    <i className="ri-table-line me-1"></i> Secciones ({constituentSections.length})
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Cuerpo del Modal */}
          <div className="modal-body p-4 bg-white">
            <div className="row g-4">
              {/* Columna Izquierda: Silueta Vectorial y Tarjeta de Ganador */}
              <div className="col-12 col-lg-4 text-center">
                <div className="p-3 rounded-4 bg-light border border-gray-200 shadow-sm d-flex flex-column align-items-center">
                  <div className="d-flex justify-content-between w-100 align-items-center mb-2 px-2">
                    <span className="fs-11 fw-extrabold text-uppercase text-muted">
                      Silueta Cartográfica
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary fs-10 fw-bold">
                      Escala Normalizada
                    </span>
                  </div>

                  {/* SVG de Silueta */}
                  <div
                    className="position-relative d-flex align-items-center justify-content-center p-2 rounded-3"
                    style={{
                      width: "240px",
                      height: "240px",
                      backgroundColor: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                    }}
                  >
                    {svgSilhouettePath ? (
                      <svg
                        viewBox="0 0 240 240"
                        className="w-100 h-100"
                        style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.22))" }}
                      >
                        <path
                          d={svgSilhouettePath}
                          fill={winnerColor}
                          fillOpacity="0.88"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <div className="text-muted text-center p-3">
                        <i className="ri-map-2-line fs-32 text-secondary mb-2 d-block"></i>
                        <span className="fs-12 fw-semibold">Silueta no disponible para este elemento</span>
                      </div>
                    )}
                  </div>

                  {/* Tarjeta de Ganador Actual */}
                  <div
                    className="w-100 mt-3 p-3 rounded-3 text-white text-start shadow-sm"
                    style={{ backgroundColor: winnerColor }}
                  >
                    <span className="fs-11 text-white-50 text-uppercase fw-bold d-block">
                      Fuerza Ganadora {modalYear}
                    </span>
                    <h5 className="fw-extrabold mb-1 text-white">{winnerParty}</h5>
                    <div className="d-flex justify-content-between align-items-center fs-13 fw-bold text-white">
                      <span>{Number(activeResult?.ganador_votos || 0).toLocaleString()} votos</span>
                      <span className="badge bg-white text-dark fs-12">
                        {activeResult?.ganador_pct || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Contenido según Pestaña Activa */}
              <div className="col-12 col-lg-8">
                {activeTab === "resultados" && (
                  <div>
                    <h6 className="fw-extrabold text-dark text-uppercase fs-13 mb-3 d-flex align-items-center gap-2">
                      <i className="ri-dashboard-line text-primary"></i> Desglose del Proceso Electoral {modalYear} ({modalElectionType})
                    </h6>

                    {/* Métricas Resumen */}
                    <div className="row g-3 mb-4">
                      <div className="col-sm-4">
                        <div className="p-3 bg-light rounded-3 border border-gray-200">
                          <span className="text-muted fs-11 fw-bold text-uppercase d-block">Votación Total</span>
                          <span className="fs-18 fw-extrabold text-dark">
                            {Number(activeResult?.total_votos || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="p-3 bg-light rounded-3 border border-gray-200">
                          <span className="text-muted fs-11 fw-bold text-uppercase d-block">Participación</span>
                          <span className="fs-18 fw-extrabold text-success">
                            {activeResult?.participacion_pct || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="p-3 bg-light rounded-3 border border-gray-200">
                          <span className="text-muted fs-11 fw-bold text-uppercase d-block">Margen de Victoria</span>
                          <span className="fs-18 fw-extrabold text-primary">
                            +{activeResult?.margen_victoria_pct || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Análisis Opción A: Voto Duro vs Coalición */}
                    <div className="card border border-gray-200 rounded-3 mb-3">
                      <div className="card-header bg-light py-2 px-3">
                        <span className="fs-12 fw-extrabold text-dark text-uppercase">
                          Desglose Estratégico de Coaliciones (Opción A)
                        </span>
                      </div>
                      <div className="card-body p-3">
                        {/* Fila PAN */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1 fs-12 fw-bold text-dark">
                            <span>
                              <i className="ri-checkbox-blank-circle-fill me-1" style={{ color: PARTY_COLORS["PAN"] }}></i>
                              Coalición PAN (PAN + Aliados)
                            </span>
                            <span>{Number(vPanAli).toLocaleString()} votos ({activeResult?.total_votos ? ((Number(vPanAli) / activeResult.total_votos) * 100).toFixed(1) : 0}%)</span>
                          </div>
                          <div className="progress" style={{ height: "10px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${activeResult?.total_votos ? (Number(vPanAli) / activeResult.total_votos) * 100 : 0}%`,
                                backgroundColor: PARTY_COLORS["PAN"],
                              }}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between fs-11 text-muted mt-1">
                            <span>Voto Puro PAN: <strong>{Number(vPanPuro).toLocaleString()}</strong></span>
                            <span>Aporte Aliados: <strong>{Math.max(0, Number(vPanAli) - Number(vPanPuro)).toLocaleString()}</strong></span>
                          </div>
                        </div>

                        {/* Fila Oposición */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1 fs-12 fw-bold text-dark">
                            <span>
                              <i className="ri-checkbox-blank-circle-fill me-1" style={{ color: PARTY_COLORS["MORENA"] }}></i>
                              Coalición Oposición (MORENA + Aliados)
                            </span>
                            <span>{Number(vOppAli).toLocaleString()} votos ({activeResult?.total_votos ? ((Number(vOppAli) / activeResult.total_votos) * 100).toFixed(1) : 0}%)</span>
                          </div>
                          <div className="progress" style={{ height: "10px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${activeResult?.total_votos ? (Number(vOppAli) / activeResult.total_votos) * 100 : 0}%`,
                                backgroundColor: PARTY_COLORS["MORENA"],
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Fila MC */}
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-1 fs-12 fw-bold text-dark">
                            <span>
                              <i className="ri-checkbox-blank-circle-fill me-1" style={{ color: PARTY_COLORS["MC"] }}></i>
                              Movimiento Ciudadano (MC)
                            </span>
                            <span>{Number(vMc).toLocaleString()} votos ({activeResult?.total_votos ? ((Number(vMc) / activeResult.total_votos) * 100).toFixed(1) : 0}%)</span>
                          </div>
                          <div className="progress" style={{ height: "10px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${activeResult?.total_votos ? (Number(vMc) / activeResult.total_votos) * 100 : 0}%`,
                                backgroundColor: PARTY_COLORS["MC"],
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Segundo Lugar */}
                    {activeResult?.segundo_partido && (
                      <div className="p-2 px-3 bg-light rounded-3 d-flex justify-content-between align-items-center fs-12 text-dark">
                        <span>
                          🥈 Segundo Lugar: <strong>{activeResult.segundo_partido}</strong> ({activeResult.segundo_pct}%)
                        </span>
                        <span>{Number(activeResult.segundo_votos || 0).toLocaleString()} votos</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "tendencias" && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <div>
                        <h6 className="fw-extrabold text-dark text-uppercase fs-13 mb-0 d-flex align-items-center gap-2">
                          <i className="ri-line-chart-line text-primary"></i> Tendencias de Votación por Contendiente
                        </h6>
                        <small className="text-muted fs-11">
                          Eje X: Ciclos Electorales ({trendYears.join(", ")}) · Eje Y: Votos obtenidos
                        </small>
                      </div>

                      {/* Leyenda de la gráfica */}
                      <div className="d-flex align-items-center gap-3 fs-11 fw-bold">
                        <span className="d-flex align-items-center gap-1">
                          <span style={{ width: 12, height: 4, backgroundColor: PARTY_COLORS["PAN"], borderRadius: 2, display: "inline-block" }}></span>
                          Coalición PAN
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <span style={{ width: 12, height: 4, backgroundColor: PARTY_COLORS["MORENA"], borderRadius: 2, display: "inline-block" }}></span>
                          Coalición MORENA
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <span style={{ width: 12, height: 4, backgroundColor: PARTY_COLORS["MC"], borderRadius: 2, display: "inline-block" }}></span>
                          MC
                        </span>
                      </div>
                    </div>

                    {/* Contenedor de la Gráfica de Líneas SVG */}
                    <div className="card border border-gray-200 rounded-3 shadow-sm mb-3 overflow-hidden bg-white p-2">
                      <div className="w-100" style={{ height: "270px" }}>
                        <svg
                          viewBox={`0 0 ${chartLayout.width} ${chartLayout.height}`}
                          className="w-100 h-100"
                          style={{ overflow: "visible" }}
                        >
                          <defs>
                            <linearGradient id="panTrendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={PARTY_COLORS["PAN"]} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={PARTY_COLORS["PAN"]} stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="morTrendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={PARTY_COLORS["MORENA"]} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={PARTY_COLORS["MORENA"]} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grilla horizontal y valores en Eje Y */}
                          {chartLayout.gridTicks.map((tick, idx) => (
                            <g key={idx}>
                              <line
                                x1={chartLayout.paddingLeft}
                                y1={tick.y}
                                x2={chartLayout.width - chartLayout.paddingRight}
                                y2={tick.y}
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                                strokeWidth="1"
                              />
                              <text
                                x={chartLayout.paddingLeft - 10}
                                y={tick.y + 4}
                                textAnchor="end"
                                fontSize="11"
                                fill="#64748b"
                                fontWeight="600"
                              >
                                {tick.label}
                              </text>
                            </g>
                          ))}

                          {/* Título del Eje Y */}
                          <text
                            x={14}
                            y={chartLayout.paddingTop - 12}
                            fontSize="10"
                            fontWeight="800"
                            fill="#64748b"
                            textAnchor="start"
                            className="text-uppercase"
                          >
                            Votos (Y)
                          </text>

                          {/* Título del Eje X */}
                          <text
                            x={chartLayout.width - chartLayout.paddingRight}
                            y={chartLayout.height - 8}
                            fontSize="10"
                            fontWeight="800"
                            fill="#64748b"
                            textAnchor="end"
                            className="text-uppercase"
                          >
                            Ciclos Electorales (X)
                          </text>

                          {/* Línea Base X */}
                          <line
                            x1={chartLayout.paddingLeft}
                            y1={chartLayout.height - chartLayout.paddingBottom}
                            x2={chartLayout.width - chartLayout.paddingRight}
                            y2={chartLayout.height - chartLayout.paddingBottom}
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                          />

                          {/* Líneas de Contendientes */}
                          {/* 1. Coalición PAN */}
                          <path
                            d={chartLayout.panPathD}
                            fill="none"
                            stroke={PARTY_COLORS["PAN"]}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* 2. Coalición MORENA */}
                          <path
                            d={chartLayout.morenaPathD}
                            fill="none"
                            stroke={PARTY_COLORS["MORENA"]}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* 3. Movimiento Ciudadano */}
                          <path
                            d={chartLayout.mcPathD}
                            fill="none"
                            stroke={PARTY_COLORS["MC"]}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Nodos / Puntos y Etiquetas para PAN */}
                          {chartLayout.panPoints.map((pt, i) => {
                            const isHigher = pt.votes >= chartLayout.morenaPoints[i]?.votes;
                            const badgeY = isHigher ? pt.y - 14 : pt.y + 18;
                            return (
                              <g key={`pan-pt-${i}`}>
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="6"
                                  fill={PARTY_COLORS["PAN"]}
                                  stroke="#ffffff"
                                  strokeWidth="2.5"
                                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                                />
                                <rect
                                  x={pt.x - 32}
                                  y={badgeY - 10}
                                  width="64"
                                  height="18"
                                  rx="4"
                                  fill="#0055B8"
                                  opacity="0.92"
                                />
                                <text
                                  x={pt.x}
                                  y={badgeY + 3}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight="bold"
                                  fill="#ffffff"
                                >
                                  {pt.votes.toLocaleString()}
                                </text>
                              </g>
                            );
                          })}

                          {/* Nodos / Puntos y Etiquetas para MORENA */}
                          {chartLayout.morenaPoints.map((pt, i) => {
                            const isHigher = pt.votes > chartLayout.panPoints[i]?.votes;
                            const badgeY = isHigher ? pt.y - 14 : pt.y + 18;
                            return (
                              <g key={`mor-pt-${i}`}>
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="6"
                                  fill={PARTY_COLORS["MORENA"]}
                                  stroke="#ffffff"
                                  strokeWidth="2.5"
                                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                                />
                                <rect
                                  x={pt.x - 32}
                                  y={badgeY - 10}
                                  width="64"
                                  height="18"
                                  rx="4"
                                  fill="#70112C"
                                  opacity="0.92"
                                />
                                <text
                                  x={pt.x}
                                  y={badgeY + 3}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight="bold"
                                  fill="#ffffff"
                                >
                                  {pt.votes.toLocaleString()}
                                </text>
                              </g>
                            );
                          })}

                          {/* Nodos / Puntos para MC */}
                          {chartLayout.mcPoints.map((pt, i) => (
                            <g key={`mc-pt-${i}`}>
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="4.5"
                                fill={PARTY_COLORS["MC"]}
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              <text
                                x={pt.x}
                                y={pt.y + 16}
                                textAnchor="middle"
                                fontSize="9"
                                fontWeight="bold"
                                fill="#c2410c"
                              >
                                {pt.votes > 0 ? pt.votes.toLocaleString() : "0"}
                              </text>
                            </g>
                          ))}

                          {/* Etiquetas del Eje X (Años) */}
                          {trendYears.map((yr, i) => {
                            const x = chartLayout.panPoints[i]?.x || chartLayout.paddingLeft;
                            const y = chartLayout.height - chartLayout.paddingBottom + 20;
                            return (
                              <g key={`x-lbl-${yr}`}>
                                <text
                                  x={x}
                                  y={y}
                                  textAnchor="middle"
                                  fontSize="12"
                                  fontWeight="800"
                                  fill="#0f172a"
                                >
                                  {yr}
                                </text>
                                <text
                                  x={x}
                                  y={y + 14}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight="600"
                                  fill="#64748b"
                                >
                                  {trendData[i]?.winner ? `Ganador: ${trendData[i].winner}` : `Elección ${yr}`}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* Tabla Resumen de Crecimiento Numérico */}
                    <div className="table-responsive rounded-3 border border-gray-200 mb-3">
                      <table className="table table-sm table-hover align-middle fs-12 mb-0 bg-white">
                        <thead className="table-light">
                          <tr>
                            <th>Contendiente</th>
                            {trendYears.map((yr) => (
                              <th key={yr} className="text-end">Votos {yr}</th>
                            ))}
                            <th className="text-end">Variación Neta (Δ)</th>
                            <th className="text-end">Tendencia</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="fw-bold">
                              <i className="ri-checkbox-blank-circle-fill me-1" style={{ color: PARTY_COLORS["PAN"] }}></i>
                              Coalición PAN
                            </td>
                            {trendYears.map((yr, idx) => (
                              <td key={yr} className="text-end fw-semibold">
                                {trendData[idx]?.panVotes.toLocaleString()}
                              </td>
                            ))}
                            {(() => {
                              const first = trendData[0]?.panVotes || 0;
                              const last = trendData[trendData.length - 1]?.panVotes || 0;
                              const diff = last - first;
                              const pct = first > 0 ? ((diff / first) * 100).toFixed(1) : "0.0";
                              const isPos = diff >= 0;
                              return (
                                <>
                                  <td className={`text-end fw-extrabold ${isPos ? "text-success" : "text-danger"}`}>
                                    {isPos ? `+${diff.toLocaleString()}` : diff.toLocaleString()}
                                  </td>
                                  <td className="text-end">
                                    <span className={`badge ${isPos ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} fw-bold`}>
                                      {isPos ? `+${pct}%` : `${pct}%`}
                                    </span>
                                  </td>
                                </>
                              );
                            })()}
                          </tr>
                          <tr>
                            <td className="fw-bold">
                              <i className="ri-checkbox-blank-circle-fill me-1" style={{ color: PARTY_COLORS["MORENA"] }}></i>
                              Coalición MORENA
                            </td>
                            {trendYears.map((yr, idx) => (
                              <td key={yr} className="text-end fw-semibold">
                                {trendData[idx]?.morenaVotes.toLocaleString()}
                              </td>
                            ))}
                            {(() => {
                              const first = trendData[0]?.morenaVotes || 0;
                              const last = trendData[trendData.length - 1]?.morenaVotes || 0;
                              const diff = last - first;
                              const pct = first > 0 ? ((diff / first) * 100).toFixed(1) : "0.0";
                              const isPos = diff >= 0;
                              return (
                                <>
                                  <td className={`text-end fw-extrabold ${isPos ? "text-success" : "text-danger"}`}>
                                    {isPos ? `+${diff.toLocaleString()}` : diff.toLocaleString()}
                                  </td>
                                  <td className="text-end">
                                    <span className={`badge ${isPos ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} fw-bold`}>
                                      {isPos ? `+${pct}%` : `${pct}%`}
                                    </span>
                                  </td>
                                </>
                              );
                            })()}
                          </tr>
                          <tr>
                            <td className="fw-bold">
                              <i className="ri-checkbox-blank-circle-fill me-1" style={{ color: PARTY_COLORS["MC"] }}></i>
                              Movimiento Ciudadano
                            </td>
                            {trendYears.map((yr, idx) => (
                              <td key={yr} className="text-end fw-semibold">
                                {trendData[idx]?.mcVotes.toLocaleString()}
                              </td>
                            ))}
                            {(() => {
                              const first = trendData[0]?.mcVotes || 0;
                              const last = trendData[trendData.length - 1]?.mcVotes || 0;
                              const diff = last - first;
                              const pct = first > 0 ? ((diff / first) * 100).toFixed(1) : "0.0";
                              const isPos = diff >= 0;
                              return (
                                <>
                                  <td className={`text-end fw-extrabold ${isPos ? "text-success" : "text-danger"}`}>
                                    {isPos ? `+${diff.toLocaleString()}` : diff.toLocaleString()}
                                  </td>
                                  <td className="text-end">
                                    <span className={`badge ${isPos ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} fw-bold`}>
                                      {isPos ? `+${pct}%` : `${pct}%`}
                                    </span>
                                  </td>
                                </>
                              );
                            })()}
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Diagnóstico de Alternancia */}
                    <div className="p-3 bg-light rounded-3 border border-gray-200">
                      <span className="fs-11 text-muted fw-bold text-uppercase d-block mb-2">
                        Diagnóstico de Estabilidad Territorial
                      </span>
                      {(() => {
                        const r2018 = historicalResults[2018]?.ganador_partido;
                        const r2024 = historicalResults[2024]?.ganador_partido;
                        const panWins18 = r2018?.includes("PAN");
                        const panWins24 = r2024?.includes("PAN");

                        if (!r2018 || !r2024) {
                          return <span className="fs-13 text-muted">Datos insuficientes para determinar alternancia completa.</span>;
                        }

                        if (panWins18 && panWins24) {
                          return (
                            <div className="alert alert-success d-flex align-items-center gap-2 mb-0 py-2 fs-13 fw-bold">
                              <i className="ri-shield-check-fill fs-18"></i>
                              Bastión Retenido: La coalición del PAN retuvo este territorio tanto en 2018 como en 2024.
                            </div>
                          );
                        } else if (!panWins18 && !panWins24) {
                          return (
                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 fs-13 fw-bold">
                              <i className="ri-alert-fill fs-18"></i>
                              Territorio Opositor Consolidado: Ganado por la oposición en ambos ciclos.
                            </div>
                          );
                        } else if (panWins18 && !panWins24) {
                          return (
                            <div className="alert alert-warning d-flex align-items-center gap-2 mb-0 py-2 fs-13 fw-bold">
                              <i className="ri-swap-line fs-18"></i>
                              Alternancia a la Oposición: Ganado por el PAN en 2018 y cedido en 2024.
                            </div>
                          );
                        } else {
                          return (
                            <div className="alert alert-info d-flex align-items-center gap-2 mb-0 py-2 fs-13 fw-bold">
                              <i className="ri-arrow-up-circle-fill fs-18"></i>
                              Territorio Recuperado: Recuperado por el PAN en 2024.
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}

                {activeTab === "secciones" && baseBoundary !== "secciones" && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-extrabold text-dark text-uppercase fs-13 mb-0">
                        Matriz de Secciones Electorales ({constituentSections.length})
                      </h6>
                      <div className="input-group input-group-sm" style={{ maxWidth: "220px" }}>
                        <span className="input-group-text bg-white border-end-0">
                          <i className="ri-search-line text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="Buscar sección..."
                          value={sectionFilter}
                          onChange={(e) => setSectionFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: "320px", overflowY: "auto" }}>
                      <table className="table table-sm table-hover align-middle fs-12 mb-0">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>Sección</th>
                            <th>Ganador {modalYear}</th>
                            <th className="text-end">Votos Ganador</th>
                            <th className="text-end">% Ganador</th>
                            <th className="text-end">Margen</th>
                            <th className="text-center">Competitividad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSections.map((s) => {
                            const pColor = getPartyColor(s.ganador_partido);
                            const margin = s.margen_victoria_pct || 0;
                            let statusBadge = <span className="badge bg-success">Bastión</span>;
                            if (margin < 5) {
                              statusBadge = <span className="badge bg-warning text-dark">Disputada</span>;
                            } else if (margin < 15) {
                              statusBadge = <span className="badge bg-info text-dark">Favorable</span>;
                            }

                            return (
                              <tr key={s.seccion}>
                                <td className="fw-extrabold text-dark">#{s.seccion}</td>
                                <td>
                                  <span
                                    className="d-inline-block px-2 py-0.5 rounded text-white fw-bold fs-11"
                                    style={{ backgroundColor: pColor }}
                                  >
                                    {s.ganador_partido}
                                  </span>
                                </td>
                                <td className="text-end fw-semibold">
                                  {Number(s.ganador_votos || 0).toLocaleString()}
                                </td>
                                <td className="text-end fw-bold">{s.ganador_pct}%</td>
                                <td className="text-end fw-bold text-primary">+{margin}%</td>
                                <td className="text-center">{statusBadge}</td>
                              </tr>
                            );
                          })}
                          {filteredSections.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center text-muted py-3">
                                No se encontraron secciones con el criterio de búsqueda.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer del Modal */}
          <div className="modal-footer bg-light border-0 py-2 px-4 d-flex justify-content-between">
            <span className="text-muted fs-11">
              <i className="ri-information-line me-1"></i> Análisis electoral soberano SentinelIQ · INE Guanajuato
            </span>
            <button type="button" className="btn btn-secondary btn-sm fw-bold px-4" onClick={onClose}>
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerritorialDetailModal;
