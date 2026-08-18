"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function NarrativasPage() {
  const [narratives, setNarratives] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/narratives");
        setNarratives(resp.data);
      } catch (e) {
        console.error("Error cargando narrativas:", e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Tracking de Narrativas y Momentum Mediático</h4>
          <p className="text-muted fs-13 mb-0">
            Detección de temas emergentes en medios, redes y opinión pública en Jalisco.
          </p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Narrativa / Tema</th>
                  <th>Categoría</th>
                  <th>Tendencia (Sparkline 7d)</th>
                  <th>Volumen 24h</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <h6 className="fw-bold mb-0">Movilidad e Infraestructura ZMG</h6>
                    <small className="text-muted">Debate sobre obras hidráulicas y vialidades</small>
                  </td>
                  <td><span className="badge bg-primary-subtle text-primary">Infraestructura</span></td>
                  <td><span className="badge bg-danger">Subiendo ↑</span></td>
                  <td className="fw-bold">142 menciones</td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm">Generar Dossier</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h6 className="fw-bold mb-0">Discusión del Presupuesto Estatal 2027</h6>
                    <small className="text-muted">Cabildeo legislativo entre bancadas</small>
                  </td>
                  <td><span className="badge bg-info-subtle text-info">Política</span></td>
                  <td><span className="badge bg-warning text-dark">Estable →</span></td>
                  <td className="fw-bold">89 menciones</td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm">Generar Dossier</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
