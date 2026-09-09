"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

export default function BriefingPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);

    async function loadBriefing() {
      try {
        const resp = await api.get("/briefings/today");
        setBriefing(resp.data);
      } catch (err) {
        console.warn(`Usando briefing soberano de ${cfg.shortName}`);
      } finally {
        setLoading(false);
      }
    }
    loadBriefing();
  }, []);

  return (
    <div className="pb-5 pt-4 pt-md-5 mt-2">
      {/* Title Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-bottom border-gray-300 pb-3 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger px-3 py-2 fs-12 text-uppercase fw-bold shadow-sm">
              Confidencial · {stateCfg.governorTitle}
            </span>
            <span className="text-dark fw-semibold fs-13">Generado a las 05:30 AM</span>
          </div>
          <h3 className="fw-extrabold mt-2 mb-0 text-dark fs-24" style={{ color: "#0f172a" }}>
            {briefing?.title || `Briefing Matutino Ejecutivo — ${stateCfg.name}`}
          </h3>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm fw-bold" onClick={() => window.print()}>
            <i className="ri-printer-line me-1"></i> Imprimir Memo
          </button>
          <button className="btn btn-primary btn-sm fw-bold shadow-sm">
            <i className="ri-send-plane-line me-1"></i> Enviar al Gabinete
          </button>
        </div>
      </div>

      {/* 1. Resumen Ejecutivo Modo Claro */}
      <div className="card bg-white border-0 shadow-sm mb-4 border-start border-4 border-primary rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="card-title mb-0 fw-extrabold text-primary text-uppercase fs-14" style={{ color: "#1e40af" }}>
            1. Resumen Ejecutivo de Inteligencia
          </h5>
        </div>
        <div className="card-body p-4 bg-white">
          <p className="fs-15 lh-lg mb-0 text-dark fw-medium" style={{ color: "#0f172a" }}>
            {briefing?.executive_summary || stateCfg.sintesisEjecutiva}
          </p>
        </div>
      </div>

      {/* 2. Puntos Clave */}
      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="card-title mb-0 fw-extrabold text-dark text-uppercase fs-14" style={{ color: "#0f172a" }}>
            2. Puntos Clave de Atención Política ({stateCfg.shortName})
          </h5>
        </div>
        <div className="card-body p-4 bg-white">
          <div className="row g-3">
            {stateCfg.prioridades.map((p, idx) => (
              <div key={idx} className="col-12">
                <div className="p-3 rounded-3 border border-gray-300 bg-light shadow-sm mb-2">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h6 className="fw-extrabold text-primary mb-0 fs-14" style={{ color: "#1e40af" }}>
                      {idx + 1}. {p.titulo} ({p.region})
                    </h6>
                    <span className={`badge ${p.badgeBg} fs-11 fw-bold`}>Atención: {p.tag}</span>
                  </div>
                  <p className="text-dark fs-13 fw-semibold mb-0" style={{ color: "#0f172a" }}>
                    {p.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 & 4. Narrativas y Temas a Vigilar */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card bg-white border-0 shadow-sm h-100 rounded-3 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="card-title mb-0 fw-extrabold text-dark text-uppercase fs-14" style={{ color: "#0f172a" }}>
                3. Narrativas en Movimiento en {stateCfg.shortName}
              </h5>
            </div>
            <div className="card-body p-4 bg-white">
              <ul className="list-group list-group-flush">
                {stateCfg.narrativas.slice(0, 3).map((n) => (
                  <li key={n.id} className="list-group-item bg-white d-flex justify-content-between align-items-center border-bottom py-3 px-0">
                    <span className="text-dark fw-bold fs-13" style={{ color: "#0f172a" }}>{n.title}</span>
                    <span className={`badge ${n.trend === "subiendo" ? "bg-danger text-white" : "bg-warning text-dark"} fw-bold`}>
                      {n.trend === "subiendo" ? "Tendencia ↑" : "Tendencia →"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card bg-white border-0 shadow-sm h-100 rounded-3 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="card-title mb-0 fw-extrabold text-dark text-uppercase fs-14" style={{ color: "#0f172a" }}>
                4. Temas a Vigilar Hoy
              </h5>
            </div>
            <div className="card-body p-4 bg-white">
              <ul className="list-unstyled mb-0">
                <li className="mb-3 text-dark fs-13 fw-semibold" style={{ color: "#0f172a" }}>
                  <i className="ri-checkbox-blank-circle-fill text-warning me-2 fs-10"></i>
                  Mesa de coordinación operativa de seguridad a las 09:00 hrs.
                </li>
                <li className="mb-3 text-dark fs-13 fw-semibold" style={{ color: "#0f172a" }}>
                  <i className="ri-checkbox-blank-circle-fill text-warning me-2 fs-10"></i>
                  Sesión de trabajo en el Congreso del Estado a las 11:30 hrs.
                </li>
                <li className="mb-0 text-dark fs-13 fw-semibold" style={{ color: "#0f172a" }}>
                  <i className="ri-checkbox-blank-circle-fill text-warning me-2 fs-10"></i>
                  Supervisión de operativos viales en la región industrial.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Alertas Globales Integradas */}
      <div className="card bg-white border-primary shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-primary text-white py-3">
          <h5 className="card-title mb-0 fw-extrabold text-white text-uppercase fs-14">
            5. Alertas Globales & OSINT Integradas (world-intel-mcp)
          </h5>
        </div>
        <div className="card-body p-4 bg-white">
          <div className="row text-center g-3">
            <div className="col-md-4">
              <h6 className="text-uppercase text-muted fs-11 fw-bold">Actividad Sismológica</h6>
              <p className="fw-extrabold text-dark fs-14 mb-0" style={{ color: "#0f172a" }}>Actividad SSN Normal (Sin afectación)</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-uppercase text-muted fs-11 fw-bold">Índice Inestabilidad</h6>
              <p className="fw-extrabold text-success fs-14 mb-0">24/100 (Bajo Control)</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-uppercase text-muted fs-11 fw-bold">Alertas Climáticas</h6>
              <p className="fw-extrabold text-warning fs-14 mb-0">Monitoreo Pluvial GDACS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
