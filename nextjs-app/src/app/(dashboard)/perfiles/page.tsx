"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

const DEFAULT_PROFILES = [
  {
    id: "p1",
    name: "Alcalde de Santiago de Querétaro",
    cargo: "Presidente Municipal Constitucional",
    afiliacion: "Gobierno Municipal ZMQ",
    risk: "Medio",
    summary: "Coordinación en operativos viales de Paseo 5 de Febrero y proyectos urbanos.",
  },
  {
    id: "p2",
    name: "Presidente CANACINTRA Querétaro",
    cargo: "Líder del Sector Industrial",
    afiliacion: "Iniciativa Privada / Cámaras",
    risk: "Bajo",
    summary: "Interlocución en mesas de desarrollo económico e inversión en El Marqués.",
  },
  {
    id: "p3",
    name: "Coordinador de Bancada en Congreso Estatal",
    cargo: "Diputado Local",
    afiliacion: "Grupo Parlamentario",
    risk: "Medio",
    summary: "Seguimiento al paquete presupuestal e iniciativa hídrica Batán.",
  },
  {
    id: "p4",
    name: "Delegado Federal CONAGUA Querétaro",
    cargo: "Funcionario Federal",
    afiliacion: "Gobierno Federal",
    risk: "Bajo",
    summary: "Enlace técnico permanente para la viabilidad del proyecto hídrico regional.",
  },
];

export default function PerfilesPage() {
  const [profiles, setProfiles] = useState<any[]>(DEFAULT_PROFILES);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/profiles");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setProfiles(resp.data);
        }
      } catch (e) {
        console.warn("Usando catálogo de perfiles soberanos de Querétaro");
      }
    }
    load();
  }, []);

  return (
    <div className="pb-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-1 shadow-sm">
            Gubernatura del Estado de Querétaro
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Perfiles Monitoreados & Watchlist Activa
          </h4>
          <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
            Monitoreo continuo de actores políticos, funcionarios, representantes sectoriales y líderes clave.
          </p>
        </div>
        <Link href="/dossiers/nuevo?tipo=perfil" className="btn btn-primary btn-sm fw-bold shadow-sm">
          <i className="ri-user-add-line me-1"></i> Generar Dossier de Perfil
        </Link>
      </div>

      <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
            Directorio de Actores Relevantes
          </h6>
          <span className="badge bg-primary text-white fs-11 fw-bold shadow-sm">Watchlist Activa</span>
        </div>
        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-dark border-bottom">
                <tr>
                  <th className="text-dark fw-bold py-3 ps-4">Nombre del Actor</th>
                  <th className="text-dark fw-bold">Tipo / Cargo</th>
                  <th className="text-dark fw-bold">Afiliación / Sector</th>
                  <th className="text-dark fw-bold">Nivel de Atención</th>
                  <th className="text-dark fw-bold text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="bg-white">
                    <td className="ps-4 py-3">
                      <h6 className="fw-extrabold mb-1 text-dark fs-14" style={{ color: "#0f172a" }}>
                        {p.name}
                      </h6>
                      <small className="text-dark fs-12 fw-medium" style={{ color: "#334155" }}>
                        {p.summary}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold fs-11">
                        {p.cargo}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark fw-bold fs-11" style={{ color: "#0f172a" }}>
                        {p.afiliacion}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.risk === "Alto"
                            ? "bg-danger text-white fw-bold"
                            : p.risk === "Medio"
                            ? "bg-warning text-dark fw-bold"
                            : "bg-success text-white fw-bold"
                        }`}
                      >
                        {p.risk || "Normal"}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <Link
                        href={`/dossiers/nuevo?municipio=${encodeURIComponent(p.name)}`}
                        className="btn btn-outline-primary btn-sm fw-bold me-2"
                      >
                        Dossier
                      </Link>
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
