"use client";

import React, { useState } from "react";
import api from "@/lib/api";

export default function CiberseguridadPage() {
  const [target, setTarget] = useState("queretaro.gob.mx");
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.post("/spiderfoot/scan", { target });
      setScanResult(resp.data);
    } catch (e) {
      console.error("Error iniciando escaneo:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Auditoría de Infraestructura con SpiderFoot OSINT</h4>
          <p className="text-muted fs-13 mb-0">
            Escaneo interno en contenedor seguro de la infraestructura tecnológica del Estado de Querétaro.
          </p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleScan} className="row g-3">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Ej. queretaro.gob.mx"
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Escaneando..." : "Iniciar Escaneo SpiderFoot"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {scanResult && (
        <div className="card shadow-sm border-start border-4 border-warning">
          <div className="card-body">
            <h5 className="fw-bold text-body">Resultado del Escaneo: {scanResult.target}</h5>
            <span className="badge bg-success mb-2">Estado: {scanResult.status}</span>
            <p className="text-muted fs-13 mb-0">{scanResult.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
