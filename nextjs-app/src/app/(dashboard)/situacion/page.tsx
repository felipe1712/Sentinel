"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SemaforoCard from "@/components/velzon/SemaforoCard";
import SeverityBadge from "@/components/velzon/SeverityBadge";
import api from "@/lib/api";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

// Dynamically import SituacionalMap
const SituacionalMap = dynamic(
  () => import("@/components/velzon/SituacionalMap"),
  { ssr: false, loading: () => <div className="p-4 text-center text-dark fw-bold fs-14">Cargando Mapa del Estado...</div> }
);

export default function SituacionPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [events, setEvents] = useState<any[]>([]);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);

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
    <div className="pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-1 shadow-sm">
            {stateCfg.name} · Soberana
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Centro de Inteligencia Situacional
          </h4>
          <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
            Vista general estratégica para la toma de decisiones · {stateCfg.name}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/situacion/ejecutiva" className="btn btn-outline-primary btn-sm fw-bold">
            <i className="ri-user-star-line me-1"></i> Vista Gobernador
          </Link>
          <Link href="/briefing" className="btn btn-primary btn-sm fw-bold shadow-sm">
            <i className="ri-file-list-3-line me-1"></i> Briefing Matutino (05:30)
          </Link>
        </div>
      </div>

      {/* Grid 4 Cuadrantes Modo Claro Dinámico */}
      <div className="row g-4">
        {/* Cuadrante 1: Semáforos por Área */}
        <div className="col-lg-6">
          <div className="card bg-white border-0 shadow-sm h-100 rounded-3">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                1. Semáforos de Gobernabilidad y Seguridad ({stateCfg.shortName})
              </h6>
            </div>
            <div className="card-body p-4 bg-white">
              <SemaforoCard
                area={`Seguridad Pública & Movilidad (${stateCfg.shortName})`}
                nivel="ALERTA PREVENTIVA"
                color="danger"
                mensaje={stateCfg.prioridades[0]?.descripcion || "Operativo especial vial y patrullaje de agilidad."}
                tendencia="subiendo"
              />
              <SemaforoCard
                area="Protección Civil & Clima"
                nivel="VIGILANCIA ORDINARIA"
                color="warning"
                mensaje={stateCfg.prioridades[1]?.descripcion || "Monitoreo pluvial e hidrológico preventivo."}
                tendencia="estable"
              />
              <SemaforoCard
                area="Gobernabilidad & Diálogo"
                nivel="OPERACIÓN NORMAL"
                color="success"
                mensaje={stateCfg.prioridades[2]?.descripcion || "Mesas de trabajo y concertación parlamentaria activas."}
                tendencia="estable"
              />
            </div>
          </div>
        </div>

        {/* Cuadrante 2: Mapa Situacional Interactivo Claro */}
        <div className="col-lg-6">
          <div className="card bg-white border-0 shadow-sm h-100 overflow-hidden rounded-3">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                2. Mapa de Calor Municipal ({stateCfg.shortName})
              </h6>
            </div>
            <div className="card-body p-0 position-relative bg-white">
              <SituacionalMap />
            </div>
          </div>
        </div>

        {/* Cuadrante 3: Alertas Prioritarias Modo Claro */}
        <div className="col-lg-6">
          <div className="card bg-white border-0 shadow-sm h-100 rounded-3">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                3. Alertas de Severidad Recientes
              </h6>
            </div>
            <div className="card-body p-0 bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light text-dark border-bottom">
                    <tr>
                      <th className="text-dark fw-bold">Severidad</th>
                      <th className="text-dark fw-bold">Incidente</th>
                      <th className="text-dark fw-bold">Municipio</th>
                      <th className="text-dark fw-bold">Relevancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length > 0 ? (
                      events.map((ev) => (
                        <tr key={ev.id}>
                          <td><SeverityBadge severity={ev.severity} /></td>
                          <td className="fw-bold fs-13 text-dark" style={{ color: "#0f172a" }}>{ev.title}</td>
                          <td className="fs-12 text-dark fw-semibold" style={{ color: "#334155" }}>{ev.municipio || stateCfg.capital}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary fw-bold">
                              {ev.political_relevance || 8}/10
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-dark fw-bold fs-13">
                          No hay alertas críticas en las últimas 24 horas. Operación normal en los {stateCfg.totalMunicipios} municipios.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Cuadrante 4: Puntos del Briefing Matutino Modo Claro */}
        <div className="col-lg-6">
          <div className="card bg-white border-0 shadow-sm h-100 rounded-3">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                4. Puntos Clave del Briefing Matutino
              </h6>
              <span className="badge bg-success text-white fw-bold shadow-sm">Generado 05:30 AM</span>
            </div>
            <div className="card-body p-4 bg-white">
              <div className="mb-3 p-3 bg-light rounded-3 border border-gray-200 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-extrabold fs-14 text-primary mb-0" style={{ color: "#1e40af" }}>
                    {stateCfg.prioridades[0]?.titulo || "Operativo de agilidad vial"}
                  </h6>
                  <span className="badge bg-danger text-white fw-bold fs-10">Atención Inmediata</span>
                </div>
                <p className="fs-13 text-dark fw-semibold mb-0" style={{ color: "#0f172a" }}>
                  {stateCfg.prioridades[0]?.descripcion}
                </p>
              </div>

              <div className="p-3 bg-light rounded-3 border border-gray-200 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-extrabold fs-14 text-primary mb-0" style={{ color: "#1e40af" }}>
                    {stateCfg.prioridades[2]?.titulo || "Gestión de proyectos estratégicos"}
                  </h6>
                  <span className="badge bg-primary text-white fw-bold fs-10">Atención Estratégica</span>
                </div>
                <p className="fs-13 text-dark fw-semibold mb-0" style={{ color: "#0f172a" }}>
                  {stateCfg.prioridades[2]?.descripcion}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
