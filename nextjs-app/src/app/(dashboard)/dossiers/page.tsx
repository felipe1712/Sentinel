"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

const DEFAULT_DOSSIERS = [
  {
    id: "dos_qro_01",
    title: "Dossier Estratégico · Gira de Trabajo Santiago de Querétaro",
    type: "Gira Municipal",
    bluf: "Análisis situacional de la capital: avance de obras en Paseo 5 de Febrero, coordinación PoEs/C4 municipal y temas prioritarios de concertación vecinal.",
    confidence: "Alta (98%)",
    date: "19 de Agosto, 2026",
  },
  {
    id: "dos_batan_02",
    title: "Dossier de Coyuntura · Proyecto Hídrico Batán Agua para Todos",
    type: "Infraestructura",
    bluf: "Viabilidad financiera y ambiental del acuífero, estado del convenio federal con CONAGUA y estrategia de comunicación institucional.",
    confidence: "Muy Alta (99%)",
    date: "18 de Agosto, 2026",
  },
  {
    id: "dos_marques_03",
    title: "Dossier Regional · Desarrollo Industrial y Data Centers El Marqués",
    type: "Desarrollo Económico",
    bluf: "Evaluación de parques industriales, demanda de energía eléctrica, infraestructura carretera y potencial de generación de empleo calificado.",
    confidence: "Alta (95%)",
    date: "17 de Agosto, 2026",
  },
];

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<any[]>(DEFAULT_DOSSIERS);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/dossiers");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setDossiers(resp.data);
        }
      } catch (e) {
        console.warn("Usando catálogo soberano de dossiers de Querétaro");
      }
    }
    load();
  }, []);

  return (
    <div className="pb-5 pt-4 pt-md-5 mt-2">
      {/* Header con Margen Generoso */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Gubernatura del Estado de Querétaro
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Dossiers Ejecutivos de Inteligencia
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Documentos estructurados con análisis situacional, perfiles, municipios e incidentes clave.
          </p>
        </div>
        <Link href="/dossiers/nuevo" className="btn btn-primary btn-sm fw-bold text-white shadow-sm">
          <i className="ri-add-line me-1"></i> Generar Nuevo Dossier
        </Link>
      </div>

      {/* Grid de Dossiers */}
      <div className="row g-4">
        {dossiers.map((doc) => (
          <div key={doc.id} className="col-md-6 col-lg-4">
            <div className="card bg-white border-0 shadow-sm h-100 border-start border-4 border-primary rounded-3">
              <div className="card-body p-4 bg-white d-flex flex-column justify-content-between">
                <div>
                  {/* Badge de Tipo */}
                  <div className="mb-2">
                    <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase fs-11 px-3 py-1">
                      Dossier {doc.type}
                    </span>
                  </div>

                  {/* Fecha colocada justo abajo del recuadro azul */}
                  <div className="text-dark fs-12 fw-bold mb-3" style={{ color: "#475569" }}>
                    <i className="ri-calendar-line me-1 text-primary"></i> {doc.date || "19 de Agosto, 2026"}
                  </div>

                  {/* Título del Dossier */}
                  <h5 className="fw-extrabold text-dark fs-16 mb-3 lh-base" style={{ color: "#0f172a" }}>
                    {doc.title}
                  </h5>

                  {/* BLUF / Resumen */}
                  <p className="text-dark fs-13 lh-base mb-4 fw-medium" style={{ color: "#334155" }}>
                    {doc.bluf}
                  </p>
                </div>

                {/* Footer de Tarjeta */}
                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-gray-200 mt-auto">
                  <span className="fs-12 text-primary fw-bold">Confianza: {doc.confidence || "Alta"}</span>
                  <Link href={`/dossiers/${doc.id}`} className="btn btn-primary btn-sm fw-bold text-white shadow-sm">
                    Ver Dossier <i className="ri-arrow-right-line ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
