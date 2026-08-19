"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function NarrativasPage() {
  const router = useRouter();
  const [narratives, setNarratives] = useState<any[]>([
    {
      id: "n1",
      title: "Movilidad e Intervención Vial Paseo 5 de Febrero",
      summary: "Debate público y reportes sobre flujo vehicular, obras de conexión y operativos PoEs.",
      category: "Infraestructura & Movilidad",
      trend: "subiendo",
      volume_24h: 342,
      sentiment: "Neutral / Exigente",
      region: "ZMQ",
    },
    {
      id: "n2",
      title: "Proyecto Hídrico Batán Agua para Todos",
      summary: "Cobertura mediática sobre el acuerdo con CONAGUA y viabilidad de abastecimiento futuro.",
      category: "Agua & Medio Ambiente",
      trend: "estable",
      volume_24h: 218,
      sentiment: "Favorable",
      region: "Estatal",
    },
    {
      id: "n3",
      title: "Seguridad y Monitoreo en Autopista México - Querétaro (57)",
      summary: "Percepción ciudadana sobre patrullaje de la Guardia Nacional y tiempos de traslado.",
      category: "Seguridad Pública",
      trend: "subiendo",
      volume_24h: 189,
      sentiment: "Atención Requerida",
      region: "San Juan del Río / Sur",
    },
    {
      id: "n4",
      title: "Atracción de Inversión y Data Centers en El Marqués y Colón",
      summary: "Resonancia positiva sobre desarrollo tecnológico y generación de empleo especializado.",
      category: "Desarrollo Económico",
      trend: "subiendo",
      volume_24h: 145,
      sentiment: "Muy Favorable",
      region: "El Marqués / Colón",
    },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/narratives");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setNarratives(resp.data);
        }
      } catch (e) {
        console.warn("Usando catálogo de narrativas soberanas de Querétaro");
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
            Inteligencia de Opinión Pública · Estado de Querétaro
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
            Narrativas Activas en el Estado de Querétaro
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
                        {n.summary || n.description}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold fs-11">
                        {n.category || "General"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark fw-bold fs-11" style={{ color: "#0f172a" }}>
                        {n.region || "Querétaro"}
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
