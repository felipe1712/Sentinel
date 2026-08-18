"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/municipios");
        setMunicipios(resp.data);
      } catch (e) {
        console.error("Error cargando municipios:", e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Inteligencia y Monitoreo Municipal</h4>
          <p className="text-muted fs-13 mb-0">
            Nivel de actividad, eventos e incidentes por municipio del Estado de Querétaro.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {municipios.map((m) => (
          <div key={m.clave} className="col-md-6 col-lg-4">
            <div className="card shadow-sm h-100 border-start border-4 border-info">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-secondary">INEGI: {m.clave}</span>
                  <span className={`badge ${m.actividad_nivel === "alto" ? "bg-danger" : "bg-warning text-dark"}`}>
                    Actividad {m.actividad_nivel}
                  </span>
                </div>
                <h5 className="fw-bold text-body mb-2">{m.nombre}</h5>
                <p className="fs-13 text-muted mb-3">
                  Eventos procesados en últimas 24h: <strong>{m.eventos_24h}</strong>
                </p>
                <Link href={`/dossiers/nuevo?municipio=${m.nombre}`} className="btn btn-outline-info btn-sm w-100">
                  <i className="ri-file-text-line me-1"></i> Dossier de Gira Municipal
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
