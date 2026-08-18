"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function DossierDetailPage() {
  const { id } = useParams();
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get(`/dossiers/${id}`);
        setDossier(resp.data);
      } catch (err) {
        console.error("Error cargando dossier:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Cargando dossier de inteligencia...</div>;
  if (!dossier) return <div className="p-4 text-center text-danger">Dossier no encontrado.</div>;

  return (
    <div className="container-fluid" style={{ maxWidth: "900px" }}>
      <div className="card shadow border-top border-4 border-primary">
        <div className="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
          <span className="badge bg-primary text-uppercase px-3 py-2">
            Dossier {dossier.type} · Confidencial
          </span>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
            <i className="ri-printer-line me-1"></i> Imprimir Dossier
          </button>
        </div>
        <div className="card-body p-4">
          <h3 className="fw-bold text-body mb-3">{dossier.title}</h3>

          {/* BLUF */}
          <div className="p-3 bg-primary-subtle rounded border border-primary-subtle mb-4">
            <h6 className="fw-bold text-primary text-uppercase fs-12 mb-1">
              BLUF (Bottom Line Up Front)
            </h6>
            <p className="mb-0 fs-14 fw-medium text-body">{dossier.bluf}</p>
          </div>

          {/* Secciones del Dossier */}
          {dossier.content?.situacion_actual && (
            <div className="mb-4">
              <h5 className="fw-bold border-bottom pb-2 mb-2">1. Situación Actual & Contexto</h5>
              <p className="fs-14 text-muted">{dossier.content.situacion_actual}</p>
            </div>
          )}

          {dossier.content?.actores_clave && (
            <div className="mb-4">
              <h5 className="fw-bold border-bottom pb-2 mb-2">2. Actores Clave Involucrados</h5>
              <ul className="list-group">
                {dossier.content.actores_clave.map((actor: string, idx: number) => (
                  <li key={idx} className="list-group-item bg-transparent">
                    <i className="ri-user-line text-primary me-2"></i> {actor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dossier.content?.escenarios && (
            <div className="mb-4">
              <h5 className="fw-bold border-bottom pb-2 mb-2">3. Escenarios Prospectivos</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="p-3 bg-success-subtle rounded border border-success-subtle h-100">
                    <h6 className="fw-bold text-success text-uppercase fs-12">Escenario Optimista</h6>
                    <p className="fs-12 mb-0">{dossier.content.escenarios.optimista}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-info-subtle rounded border border-info-subtle h-100">
                    <h6 className="fw-bold text-info text-uppercase fs-12">Escenario Probable</h6>
                    <p className="fs-12 mb-0">{dossier.content.escenarios.probable}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-danger-subtle rounded border border-danger-subtle h-100">
                    <h6 className="fw-bold text-danger text-uppercase fs-12">Escenario Pesimista</h6>
                    <p className="fs-12 mb-0">{dossier.content.escenarios.pesimista}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dossier.content?.recomendaciones && (
            <div>
              <h5 className="fw-bold border-bottom pb-2 mb-2">4. Recomendaciones de Acción Política</h5>
              <ul className="list-unstyled">
                {dossier.content.recomendaciones.map((rec: string, idx: number) => (
                  <li key={idx} className="mb-2 fs-14">
                    <i className="ri-checkbox-circle-fill text-success me-2"></i> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
