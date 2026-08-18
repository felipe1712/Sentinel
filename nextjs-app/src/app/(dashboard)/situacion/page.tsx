"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SemaforoCard from "@/components/velzon/SemaforoCard";
import SeverityBadge from "@/components/velzon/SeverityBadge";
import api from "@/lib/api";

// Dynamically import SituacionalMap to avoid SSR Leaflet window error
const SituacionalMap = dynamic(
  () => import("@/components/velzon/SituacionalMap"),
  { ssr: false, loading: () => <div className="p-4 text-center text-muted">Cargando Mapa de Querétaro...</div> }
);

export default function SituacionPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [evResp, snapResp] = await Promise.all([
          api.get("/events?limit=5"),
          api.get("/cabinet/snapshot"),
        ]);
        setEvents(evResp.data);
        setSnapshot(snapResp.data);
      } catch (err) {
        console.error("Error cargando situación:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Centro de Inteligencia Situacional</h4>
          <p className="text-muted fs-13 mb-0">
            Vista general estratégica para la toma de decisiones · Estado de Querétaro
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/situacion/ejecutiva" className="btn btn-outline-primary btn-sm">
            <i className="ri-user-star-line me-1"></i> Vista Gobernador
          </Link>
          <Link href="/briefing" className="btn btn-primary btn-sm">
            <i className="ri-file-list-3-line me-1"></i> Briefing Matutino (05:30)
          </Link>
        </div>
      </div>

      {/* Grid 4 Cuadrantes */}
      <div className="row g-4">
        {/* Cuadrante 1: Semáforos por Área */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header border-bottom border-dark bg-body-tertiary">
              <h6 className="card-title mb-0 fw-bold">1. Semáforos de Gobernabilidad y Seguridad</h6>
            </div>
            <div className="card-body">
              <SemaforoCard
                area="Seguridad Pública & Movilidad ZMQ"
                nivel="ALERTA PREVENTIVA"
                color="danger"
                mensaje="Incidente vial e intervención en Paseo 5 de Febrero. Operativo PoEs activo."
                tendencia="subiendo"
              />
              <SemaforoCard
                area="Protección Civil & Clima"
                nivel="VIGILANCIA ORDINARIA"
                color="warning"
                mensaje="Monitoreo pluvial en El Marqués y San Juan del Río. Cauces bajo control."
                tendencia="estable"
              />
              <SemaforoCard
                area="Gobernabilidad & Congreso"
                nivel="OPERACIÓN NORMAL"
                color="success"
                mensaje="Mesa de diálogo parlamentario abierta sobre infraestructura regional y agua."
                tendencia="estable"
              />
            </div>
          </div>
        </div>

        {/* Cuadrante 2: Mapa Situacional Interactivo */}
        <div className="col-lg-6">
          <div className="card h-100 overflow-hidden shadow-sm">
            <div className="card-header border-bottom border-dark bg-body-tertiary d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0 fw-bold">2. Mapa de Calor Municipal (Querétaro)</h6>
              <span className="badge bg-success-subtle text-success fs-11">CartoDB Dark · En Vivo</span>
            </div>
            <div className="card-body p-0 position-relative">
              <SituacionalMap />
            </div>
          </div>
        </div>

        {/* Cuadrante 3: Alertas Prioritarias */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header border-bottom border-dark bg-body-tertiary">
              <h6 className="card-title mb-0 fw-bold">3. Alertas de Severidad Recientes</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Severidad</th>
                      <th>Incidente</th>
                      <th>Municipio</th>
                      <th>Relevancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length > 0 ? (
                      events.map((ev) => (
                        <tr key={ev.id}>
                          <td><SeverityBadge severity={ev.severity} /></td>
                          <td className="fw-medium fs-13">{ev.title}</td>
                          <td className="fs-12 text-muted">{ev.municipio || "ZMQ"}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary">
                              {ev.political_relevance || 8}/10
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-3 text-muted">
                          Cargando alertas más recientes...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Cuadrante 4: Puntos del Briefing Matutino */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header border-bottom border-dark bg-body-tertiary d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0 fw-bold">4. Puntos Clave del Briefing Matutino</h6>
              <span className="badge bg-success">Generado 05:30 AM</span>
            </div>
            <div className="card-body">
              <div className="mb-3 p-3 bg-body-tertiary rounded border border-dark">
                <div className="d-flex justify-content-between">
                  <h6 className="fw-bold fs-13 text-primary mb-1">
                    Operativo de movilidad en Paseo 5 de Febrero
                  </h6>
                  <span className="badge bg-danger-subtle text-danger">Atención Inmediata</span>
                </div>
                <p className="fs-12 text-muted mb-0">
                  Respuesta ágil de tránsito e infraestructura. Se sugiere reporte institucional antes de las 14:00 hrs.
                </p>
              </div>

              <div className="p-3 bg-body-tertiary rounded border border-dark">
                <div className="d-flex justify-content-between">
                  <h6 className="fw-bold fs-13 text-primary mb-1">
                    Gestión del proyecto hídrico Batán Agua para Todos
                  </h6>
                  <span className="badge bg-info-subtle text-info">Atención Estratégica</span>
                </div>
                <p className="fs-12 text-muted mb-0">
                  Avances positivos con dependencias federales para la viabilidad de financiamiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
