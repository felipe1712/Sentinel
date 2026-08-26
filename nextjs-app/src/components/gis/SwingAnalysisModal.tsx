"use client";

import React, { useState } from "react";
import { getPartyColor } from "@/lib/gisColors";

interface SwingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySwing: (year1: number, year2: number) => void;
  electoralCache: Record<string, Record<string, any>>;
}

export const SwingAnalysisModal: React.FC<SwingModalProps> = ({
  isOpen,
  onClose,
  onApplySwing,
  electoralCache,
}) => {
  const [year1, setYear1] = useState(2021);
  const [year2, setYear2] = useState(2024);

  if (!isOpen) return null;

  const availableYears = Object.keys(electoralCache).map(Number).sort((a, b) => a - b);
  const data1 = electoralCache[String(year1)] || {};
  const data2 = electoralCache[String(year2)] || {};

  // Calcular secciones con alternancia entre ambos años
  let totalCompared = 0;
  let alternanciasCount = 0;
  const partyFlips: Record<string, number> = {};

  Object.keys(data1).forEach((seccion) => {
    if (data2[seccion]) {
      totalCompared++;
      const g1 = data1[seccion].ganador_partido;
      const g2 = data2[seccion].ganador_partido;
      if (g1 !== g2) {
        alternanciasCount++;
        const key = `${g1} ➔ ${g2}`;
        partyFlips[key] = (partyFlips[key] || 0) + 1;
      }
    }
  });

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-white border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white p-4">
            <div>
              <span className="badge bg-white text-dark fw-bold text-uppercase fs-11 mb-1">
                GeoAnálisis Comparativo
              </span>
              <h5 className="modal-title fw-extrabold text-white mb-0">Análisis de Swing y Alternancia Política</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white">
            <p className="text-dark fs-13 mb-3 fw-semibold" style={{ color: "#334155" }}>
              Selecciona dos procesos electorales para comparar el comportamiento sección por sección y detectar alternancias o cambios de margen.
            </p>

            {/* Selectores de Años */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label text-dark fw-bold fs-12 text-uppercase">Elección Base (Año 1):</label>
                <select
                  className="form-select bg-white text-dark fw-bold border-gray-300 fs-14"
                  value={year1}
                  onChange={(e) => setYear1(Number(e.target.value))}
                >
                  <option value={2018}>Proceso Electoral 2018</option>
                  <option value={2021}>Proceso Electoral 2021</option>
                  <option value={2024}>Proceso Electoral 2024</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-dark fw-bold fs-12 text-uppercase">Elección a Comparar (Año 2):</label>
                <select
                  className="form-select bg-white text-dark fw-bold border-gray-300 fs-14"
                  value={year2}
                  onChange={(e) => setYear2(Number(e.target.value))}
                >
                  <option value={2024}>Proceso Electoral 2024</option>
                  <option value={2021}>Proceso Electoral 2021</option>
                  <option value={2018}>Proceso Electoral 2018</option>
                </select>
              </div>
            </div>

            {/* Tarjetas Resumen de Comparativa */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="fs-11 text-muted fw-bold text-uppercase d-block">Secciones Comparadas</span>
                  <h4 className="fw-extrabold text-primary mb-0">{totalCompared || "Pendiente"}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="fs-11 text-muted fw-bold text-uppercase d-block">Alternancias Registradas</span>
                  <h4 className="fw-extrabold text-danger mb-0">{alternanciasCount}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="fs-11 text-muted fw-bold text-uppercase d-block">% de Rotación</span>
                  <h4 className="fw-extrabold text-dark mb-0">
                    {totalCompared > 0 ? `${((alternanciasCount / totalCompared) * 100).toFixed(1)}%` : "0%"}
                  </h4>
                </div>
              </div>
            </div>

            {/* Desglose de Alternancias */}
            {Object.keys(partyFlips).length > 0 && (
              <div>
                <span className="fs-12 text-dark fw-extrabold text-uppercase d-block mb-2">
                  Transiciones Partidistas Más Frecuentes
                </span>
                <div className="d-flex flex-wrap gap-2">
                  {Object.entries(partyFlips).map(([trans, count]) => (
                    <span key={trans} className="badge bg-secondary-subtle text-dark p-2 fs-12 fw-bold border">
                      {trans}: <strong className="text-primary ms-1">{count} secciones</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer bg-light p-3">
            <button type="button" className="btn btn-outline-secondary btn-sm fw-bold" onClick={onClose}>
              Cerrar
            </button>
            <button
              type="button"
              className="btn btn-dark btn-sm fw-bold shadow-sm"
              onClick={() => {
                onApplySwing(year1, year2);
                onClose();
              }}
            >
              <i className="ri-map-2-line me-1"></i> Visualizar Swing en el Mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwingAnalysisModal;
