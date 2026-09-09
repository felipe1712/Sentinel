"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getStateConfig, StateConfig, MunicipioItem } from "@/lib/stateConfig";

export default function MunicipiosPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [municipios, setMunicipios] = useState<MunicipioItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("TODOS");

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    setMunicipios(cfg.municipios);

    async function load() {
      try {
        const resp = await api.get("/municipios");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setMunicipios(resp.data);
        }
      } catch (e) {
        console.warn(`Usando catálogo soberano completo de municipios de ${cfg.shortName}`);
      }
    }
    load();
  }, []);

  const filtered = municipios.filter((m) => {
    const matchesSearch =
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.clave.includes(search);
    const matchesRegion =
      selectedRegion === "TODOS" ||
      m.region?.toLowerCase().includes(selectedRegion.toLowerCase());
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="pb-5 pt-4 pt-md-5 mt-2">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            {stateCfg.name} · Clave INEGI {stateCfg.inegiCode}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Inteligencia y Monitoreo Municipal ({municipios.length} Municipios)
          </h4>
          <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
            Nivel de actividad, eventos procesados, población e inteligencia territorial por municipio.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/dossiers/nuevo" className="btn btn-primary btn-sm fw-bold text-white shadow-sm">
            <i className="ri-file-add-line me-1"></i> Generar Dossier de Gira
          </Link>
        </div>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-dark fw-bold border-gray-300">
                  <i className="ri-search-line"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-white text-dark fw-bold border-gray-300 fs-14"
                  placeholder={`Buscar municipio de ${stateCfg.shortName} por nombre o clave INEGI...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-7 d-flex flex-wrap gap-2 justify-content-md-end">
              {stateCfg.regions.map((region) => (
                <button
                  key={region}
                  className={`btn btn-sm ${
                    selectedRegion === region ? "btn-primary text-white fw-bold shadow-sm" : "btn-outline-secondary fw-bold"
                  }`}
                  onClick={() => setSelectedRegion(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Municipios */}
      <div className="row g-4">
        {filtered.map((m) => (
          <div key={m.clave} className="col-md-6 col-lg-4">
            <div className="card bg-white border-0 shadow-sm h-100 border-start border-4 border-primary rounded-3">
              <div className="card-body p-4 bg-white d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-secondary-subtle text-dark fw-bold fs-11" style={{ color: "#0f172a" }}>INEGI: {m.clave}</span>
                    <span
                      className={`badge ${
                        m.actividad_nivel === "alto"
                          ? "bg-danger text-white fw-bold"
                          : m.actividad_nivel === "medio"
                          ? "bg-warning text-dark fw-bold"
                          : "bg-success text-white fw-bold"
                      }`}
                    >
                      Actividad {m.actividad_nivel.toUpperCase()}
                    </span>
                  </div>

                  <h5 className="fw-extrabold text-dark fs-16 mb-1" style={{ color: "#0f172a" }}>{m.nombre}</h5>
                  <span className="badge bg-primary-subtle text-primary fw-bold fs-11 mb-3">
                    Región: {m.region || stateCfg.shortName}
                  </span>

                  <div className="bg-light p-3 rounded-3 mb-3 border border-gray-200">
                    <div className="d-flex justify-content-between fs-12 mb-1">
                      <span className="text-dark fw-semibold" style={{ color: "#334155" }}>Eventos Últimas 24h:</span>
                      <strong className="text-dark fw-extrabold" style={{ color: "#0f172a" }}>{m.eventos_24h} reportes</strong>
                    </div>
                    <div className="d-flex justify-content-between fs-12 mb-1">
                      <span className="text-dark fw-semibold" style={{ color: "#334155" }}>Población INEGI:</span>
                      <span className="text-dark fw-extrabold" style={{ color: "#0f172a" }}>{m.poblacion || "N/D"} hab.</span>
                    </div>
                    <div className="d-flex justify-content-between fs-12">
                      <span className="text-dark fw-semibold" style={{ color: "#334155" }}>Cobertura:</span>
                      <span className="text-dark fw-extrabold text-truncate ms-2" style={{ color: "#0f172a" }}>{m.responsable_region}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/dossiers/nuevo?municipio=${encodeURIComponent(m.nombre)}`}
                  className="btn btn-outline-primary btn-sm w-100 fw-bold mt-auto"
                >
                  <i className="ri-file-text-line me-1"></i> Dossier de Gira Municipal
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-12 text-center py-5">
            <i className="ri-search-2-line fs-36 text-muted mb-2"></i>
            <h6 className="text-dark fw-bold">No se encontraron municipios coincidentes en {stateCfg.name}.</h6>
          </div>
        )}
      </div>
    </div>
  );
}
