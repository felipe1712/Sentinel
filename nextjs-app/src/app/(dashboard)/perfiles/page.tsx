"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function PerfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/profiles");
        setProfiles(resp.data);
      } catch (e) {
        console.error("Error cargando perfiles:", e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Perfiles Monitoreados & Watchlist Activa</h4>
          <p className="text-muted fs-13 mb-0">
            Monitoreo continuo de actores políticos, funcionarios, medios y organizaciones clave.
          </p>
        </div>
        <button className="btn btn-primary btn-sm">
          <i className="ri-add-line me-1"></i> Agregar Perfil a Watchlist
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Nombre del Actor</th>
                  <th>Tipo / Cargo</th>
                  <th>Partido / Afiliación</th>
                  <th>Nivel de Riesgo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <h6 className="fw-bold mb-0">Coordinador Bancada Oposición</h6>
                    <small className="text-muted">Menciones frecuentes sobre presupuesto</small>
                  </td>
                  <td>Diputado Local</td>
                  <td>Partido Oposición</td>
                  <td><span className="badge bg-danger">Alto</span></td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm me-2">Ver Timeline</button>
                    <button className="btn btn-outline-secondary btn-sm">Generar Dossier</button>
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
