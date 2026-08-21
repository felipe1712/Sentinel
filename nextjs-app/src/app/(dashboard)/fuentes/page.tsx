"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getStateConfig, StateConfig, FuenteItem } from "@/lib/stateConfig";

export default function FuentesManagerPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [fuentes, setFuentes] = useState<FuenteItem[]>([]);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    setFuentes(cfg.fuentes);

    async function load() {
      try {
        const resp = await api.get("/sources");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setFuentes(resp.data);
        }
      } catch (e) {
        console.warn(`Usando catálogo soberano de fuentes de ${cfg.shortName}`);
      }
    }
    load();
  }, []);

  return (
    <div className="pb-5 pt-4 pt-md-5 mt-2">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Source Manager · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Gestión de Fuentes & Conectores OSINT ({stateCfg.shortName})
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Conexión en tiempo real con canales de Telegram, feeds oficiales RSS y motores MCP.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/fuentes/telegram" className="btn btn-primary btn-sm fw-bold text-white shadow-sm">
            <i className="ri-telegram-line me-1"></i> Conectar Canales Telegram (Guanajuato OSINT)
          </Link>
        </div>
      </div>

      {/* Tabla de Fuentes */}
      <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3">
          <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
            Fuentes Activas de Inteligencia para {stateCfg.name}
          </h6>
        </div>
        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-dark border-bottom">
                <tr>
                  <th className="text-dark fw-bold ps-4 py-3">Fuente / Conector</th>
                  <th className="text-dark fw-bold">Tipo</th>
                  <th className="text-dark fw-bold">Identificador</th>
                  <th className="text-dark fw-bold">Credibilidad</th>
                  <th className="text-dark fw-bold text-end pe-4">Estatus</th>
                </tr>
              </thead>
              <tbody>
                {fuentes.map((f) => (
                  <tr key={f.id} className="bg-white">
                    <td className="ps-4 py-3 fw-extrabold text-dark fs-14" style={{ color: "#0f172a" }}>
                      {f.name}
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold fs-11">
                        {f.type}
                      </span>
                    </td>
                    <td className="text-dark fw-bold fs-13" style={{ color: "#334155" }}>
                      {f.identifier}
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-bold fs-11">
                        {f.credibility}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <span className="badge bg-success text-white fw-bold shadow-sm">
                        <i className="ri-checkbox-circle-line me-1"></i> Activa
                      </span>
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
