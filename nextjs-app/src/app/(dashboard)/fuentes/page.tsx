"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

const DEFAULT_SOURCES = [
  { id: "s1", name: "Canal Noticias Querétaro ZMQ", type: "Telegram", identifier: "@NoticiasQRO", credibility: "Alta", active: true },
  { id: "s2", name: "Feed Oficial Protección Civil QRO", type: "RSS / API", identifier: "pc.queretaro.gob.mx", credibility: "Oficial", active: true },
  { id: "s3", name: "Alerta Sismológica y Geofísica SSN", type: "MCP Tool", identifier: "intel_earthquakes", credibility: "Oficial", active: true },
  { id: "s4", name: "Monitoreo Pluvial GDACS / CONAGUA", type: "MCP Tool", identifier: "intel_disaster_alerts", credibility: "Oficial", active: true },
  { id: "s5", name: "Reporte de Tráfico Carretera 57", type: "Telegram", identifier: "@PoliciaEstatalQRO", credibility: "Oficial", active: true },
];

export default function FuentesPage() {
  const [sources, setSources] = useState<any[]>(DEFAULT_SOURCES);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/sources");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setSources(resp.data);
        }
      } catch (e) {
        console.warn("Usando catálogo de fuentes soberanas de Querétaro");
      }
    }
    load();
  }, []);

  const toggleActive = async (id: string) => {
    setSources(sources.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="pb-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-1 shadow-sm">
            Infraestructura de Datos · Estado de Querétaro
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Source Manager (Administrador de Fuentes)
          </h4>
          <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
            Control de ingesta de canales de Telegram, Feeds RSS, APIs Federales y herramientas MCP.
          </p>
        </div>
      </div>

      <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
            Fuentes Conectadas a SentinelIQ
          </h6>
          <span className="badge bg-primary text-white fs-11 fw-bold shadow-sm">Ingestión en Vivo</span>
        </div>
        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-dark border-bottom">
                <tr>
                  <th className="text-dark fw-bold py-3 ps-4">Nombre de Fuente</th>
                  <th className="text-dark fw-bold">Tipo de Conector</th>
                  <th className="text-dark fw-bold">Identificador / Enlace</th>
                  <th className="text-dark fw-bold">Credibilidad</th>
                  <th className="text-dark fw-bold text-end pe-4">Estado Ingestión</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.id} className="bg-white">
                    <td className="ps-4 py-3 fw-extrabold text-dark fs-14" style={{ color: "#0f172a" }}>
                      {s.name}
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold fs-11">
                        {s.type}
                      </span>
                    </td>
                    <td className="text-dark fs-13 fw-semibold" style={{ color: "#334155" }}>
                      <code>{s.identifier}</code>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-bold fs-11">
                        {s.credibility}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="form-check form-switch d-inline-block">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={s.active ?? true}
                          onChange={() => toggleActive(s.id)}
                        />
                      </div>
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
