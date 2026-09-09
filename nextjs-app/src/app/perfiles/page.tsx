"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getStateConfig, StateConfig, PerfilItem } from "@/lib/stateConfig";

export default function PerfilesWatchlistPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [perfiles, setPerfiles] = useState<PerfilItem[]>([]);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    setPerfiles(cfg.perfiles);

    async function load() {
      try {
        const resp = await api.get("/profiles");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setPerfiles(resp.data);
        }
      } catch (e) {
        console.warn(`Usando catálogo soberano de perfiles de ${cfg.shortName}`);
      }
    }
    load();
  }, []);

  return (
    <div className="pb-5 pt-4 pt-md-5 mt-2">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            {stateCfg.name} · Watchlist Ejecutivo
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Perfiles & Actores Clave ({stateCfg.shortName})
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Monitoreo situacional de actores clave, autoridades municipales e interlocutores relevantes.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/dossiers/nuevo" className="btn btn-primary btn-sm fw-bold text-white shadow-sm">
            <i className="ri-user-add-line me-1"></i> Solicitar Perfil Especial
          </Link>
        </div>
      </div>

      {/* Grid de Perfiles */}
      <div className="row g-4">
        {perfiles.map((p) => (
          <div key={p.id} className="col-md-6 col-lg-3">
            <div className="card bg-white border-0 shadow-sm h-100 rounded-3 border-start border-4 border-primary">
              <div className="card-body p-4 bg-white d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary fw-bold fs-11">{p.afiliacion}</span>
                    <span className={`badge ${p.risk === "Alto" ? "bg-danger text-white fw-bold" : "bg-warning text-dark fw-bold"}`}>
                      Riesgo {p.risk}
                    </span>
                  </div>

                  <h5 className="fw-extrabold text-dark fs-16 mb-1" style={{ color: "#0f172a" }}>{p.name}</h5>
                  <p className="text-primary fw-bold fs-12 mb-3">{p.cargo}</p>

                  <p className="text-dark fs-13 lh-base fw-medium mb-3" style={{ color: "#334155" }}>
                    {p.summary}
                  </p>
                </div>

                <Link href={`/dossiers/nuevo?perfil=${encodeURIComponent(p.name)}`} className="btn btn-outline-primary btn-sm w-100 fw-bold mt-auto">
                  Ver Ficha Biográfica
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
