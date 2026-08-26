"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";
import { BaseLayerType, ChoroplethMode, ElectoralResult, GisEventItem } from "@/lib/electoralTypes";
import LayerControlPanel from "@/components/gis/LayerControlPanel";
import EventFilterToolbar from "@/components/gis/EventFilterToolbar";
import ElectoralStatsPanel from "@/components/gis/ElectoralStatsPanel";
import CsvUploaderModal from "@/components/gis/CsvUploaderModal";
import SwingAnalysisModal from "@/components/gis/SwingAnalysisModal";

// Importar dinámicamente WebGisMap sin SSR
const WebGisMap = dynamic(() => import("@/components/gis/WebGisMap"), {
  ssr: false,
  loading: () => (
    <div className="p-5 text-center bg-white rounded-3 shadow-sm border">
      <div className="spinner-border text-primary mb-2" role="status"></div>
      <p className="fw-bold text-dark fs-14">Cargando Visor WebGIS Electoral...</p>
    </div>
  ),
});

const MUNICIPIOS_GTO = [
  { id: 1, nombre: "Abasolo" },
  { id: 2, nombre: "Acámbaro" },
  { id: 3, nombre: "San Miguel de Allende" },
  { id: 4, nombre: "Apaseo el Alto" },
  { id: 5, nombre: "Apaseo el Grande" },
  { id: 7, nombre: "Celaya" },
  { id: 15, nombre: "Guanajuato (Capital)" },
  { id: 17, nombre: "Irapuato" },
  { id: 20, nombre: "León" },
  { id: 27, nombre: "Salamanca" },
  { id: 31, nombre: "San Francisco del Rincón" },
  { id: 37, nombre: "Silao de la Victoria" },
];

export default function GisElectoralPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());

  // Estados del WebGIS
  const [baseBoundary, setBaseBoundary] = useState<BaseLayerType>("secciones");
  const [choroplethMode, setChoroplethMode] = useState<ChoroplethMode>("ganador");
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMunicipio, setSelectedMunicipio] = useState<number | null>(null);
  const [tileProvider, setTileProvider] = useState<"osm" | "carto" | "satellite">("carto");

  // Capas activas de eventos
  const [activeEventLayers, setActiveEventLayers] = useState<Record<string, boolean>>({
    seguridad: true,
    proteccion_civil: true,
    vialidad: false,
    agenda_politica: false,
  });

  // Datos electorales cargados
  const [electoralCache, setElectoralCache] = useState<Record<string, Record<string, ElectoralResult>>>({});
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [selectedSectionResult, setSelectedSectionResult] = useState<ElectoralResult | null>(null);

  // Modales
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSwingModalOpen, setIsSwingModalOpen] = useState(false);
  const [swingYears, setSwingYears] = useState<{ year1: number; year2: number } | undefined>();

  useEffect(() => {
    setStateCfg(getStateConfig());

    // Cargar caché de resultados electorales
    fetch("/data/electoral_results_cache.json")
      .then((res) => res.json())
      .then((data) => setElectoralCache(data))
      .catch((err) => console.warn("Usando catálogo base de resultados electorales:", err));
  }, []);

  const handleToggleEventLayer = (layer: string) => {
    setActiveEventLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleSelectSection = (sectionProps: any, result: ElectoralResult | null) => {
    setSelectedSection(sectionProps);
    setSelectedSectionResult(result);
  };

  const handleApplyLoadedData = (newResults: ElectoralResult[]) => {
    const updated = { ...electoralCache };
    newResults.forEach((r) => {
      const yr = String(r.election_year);
      const sec = String(r.clave_seccion);
      if (!updated[yr]) updated[yr] = {};
      updated[yr][sec] = r;
    });
    setElectoralCache(updated);
  };

  const handleApplySwing = (year1: number, year2: number) => {
    setSwingYears({ year1, year2 });
    setChoroplethMode("swing");
  };

  return (
    <div className="pb-5">
      {/* Header de la Sección WebGIS */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            WebGIS Político-Electoral & Inteligencia Espacial · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Visor Geográfico Electoral de Guanajuato (gis-electoral)
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Cruce multidimensional de 3,357 secciones electorales, resultados históricos (2018-2024) y eventos en tiempo real.
          </p>
        </div>
      </div>

      {/* Barra de Filtros Superior */}
      <EventFilterToolbar
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        choroplethMode={choroplethMode}
        onSelectChoroplethMode={setChoroplethMode}
        selectedMunicipio={selectedMunicipio}
        onSelectMunicipio={setSelectedMunicipio}
        municipiosList={MUNICIPIOS_GTO}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenSwingModal={() => setIsSwingModalOpen(true)}
      />

      {/* Grid Principal: Gestor de Capas + Mapa Interactivo + Panel Lateral de Análisis */}
      <div className="row g-3">
        {/* Columna Izquierda: Gestor de Capas */}
        <div className="col-lg-3">
          <LayerControlPanel
            baseBoundary={baseBoundary}
            onSelectBaseBoundary={setBaseBoundary}
            activeEventLayers={activeEventLayers}
            onToggleEventLayer={handleToggleEventLayer}
            tileProvider={tileProvider}
            onSelectTileProvider={setTileProvider}
          />
        </div>

        {/* Columna Central: Visor del Mapa */}
        <div className="col-lg-6">
          <WebGisMap
            baseBoundary={baseBoundary}
            choroplethMode={choroplethMode}
            selectedYear={selectedYear}
            selectedMunicipio={selectedMunicipio}
            electoralCache={electoralCache}
            activeEventLayers={activeEventLayers}
            tileProvider={tileProvider}
            onSelectSection={handleSelectSection}
            swingYears={swingYears}
          />
        </div>

        {/* Columna Derecha: Panel de Estadísticas & Cruce de Inteligencia */}
        <div className="col-lg-3">
          <ElectoralStatsPanel
            selectedSection={selectedSection}
            sectionResult={selectedSectionResult}
            associatedEvents={[]}
            selectedYear={selectedYear}
            totalSectionsCount={3357}
            onClearSelection={() => {
              setSelectedSection(null);
              setSelectedSectionResult(null);
            }}
          />
        </div>
      </div>

      {/* Modales de Carga CSV y Swing */}
      <CsvUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleApplyLoadedData}
      />

      <SwingAnalysisModal
        isOpen={isSwingModalOpen}
        onClose={() => setIsSwingModalOpen(false)}
        onApplySwing={handleApplySwing}
        electoralCache={electoralCache}
      />
    </div>
  );
}
