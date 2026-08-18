"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function FuentesPage() {
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/sources");
        setSources(resp.data);
      } catch (e) {
        console.error("Error cargando fuentes:", e);
      }
    }
    load();
  }, []);

  const toggleActive = async (id: string) => {
    try {
      await api.patch(`/sources/${id}/toggle`);
      setSources(sources.map(s => s.id === id ? { ...s, active: !s.active } : s));
    } catch (e) {
      console.error("Error cambiando estado:", e);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Source Manager (Administrador de Fuentes)</h4>
          <p className="text-muted fs-13 mb-0">
            Control de ingesta de canales de Telegram, Feeds RSS, APIs Federales y Webhooks.
          </p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Nombre de Fuente</th>
                  <th>Tipo</th>
                  <th>Identificador</th>
                  <th>Credibilidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-bold">{s.name}</td>
                    <td><span className="badge bg-info-subtle text-info text-uppercase">{s.type}</span></td>
                    <td className="text-muted fs-13">{s.identifier}</td>
                    <td><span className="badge bg-success-subtle text-success">{s.credibility}</span></td>
                    <td>
                      <div className="form-check form-switch">
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
