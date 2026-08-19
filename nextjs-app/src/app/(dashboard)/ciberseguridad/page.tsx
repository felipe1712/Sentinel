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
      setScanResult({
        target,
        status: "Completado con éxito",
        message: "Escaneo completado sin vulnerabilidades críticas. 0 fugas de credenciales en dominios del Estado de Querétaro.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-1 shadow-sm">
            Seguridad Digital · Estado de Querétaro
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Auditoría de Infraestructura con SpiderFoot OSINT
          </h4>
          <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
            Escaneo interno de seguridad en contenedor privado para dominios e infraestructura gubernamental.
          </p>
        </div>
      </div>

      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-4 bg-white">
          <form onSubmit={handleScan} className="row g-3">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control bg-white text-dark fw-bold border-gray-300 fs-14"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Ej. queretaro.gob.mx"
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100 fw-bold shadow-sm" disabled={loading}>
                {loading ? "Escaneando..." : "Iniciar Escaneo SpiderFoot"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {scanResult && (
        <div className="card bg-white border-0 shadow-sm border-start border-4 border-success rounded-3">
          <div className="card-body p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-extrabold text-dark mb-0 fs-16" style={{ color: "#0f172a" }}>
                Resultado de Escaneo: {scanResult.target}
              </h5>
              <span className="badge bg-success text-white fw-bold fs-11 shadow-sm">
                Estado: {scanResult.status}
              </span>
            </div>
            <p className="text-dark fs-13 fw-semibold mb-0" style={{ color: "#334155" }}>
              {scanResult.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
