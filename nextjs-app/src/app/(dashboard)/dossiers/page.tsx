"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/dossiers");
        setDossiers(resp.data);
      } catch (e) {
        console.error("Error cargando dossiers:", e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Dossiers Ejecutivos de Inteligencia</h4>
          <p className="text-muted fs-13 mb-0">
            Documentos estructurados con análisis situacional, perfiles, municipios e incidentes.
          </p>
        </div>
        <Link href="/dossiers/nuevo" className="btn btn-primary btn-sm">
          <i className="ri-add-line me-1"></i> Generar Nuevo Dossier
        </Link>
      </div>

      <div className="row g-4">
        {dossiers.length > 0 ? (
          dossiers.map((doc) => (
            <div key={doc.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-start border-3 border-primary shadow-sm">
                <div className="card-body">
                  <span className="badge bg-primary-subtle text-primary text-uppercase mb-2">
                    Dossier {doc.type}
                  </span>
                  <h5 className="fw-bold text-body fs-16 mb-2">{doc.title}</h5>
                  <p className="text-muted fs-13 line-clamp-3 mb-3">{doc.bluf}</p>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top border-dark">
                    <span className="fs-12 text-muted">Confianza: {doc.confidence || "Alta"}</span>
                    <Link href={`/dossiers/${doc.id}`} className="btn btn-link btn-sm p-0 fw-semibold text-primary">
                      Ver Dossier <i className="ri-arrow-right-line ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <i className="ri-book-open-line fs-48 text-muted mb-2"></i>
            <h5 className="text-muted">No se encontraron dossiers generados</h5>
            <Link href="/dossiers/nuevo" className="btn btn-outline-primary btn-sm mt-2">
              Crear primer dossier con Claude API
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
