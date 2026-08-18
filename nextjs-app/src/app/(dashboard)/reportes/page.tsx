"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ReportesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/reports");
        setReports(resp.data);
      } catch (e) {
        console.error("Error cargando reportes:", e);
      }
    }
    load();
  }, []);

  const handleGenerate = async (type: string) => {
    setLoading(true);
    try {
      const resp = await api.post("/reports/generate", { type });
      setReports([resp.data, ...reports]);
      alert("Reporte PDF generado exitosamente con WeasyPrint.");
    } catch (e) {
      console.error("Error generando reporte:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Generación y Descarga de Reportes PDF Oficiales</h4>
          <p className="text-muted fs-13 mb-0">
            Exportación ejecutiva en plantilla oficial del Despacho del Gobernador (WeasyPrint).
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => handleGenerate("diario")} disabled={loading}>
            <i className="ri-file-pdf-line me-1"></i> Generar Reporte Diario
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => handleGenerate("semanal")} disabled={loading}>
            <i className="ri-calendar-event-line me-1"></i> Generar Reporte Semanal
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Tipo de Reporte</th>
                  <th>Período</th>
                  <th>Fecha de Generación</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-bold text-uppercase">{r.type}</td>
                      <td className="text-muted fs-13">{r.period}</td>
                      <td className="fs-13">{new Date(r.generated_at).toLocaleString()}</td>
                      <td>
                        <a href={r.pdf_url} target="_blank" rel="noreferrer" className="btn btn-link btn-sm fw-semibold text-primary">
                          Descargar PDF <i className="ri-download-line ms-1"></i>
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      No hay reportes PDF generados en el historial.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
