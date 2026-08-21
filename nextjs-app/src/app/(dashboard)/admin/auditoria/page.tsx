"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

interface AuditRecord {
  id: string;
  state_id: string;
  user_id?: string;
  query_type: "briefing" | "dossier" | "alerta" | "osint" | "narrativa" | "clasificacion";
  prompt_text: string;
  model: string;
  tools_used?: string[];
  sources: {
    name: string;
    url: string;
    type: "federal" | "osint" | "telegram" | "world" | "interno";
    excerpt: string;
    credibility: "oficial" | "verificado" | "no_verificado";
    retrieved_at: string;
  }[];
  confidence_score: number;
  hallucination_flag: boolean;
  hallucination_note?: string;
  tokens_used: number;
  latency_ms: number;
  result_summary?: string;
  created_at: string;
}

const DEFAULT_AUDIT_DATA: AuditRecord[] = [
  {
    id: "aud_01",
    state_id: "qro",
    query_type: "briefing",
    prompt_text: "Generación del Briefing Matutino Ejecutivo de las 05:30 AM para el Despacho del Gobernador.",
    model: "claude-sonnet-4-6",
    tools_used: ["intel_earthquakes", "intel_disaster_alerts", "intel_unrest_events"],
    sources: [
      {
        name: "SESNSP — Incidencia Delictiva Estatal",
        url: "sesnsp.gob.mx/datos-abiertos",
        type: "federal",
        excerpt: "Incidencia delictiva dentro de los rangos de seguridad estatal.",
        credibility: "oficial",
        retrieved_at: new Date().toISOString(),
      },
      {
        name: "Base Interna PoEs / C4 Municipal",
        url: "https://qro.sentineliq.com.mx/api/events",
        type: "interno",
        excerpt: "Corte de 12 incidentes procesados en las últimas 24 horas.",
        credibility: "oficial",
        retrieved_at: new Date().toISOString(),
      },
    ],
    confidence_score: 92,
    hallucination_flag: false,
    tokens_used: 680,
    latency_ms: 1240,
    result_summary: "Durante las últimas 24 horas en el Estado, la situación general se mantiene bajo control estricto...",
    created_at: new Date().toISOString(),
  },
  {
    id: "aud_02",
    state_id: "gto",
    query_type: "osint",
    prompt_text: "Consulta no verificada de fuentes externas sin respaldo oficial.",
    model: "claude-sonnet-4-6",
    tools_used: ["argos_ingestor"],
    sources: [
      {
        name: "Canal no verificado de redes sociales",
        url: "https://argos.sentineliq.com.mx/feed",
        type: "telegram",
        excerpt: "Reporte ciudadano sin confirmar sobre disturbio en vía pública.",
        credibility: "no_verificado",
        retrieved_at: new Date().toISOString(),
      },
    ],
    confidence_score: 40,
    hallucination_flag: true,
    hallucination_note: "Confianza insuficiente en las fuentes consultadas",
    tokens_used: 410,
    latency_ms: 890,
    result_summary: "Alerta preventiva generada con base en fuente única no verificada...",
    created_at: new Date().toISOString(),
  },
];

