"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SemaforoCard from "@/components/velzon/SemaforoCard";
import api from "@/lib/api";

// Dynamically import SituacionalMap for Projector View
const SituacionalMap = dynamic(
  () => import("@/components/velzon/SituacionalMap"),
  { ssr: false, loading: () => <div className="p-5 text-center text-muted fs-16">Cargando Mapa de Calor de Querétaro...</div> }
);

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
      className={`min-vh-100 pt-4 pt-md-5 mt-2 px-3 px-md-4 px-lg-5 pb-5 ${
        isCrisis ? "bg-danger-subtle text-danger-emphasis" : "bg-dark text-white"
      }`}
      style={{ fontSize: "1.15rem", maxWidth: "1600px", margin: "0 auto" }}
    >
      {/* Header Proyector con Espaciado Superior Generoso */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-bottom border-secondary pb-4 gap-3">
        <div>
          <span className="badge bg-primary px-3 py-2 fs-13 text-uppercase fw-bold mb-2 shadow-sm">
            SALA DE GABINETE DE GOBIERNO · ESTADO DE QUERÉTARO
          </span>
          <h2 className="fw-extrabold text-white mb-0 fs-28">
            Monitoreo Estratégico en Tiempo Real
          </h2>
        </div>
        <div className="text-md-end pt-1">
          <div className="fs-13 text-muted text-uppercase fw-semibold mb-1">Nivel de Alerta General</div>
          <span className={`badge fs-16 px-4 py-2 shadow ${isCrisis ? "bg-danger text-white" : "bg-warning text-dark"}`}>
            {isCrisis ? "CRISIS ACTIVA (CTRL+ALT+C)" : snapshot?.alert_level || "ALERTA PREVENTIVA"}
          </span>
        </div>
      </div>

      {/* Layout 2 Columnas Proyector */}
      <div className="row g-4 mb-5">
        {/* Izquierda (60%): Mapa Situacional Interactivo */}
        <div className="col-lg-7">
          <div className="card bg-black border-secondary h-100 overflow-hidden shadow-lg">
            <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
              <h4 className="card-title mb-0 fw-bold fs-16 text-white">
                <i className="ri-map-pin-2-fill text-danger me-2"></i> Mapa de Calor Querétaro
              </h4>
              <span className="badge bg-primary-subtle text-primary fs-11">CartoDB Dark · En Vivo</span>
            </div>
            <div className="card-body p-0 position-relative">
              <SituacionalMap />
            </div>
          </div>
        </div>

        {/* Derecha (40%): Semáforos por Ramo */}
        <div className="col-lg-5">
          <div className="card bg-dark border-secondary h-100 shadow-lg">
            <div className="card-header bg-secondary-subtle border-secondary py-3">
              <h4 className="card-title mb-0 fw-bold fs-18 text-body">Semáforos por Ramo Gubernamental</h4>
            </div>
            <div className="card-body p-4">
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
