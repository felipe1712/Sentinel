"use client";

import React, { useState, useEffect } from "react";
import SemaforoCard from "@/components/velzon/SemaforoCard";
import api from "@/lib/api";

export default function GabineteView() {
  const [isCrisis, setIsCrisis] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/cabinet/snapshot");
        setSnapshot(resp.data);
      } catch (e) {
        console.error("Error cargando gabinete:", e);
      }
    }
    load();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setIsCrisis((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`min-vh-100 p-4 ${
        isCrisis ? "bg-danger-subtle text-danger-emphasis" : "bg-dark text-white"
      }`}
      style={{ fontSize: "1.25rem" }}
    >
      {/* Header Proyector */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
        <div>
          <span className="badge bg-danger px-3 py-2 fs-14 text-uppercase">
            SALA DE GABINETE DE GOBIERNO · ESTADO DE QUERÉTARO
          </span>
          <h2 className="fw-bold mt-2 mb-0">
            Monitoreo Estratégico en Tiempo Real
          </h2>
        </div>
        <div className="text-end">
          <div className="fs-14 text-muted">Nivel de Alerta General</div>
          <span className={`badge fs-16 px-4 py-2 ${isCrisis ? "bg-danger" : "bg-warning text-dark"}`}>
            {isCrisis ? "CRISIS ACTIVA (CRTL+ALT+C)" : snapshot?.alert_level || "ALERTA PREVENTIVA"}
          </span>
        </div>
      </div>

      {/* Layout 2 Columnas Proyector */}
      <div className="row g-4">
        {/* Izquierda (60%): Mapa Situacional */}
        <div className="col-lg-7">
          <div className="card bg-black border-secondary h-100 min-vh-400 d-flex align-items-center justify-content-center">
            <div className="text-center p-4">
              <i className="ri-map-pin-2-line fs-64 text-primary mb-3"></i>
              <h3 className="fw-bold text-white mb-2">MAPA DE CALOR QUERÉTARO</h3>
              <p className="fs-16 text-muted mb-3">
                CartoDB Dark_All · R-Tree INEGI (Clave 22) Point-in-Polygon
              </p>
              <div className="d-flex justify-content-center gap-3">
                <span className="badge bg-danger fs-14 px-3 py-2">Santiago de Querétaro (12 evt)</span>
                <span className="badge bg-warning text-dark fs-14 px-3 py-2">El Marqués (7 evt)</span>
                <span className="badge bg-secondary fs-14 px-3 py-2">Corregidora (6 evt)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Derecha (40%): Semáforos + Puntos Clave */}
        <div className="col-lg-5">
          <div className="card bg-dark border-secondary h-100">
            <div className="card-header bg-secondary-subtle border-secondary">
              <h4 className="card-title mb-0 fw-bold fs-18">Semáforos por Ramo Gubernamental</h4>
            </div>
            <div className="card-body">
              <SemaforoCard
                area="Seguridad & Movilidad"
                nivel="ALERTA"
                color="danger"
                mensaje="Operativo de agilidad vial en Paseo 5 de Febrero y Bernardo Quintana."
              />
              <SemaforoCard
                area="Protección Civil"
                nivel="VIGILANCIA"
                color="warning"
                mensaje="Monitoreo pluvial en El Marqués y San Juan del Río."
              />
              <SemaforoCard
                area="Gobernabilidad"
                nivel="NORMAL"
                color="success"
                mensaje="Mesa de concertación de proyectos hídricos avanzando."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