export default function QueryAuditPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [audits, setAudits] = useState<AuditRecord[]>(DEFAULT_AUDIT_DATA);
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);
  const [filterType, setFilterType] = useState<string>("TODOS");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);

    async function loadAudits() {
      try {
        const resp = await api.get("/admin/query-audit");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setAudits(resp.data);
        }
      } catch (e) {
        console.warn("Usando registro de auditoría soberano predeterminado");
      }
    }
    loadAudits();
  }, []);

  const totalHoy = audits.length;
  const verificadas = audits.filter((a) => a.confidence_score >= 75).length;
  const advertencias = audits.filter((a) => a.confidence_score >= 50 && a.confidence_score < 75).length;
  const sinFuente = audits.filter((a) => !a.sources || a.sources.length === 0).length;
  const avgConfidence = audits.length > 0 ? Math.round(audits.reduce((acc, a) => acc + a.confidence_score, 0) / audits.length) : 0;
  const hallucinationCount = audits.filter((a) => a.hallucination_flag).length;

  const filtered = audits.filter((a) => {
    const matchType = filterType === "TODOS" || a.query_type === filterType;
    const matchSearch =
      a.prompt_text.toLowerCase().includes(search.toLowerCase()) ||
      (a.result_summary && a.result_summary.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="pb-5 pt-4 pt-md-5 mt-2">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-danger text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Auditoría de Consultas & Trazabilidad Claude AI · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Módulo de Auditoría de Consultas
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Trazabilidad completa de fuentes consultadas, puntuación de confianza y detección de alucinaciones.
          </p>
        </div>
        <div>
          <span className="badge bg-warning text-dark fs-12 px-3 py-2 fw-bold shadow-sm">
            <i className="ri-shield-flash-line me-1"></i> {hallucinationCount} Alertas de Alucinación Hoy
          </span>
        </div>
      </div>

      {/* 5 Tarjetas Métricas */}
      <div className="row g-3 mb-4">
        <div className="col-md">
          <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-primary">
            <span className="fs-11 text-muted fw-bold text-uppercase">Consultas Hoy</span>
            <h4 className="fw-extrabold mb-0 text-primary">{totalHoy}</h4>
          </div>
        </div>
        <div className="col-md">
          <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-success">
            <span className="fs-11 text-muted fw-bold text-uppercase">Verificadas (≥75)</span>
            <h4 className="fw-extrabold mb-0 text-success">{verificadas}</h4>
          </div>
        </div>
        <div className="col-md">
          <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-warning">
            <span className="fs-11 text-muted fw-bold text-uppercase">Con Advertencia (50-74)</span>
            <h4 className="fw-extrabold mb-0 text-warning">{advertencias}</h4>
          </div>
        </div>
        <div className="col-md">
          <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-danger">
            <span className="fs-11 text-muted fw-bold text-uppercase">Sin Fuente (0 pts)</span>
            <h4 className="fw-extrabold mb-0 text-danger">{sinFuente}</h4>
          </div>
        </div>
        <div className="col-md">
          <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-info">
            <span className="fs-11 text-muted fw-bold text-uppercase">Confianza Promedio</span>
            <h4 className="fw-extrabold mb-0 text-info">{avgConfidence}%</h4>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm bg-white text-dark fw-bold border-gray-300 fs-14"
                placeholder="Buscar por texto de prompt o resultado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-6 d-flex gap-2 justify-content-md-end">
              {["TODOS", "briefing", "dossier", "alerta", "osint", "clasificacion"].map((t) => (
                <button
                  key={t}
                  className={`btn btn-sm fw-bold ${filterType === t ? "btn-primary text-white" : "btn-outline-secondary"}`}
                  onClick={() => setFilterType(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Auditoría */}
      <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3">
          <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
            Registro Histórico de Auditoría de Consultas
          </h6>
        </div>
        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-dark border-bottom">
                <tr>
                  <th className="text-dark fw-bold ps-4 py-3">Tipo</th>
                  <th className="text-dark fw-bold">Prompt / Consulta</th>
                  <th className="text-dark fw-bold">Fuentes</th>
                  <th className="text-dark fw-bold">Nivel de Confianza</th>
                  <th className="text-dark fw-bold">Estado / Alucinación</th>
                  <th className="text-dark fw-bold text-end pe-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="bg-white">
                    <td className="ps-4 py-3">
                      <span className="badge bg-primary text-white text-uppercase fw-bold fs-11">
                        {a.query_type}
                      </span>
                    </td>
                    <td>
                      <p className="fw-extrabold mb-0 text-dark fs-13 lh-sm" style={{ color: "#0f172a" }}>
                        {a.prompt_text.slice(0, 75)}...
                      </p>
                      <small className="text-muted fs-11">{a.model} · {a.latency_ms}ms</small>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark fw-bold fs-11">
                        {a.sources?.length || 0} fuentes
                      </span>
                    </td>
                    <td style={{ width: "160px" }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: "8px" }}>
                          <div
                            className={`progress-bar ${
                              a.confidence_score >= 75
                                ? "bg-success"
                                : a.confidence_score >= 50
                                ? "bg-warning"
                                : "bg-danger"
                            }`}
                            style={{ width: `${a.confidence_score}%` }}
                          ></div>
                        </div>
                        <span className="fw-extrabold fs-12 text-dark">{a.confidence_score}%</span>
                      </div>
                    </td>
                    <td>
                      {a.hallucination_flag ? (
                        <span className="badge bg-danger text-white fw-bold shadow-sm">
                          <i className="ri-alert-line me-1"></i> Alerta Alucinación
                        </span>
                      ) : (
                        <span className="badge bg-success text-white fw-bold shadow-sm">
                          <i className="ri-checkbox-circle-line me-1"></i> Verificada
                        </span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-outline-primary btn-sm fw-bold shadow-sm"
                        onClick={() => setSelectedAudit(a)}
                      >
                        Ver Detalle <i className="ri-arrow-right-line ms-1"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detalle de Consulta */}
      {selectedAudit && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-white border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white p-4">
                <div>
                  <span className="badge bg-white text-primary fw-bold text-uppercase fs-11 mb-1">
                    Detalle de Auditoría · {selectedAudit.query_type.toUpperCase()}
                  </span>
                  <h5 className="modal-title fw-extrabold text-white mb-0">Trazabilidad de Consulta Claude AI</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedAudit(null)}
                ></button>
              </div>

              <div className="modal-body p-4 bg-white">
                {/* Alerta de Alucinación si aplica */}
                {selectedAudit.hallucination_flag && (
                  <div className="alert alert-danger d-flex align-items-center mb-4 rounded-3 shadow-sm">
                    <i className="ri-error-warning-fill fs-24 me-3"></i>
                    <div>
                      <strong className="d-block fs-14">ALERTA DE POSIBLE ALUCINACIÓN DETECTADA</strong>
                      <span className="fs-13">{selectedAudit.hallucination_note || "Sin respaldo de fuentes verificadas suficiente."}</span>
                    </div>
                  </div>
                )}

                {/* Prompt Enviado */}
                <div className="mb-4">
                  <h6 className="fw-extrabold text-dark fs-14 mb-2" style={{ color: "#0f172a" }}>Prompt Enviado:</h6>
                  <div className="p-3 bg-light rounded-3 border border-gray-300 text-dark fs-13 font-monospace">
                    {selectedAudit.prompt_text}
                  </div>
                </div>

                {/* Lista de Fuentes Consultadas */}
                <div className="mb-4">
                  <h6 className="fw-extrabold text-dark fs-14 mb-2" style={{ color: "#0f172a" }}>
                    Fuentes Consultadas ({selectedAudit.sources?.length || 0}):
                  </h6>
                  <div className="list-group">
                    {selectedAudit.sources && selectedAudit.sources.length > 0 ? (
                      selectedAudit.sources.map((s, idx) => (
                        <div key={idx} className="list-group-item bg-white border rounded-3 mb-2 p-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong className="text-primary fs-14">{s.name}</strong>
                            <span className={`badge ${s.credibility === "oficial" ? "bg-success" : "bg-warning text-dark"} fw-bold fs-11`}>
                              {s.credibility.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-muted fs-11 font-monospace d-block mb-1">{s.url}</span>
                          <p className="text-dark fs-12 mb-0 italic" style={{ color: "#334155" }}>
                            "{s.excerpt}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-danger-subtle text-danger rounded-3 fw-bold fs-13">
                        ⚠️ No se registraron fuentes verificadas para esta consulta (0 puntos de confianza).
                      </div>
                    )}
                  </div>
                </div>

                {/* Nivel de Confianza */}
                <div className="mb-3">
                  <h6 className="fw-extrabold text-dark fs-14 mb-2" style={{ color: "#0f172a" }}>
                    Puntuación de Confianza Calculada: {selectedAudit.confidence_score}%
                  </h6>
                  <div className="progress" style={{ height: "12px" }}>
                    <div
                      className={`progress-bar ${
                        selectedAudit.confidence_score >= 75
                          ? "bg-success"
                          : selectedAudit.confidence_score >= 50
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                      style={{ width: `${selectedAudit.confidence_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button className="btn btn-outline-secondary btn-sm fw-bold" onClick={() => setSelectedAudit(null)}>
                  Cerrar
                </button>
                <button className="btn btn-primary btn-sm fw-bold shadow-sm" onClick={() => setSelectedAudit(null)}>
                  <i className="ri-check-double-line me-1"></i> Marcar como Revisado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
