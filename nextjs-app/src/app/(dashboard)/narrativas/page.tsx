"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getStateConfig, StateConfig, NarrativaItem } from "@/lib/stateConfig";

export default function NarrativasPage() {
  const router = useRouter();
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [narratives, setNarratives] = useState<NarrativaItem[]>([]);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    setNarratives(cfg.narrativas);

    async function load() {
      try {
        const resp = await api.get("/narratives");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setNarratives(resp.data);
        }
      } catch (e) {
        console.warn(`Usando catálogo de narrativas soberanas de ${cfg.shortName}`);
      }
    }
    load();
  }, []);

  const handleGenerarDossier = (title: string) => {
    router.push(`/dossiers/nuevo?narrativa=${encodeURIComponent(title)}`);
  };

  return (
    <div className="pb-5 pt-4 pt-md-5 mt-2">
      {/* Header con Margen Generoso */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Inteligencia de Opinión Pública · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Tracking de Narrativas & Momentum Mediático
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Detección de temas emergentes en medios digitales, redes sociales y opinión pública local.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/dossiers/nuevo" className="btn btn-primary btn-sm fw-bold text-white shadow-sm">
            <i className="ri-file-add-line me-1"></i> Generar Dossier Personalizado
          </Link>
        </div>
      </div>

      {/* Tabla Modo Claro High Contrast */}
      <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
            Narrativas Activas en el {stateCfg.name}
          </h6>
          <span className="badge bg-primary text-white fs-11 fw-bold shadow-sm">Monitoreo 24h</span>
        </div>
        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-dark border-bottom">
                <tr>
                  <th className="text-dark fw-bold py-3 ps-4">Narrativa / Tema Estratégico</th>
                  <th className="text-dark fw-bold">Categoría</th>
                  <th className="text-dark fw-bold">Región</th>
                  <th className="text-dark fw-bold">Tendencia</th>
                  <th className="text-dark fw-bold">Volumen 24h</th>
                  <th className="text-dark fw-bold text-end pe-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {narratives.map((n) => (
                  <tr key={n.id || n.title} className="bg-white">
                    <td className="ps-4 py-3">
                      <h6 className="fw-extrabold mb-1 text-dark fs-14" style={{ color: "#0f172a" }}>
                        {n.title}
                      </h6>
                      <small className="text-dark fs-12 fw-medium" style={{ color: "#334155" }}>
                        {n.summary}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold fs-11">
                        {n.category || "General"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark fw-bold fs-11" style={{ color: "#0f172a" }}>
                        {n.region || stateCfg.shortName}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          n.trend === "subiendo"
                            ? "bg-danger text-white fw-bold"
                            : "bg-warning text-dark fw-bold"
                        }`}
                      >
                        {n.trend === "subiendo" ? "Subiendo ↑" : "Estable →"}
                      </span>
                    </td>
                    <td className="fw-extrabold text-dark fs-14" style={{ color: "#0f172a" }}>
                      {n.volume_24h || 150} menciones
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-primary btn-sm fw-bold text-white shadow-sm"
                        onClick={() => handleGenerarDossier(n.title)}
                      >
                        <i className="ri-file-text-line me-1"></i> Generar Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
