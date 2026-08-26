"use client";

import React from "react";
import { BaseLayerType } from "@/lib/electoralTypes";

interface LayerControlProps {
  baseBoundary: BaseLayerType;
  onSelectBaseBoundary: (layer: BaseLayerType) => void;
  activeEventLayers: Record<string, boolean>;
  onToggleEventLayer: (layer: string) => void;
  tileProvider: "osm" | "carto" | "satellite";
  onSelectTileProvider: (provider: "osm" | "carto" | "satellite") => void;
}

export const LayerControlPanel: React.FC<LayerControlProps> = ({
  baseBoundary,
  onSelectBaseBoundary,
  activeEventLayers,
  onToggleEventLayer,
  tileProvider,
  onSelectTileProvider,
}) => {
  return (
    <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
      <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
        <h6 className="card-title mb-0 fw-extrabold text-dark fs-14" style={{ color: "#0f172a" }}>
          <i className="ri-stack-line text-primary me-2"></i> Gestor de Capas
        </h6>
        <span className="badge bg-primary text-white fs-10 fw-bold">GIS Engine</span>
      </div>

      <div className="card-body p-3 bg-white">
        {/* 1. Capa Base Geográfica */}
        <div className="mb-3">
          <label className="form-label text-dark fw-bold fs-12 text-uppercase mb-2">
            1. Polígonos Electorales INE
          </label>
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn btn-sm fw-bold ${baseBoundary === "secciones" ? "btn-primary text-white shadow-sm" : "btn-outline-secondary"}`}
              onClick={() => onSelectBaseBoundary("secciones")}
            >
              Secciones
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-bold ${baseBoundary === "municipios" ? "btn-primary text-white shadow-sm" : "btn-outline-secondary"}`}
              onClick={() => onSelectBaseBoundary("municipios")}
            >
              Municipios
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-bold ${baseBoundary === "distritos_locales" ? "btn-primary text-white shadow-sm" : "btn-outline-secondary"}`}
              onClick={() => onSelectBaseBoundary("distritos_locales")}
            >
              Dtto. Local
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-bold ${baseBoundary === "distritos_federales" ? "btn-primary text-white shadow-sm" : "btn-outline-secondary"}`}
              onClick={() => onSelectBaseBoundary("distritos_federales")}
            >
              Dtto. Fed.
            </button>
          </div>
        </div>

        {/* 2. Capas Dinámicas de Eventos en Tiempo Real */}
        <div className="mb-3">
          <label className="form-label text-dark fw-bold fs-12 text-uppercase mb-2">
            2. Capas Dinámicas / Eventos
          </label>
          <div className="d-flex flex-column gap-2">
            <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 pe-1">
              <label className="form-check-label text-dark fw-bold fs-13 cursor-pointer d-flex align-items-center" htmlFor="layer-seguridad">
                <span className="badge bg-danger text-white me-2">🚨</span> Incidentes de Seguridad
              </label>
              <input
                className="form-check-input ms-0 cursor-pointer"
                type="checkbox"
                id="layer-seguridad"
                checked={!!activeEventLayers["seguridad"]}
                onChange={() => onToggleEventLayer("seguridad")}
              />
            </div>

            <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 pe-1">
              <label className="form-check-label text-dark fw-bold fs-13 cursor-pointer d-flex align-items-center" htmlFor="layer-proteccion">
                <span className="badge bg-warning text-dark me-2">🌧️</span> Protección Civil & Clima
              </label>
              <input
                className="form-check-input ms-0 cursor-pointer"
                type="checkbox"
                id="layer-proteccion"
                checked={!!activeEventLayers["proteccion_civil"]}
                onChange={() => onToggleEventLayer("proteccion_civil")}
              />
            </div>

            <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 pe-1">
              <label className="form-check-label text-dark fw-bold fs-13 cursor-pointer d-flex align-items-center" htmlFor="layer-vialidad">
                <span className="badge bg-info text-white me-2">🚗</span> Tránsito & Vialidad
              </label>
              <input
                className="form-check-input ms-0 cursor-pointer"
                type="checkbox"
                id="layer-vialidad"
                checked={!!activeEventLayers["vialidad"]}
                onChange={() => onToggleEventLayer("vialidad")}
              />
            </div>

            <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 pe-1">
              <label className="form-check-label text-dark fw-bold fs-13 cursor-pointer d-flex align-items-center" htmlFor="layer-agenda">
                <span className="badge bg-primary text-white me-2">🏛️</span> Agenda Política & Giras
              </label>
              <input
                className="form-check-input ms-0 cursor-pointer"
                type="checkbox"
                id="layer-agenda"
                checked={!!activeEventLayers["agenda_politica"]}
                onChange={() => onToggleEventLayer("agenda_politica")}
              />
            </div>
          </div>
        </div>

        {/* 3. Mapa Base (Open Source / Sin Costo) */}
        <div>
          <label className="form-label text-dark fw-bold fs-12 text-uppercase mb-2">
            3. Mapa Base (Libre de Costo)
          </label>
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn btn-sm fw-bold ${tileProvider === "carto" ? "btn-dark text-white shadow-sm" : "btn-outline-secondary"}`}
              onClick={() => onSelectTileProvider("carto")}
            >
              Carto Positron
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-bold ${tileProvider === "osm" ? "btn-dark text-white shadow-sm" : "btn-outline-secondary"}`}
              onClick={() => onSelectTileProvider("osm")}
            >
              OpenStreetMap
            </button>
            <button
              type="button"
              className={`btn btn-sm fw-bold ${tileProvider === "satellite" ? "btn-dark text-white shadow-sm" : "btn-outline-secondary"}`}
              onClick={() => onSelectTileProvider("satellite")}
            >
              Satélite ESRI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerControlPanel;
