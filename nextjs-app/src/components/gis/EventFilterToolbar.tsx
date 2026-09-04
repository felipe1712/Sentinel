"use client";

import React from "react";
import { ChoroplethMode } from "@/lib/electoralTypes";

interface EventFilterToolbarProps {
  selectedYear: number;
  onSelectYear: (year: number) => void;
  electionType: "gubernatura" | "diputaciones";
  onSelectElectionType: (type: "gubernatura" | "diputaciones") => void;
  choroplethMode: ChoroplethMode;
  onSelectChoroplethMode: (mode: ChoroplethMode) => void;
  selectedMunicipio: number | null;
  onSelectMunicipio: (m: number | null) => void;
  municipiosList: { id: number; nombre: string }[];
  onOpenUploadModal: () => void;
  onOpenSwingModal: () => void;
}

export const EventFilterToolbar: React.FC<EventFilterToolbarProps> = ({
  selectedYear,
  onSelectYear,
  electionType,
  onSelectElectionType,
  choroplethMode,
  onSelectChoroplethMode,
  selectedMunicipio,
  onSelectMunicipio,
  municipiosList,
  onOpenUploadModal,
  onOpenSwingModal,
}) => {
  return (
    <div className="card bg-white border-0 shadow-sm rounded-3 mb-3">
      <div className="card-body p-3 bg-white">
        <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3 flex-wrap">
          {/* Selector de Tipo de Elección */}
          <div className="d-flex align-items-center gap-2">
            <span className="fs-12 text-dark fw-extrabold text-uppercase text-nowrap">
              <i className="ri-government-line text-primary me-1"></i> Elección:
            </span>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm fw-bold ${electionType === "gubernatura" ? "btn-primary text-white shadow-sm" : "btn-outline-primary"}`}
                onClick={() => onSelectElectionType("gubernatura")}
              >
                🏛️ Gubernatura
              </button>
              <button
                type="button"
                className={`btn btn-sm fw-bold ${electionType === "diputaciones" ? "btn-primary text-white shadow-sm" : "btn-outline-primary"}`}
                onClick={() => onSelectElectionType("diputaciones")}
              >
                🗳️ Diputaciones
              </button>
            </div>
          </div>

          {/* Selector de Proceso Electoral (Años) */}
          <div className="d-flex align-items-center gap-2">
            <span className="fs-12 text-dark fw-extrabold text-uppercase text-nowrap">
              <i className="ri-calendar-check-line text-primary me-1"></i> Proceso:
            </span>
            <div className="btn-group" role="group">
              {[2024, 2018].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  className={`btn btn-sm fw-bold ${selectedYear === yr ? "btn-primary text-white shadow-sm" : "btn-outline-primary"}`}
                  onClick={() => onSelectYear(yr)}
                >
                  {yr}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-info fw-bold text-nowrap"
              onClick={onOpenSwingModal}
              title="Comparativa y Swing entre elecciones"
            >
              <i className="ri-swap-line me-1"></i> Comparar / Swing
            </button>
          </div>

          {/* Selector de Modo de Visualización (Choropleth) */}
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: "260px" }}>
            <span className="fs-12 text-dark fw-extrabold text-uppercase text-nowrap">
              <i className="ri-palette-line text-primary me-1"></i> Métrica:
            </span>
            <select
              className="form-select form-select-sm bg-white text-dark fw-bold border-gray-300 fs-13"
              value={choroplethMode}
              onChange={(e) => onSelectChoroplethMode(e.target.value as ChoroplethMode)}
            >
              <option value="ganador">🏆 Partido / Coalición Ganador</option>
              <option value="porcentaje_ganador">📊 % de Votación del Ganador</option>
              <option value="participacion">🗳️ % Participación Ciudadana</option>
              <option value="margen_victoria">⚔️ Margen de Victoria (Competitividad)</option>
              <option value="swing">🔄 Mapa de Swing / Alternancia</option>
            </select>
          </div>

          {/* Filtro por Municipio (Zoom Directo) */}
          <div className="d-flex align-items-center gap-2">
            <span className="fs-12 text-dark fw-extrabold text-uppercase text-nowrap">
              <i className="ri-map-pin-line text-primary me-1"></i> Municipio:
            </span>
            <select
              className="form-select form-select-sm bg-white text-dark fw-bold border-gray-300 fs-13"
              value={selectedMunicipio || ""}
              onChange={(e) => onSelectMunicipio(e.target.value ? Number(e.target.value) : null)}
              style={{ minWidth: "180px" }}
            >
              <option value="">Todo el Estado (46 Municipios)</option>
              {municipiosList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Cargar Datos CSV */}
          <div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary fw-bold text-nowrap"
              onClick={onOpenUploadModal}
            >
              <i className="ri-file-upload-line me-1"></i> Cargar CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilterToolbar;
