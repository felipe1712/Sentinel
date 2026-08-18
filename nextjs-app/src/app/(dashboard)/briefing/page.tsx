"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBriefing() {
      try {
        const resp = await api.get("/briefings/today");
        setBriefing(resp.data);
      } catch (err) {
        console.error("Error cargando briefing:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBriefing();
  }, []);

  return (
    <div className="container-fluid">
      {/* Title */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-dark pb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-danger px-3 py-2 fs-12 text-uppercase">
              Confidencial · Despacho del Gobernador
            </span>
            <span className="text-muted fs-13">Generado a las 05:30 AM</span>
          </div>
          <h3 className="fw-bold mt-2 mb-0">
            {briefing?.title || "Briefing Matutino Ejecutivo — Estado de Querétaro"}
          </h3>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
            <i className="ri-printer-line me-1"></i> Imprimir Memo
          </button>
          <button className="btn btn-primary btn-sm">
            <i className="ri-send-plane-line me-1"></i> Enviar al Gabinete
          </button>
        </div>
      </div>

      {/* 1. Resumen Ejecutivo */}
      <div className="card mb-4 border-start border-4 border-primary">
        <div className="card-header bg-body-tertiary">
          <h5 className="card-title mb-0 fw-bold text-uppercase fs-14">
            1. Resumen Ejecutivo de Inteligencia
          </h5>
        </div>
        <div className="card-body">
          <p className="fs-15 lh-base mb-0">
            {briefing?.executive_summary ||
              "Durante las últimas 24 horas en el Estado de Querétaro, la situación general de seguridad y gobernabilidad se mantiene bajo control estricto y seguimiento constante. Los operativos viales en la Zona Metropolitana de Querétaro (ZMQ) permitieron agilizar el tráfico en Paseo 5 de Febrero y Bernardo Quintana. Se registra un entorno favorable en el diálogo con la federación para el proyecto hídrico regional Batán."}
          </p>
        </div>
      </div>

      {/* 2. Cinco Puntos Clave */}
      <div className="card mb-4">
        <div className="card-header bg-body-tertiary">
          <h5 className="card-title mb-0 fw-bold text-uppercase fs-14">
            2. Cinco Puntos Clave de Atención Política
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {briefing?.key_points ? (
              briefing.key_points.map((pt: any, idx: number) => (
                <div key={idx} className="col-12">
                  <div className="p-3 rounded border border-dark bg-body-tertiary">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h6 className="fw-bold text-primary mb-0 fs-14">
                        {idx + 1}. {pt.titular}
                      </h6>
                      <span className="badge bg-danger-subtle text-danger fs-11">
                        Atención: {pt.atencion || "Alta"}
                      </span>
                    </div>
                    <p className="text-muted fs-13 mb-0">{pt.contexto}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted p-3">Cargando puntos clave...</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Narrativas en Movimiento & Temas a Vigilar */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-body-tertiary">
              <h5 className="card-title mb-0 fw-bold text-uppercase fs-14">
                3. Narrativas en Movimiento
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                  <span>Movilidad e infraestructura ZMQ (5 de Febrero)</span>
                  <span className="badge bg-danger">Tendencia ↑ (Alta)</span>
                </li>
                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                  <span>Proyectos Hídricos y Energía</span>
                  <span className="badge bg-warning text-dark">Tendencia → (Media)</span>
                </li>
                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                  <span>Operativo preventivo de lluvias</span>
                  <span className="badge bg-secondary">Tendencia ↓ (Baja)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-body-tertiary">
              <h5 className="card-title mb-0 fw-bold text-uppercase fs-14">
                4. Temas a Vigilar Hoy
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="ri-checkbox-blank-circle-fill text-warning me-2 fs-10"></i>
                  Sesión ordinaria del Congreso del Estado a las 10:00 hrs.
                </li>
                <li className="mb-2">
                  <i className="ri-checkbox-blank-circle-fill text-warning me-2 fs-10"></i>
                  Mesa de trabajo de infraestructura hídrica a las 12:30 hrs.
                </li>
                <li className="mb-0">
                  <i className="ri-checkbox-blank-circle-fill text-warning me-2 fs-10"></i>
                  Supervisión de vialidades e infraestructura en San Juan del Río.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Alertas Globales Integradas (world-intel-mcp) */}
      <div className="card border-info">
        <div className="card-header bg-info-subtle text-info-emphasis">
          <h5 className="card-title mb-0 fw-bold text-uppercase fs-14">
            5. Alertas Globales Integradas (world-intel-mcp)
          </h5>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4">
              <h6 className="text-uppercase text-muted fs-11">Actividad Sismológica</h6>
              <p className="fw-bold text-body fs-14 mb-0">Sismo 3.6 Cadereyta (Sin afectación)</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-uppercase text-muted fs-11">Índice Inestabilidad</h6>
              <p className="fw-bold text-success fs-14 mb-0">22/100 (Estable)</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-uppercase text-muted fs-11">Alertas Climáticas</h6>
              <p className="fw-bold text-warning fs-14 mb-0">Monitoreo Pluvial GDACS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
