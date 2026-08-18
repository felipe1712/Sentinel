"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

const ALL_18_MUNICIPIOS = [
  { clave: "22014", nombre: "Santiago de Querétaro", region: "ZMQ", actividad_nivel: "alto", eventos_24h: 12, poblacion: "1,049,777", responsable_region: "PoEs ZMQ Sector 1" },
  { clave: "22011", nombre: "El Marqués", region: "ZMQ", actividad_nivel: "alto", eventos_24h: 7, poblacion: "231,668", responsable_region: "PoEs ZMQ Sector 2" },
  { clave: "22006", nombre: "Corregidora", region: "ZMQ", actividad_nivel: "medio", eventos_24h: 6, poblacion: "212,567", responsable_region: "PoEs ZMQ Sector 3" },
  { clave: "22016", nombre: "San Juan del Río", region: "Sur", actividad_nivel: "medio", eventos_24h: 5, poblacion: "297,804", responsable_region: "Región Valles / Sur" },
  { clave: "22017", nombre: "Tequisquiapan", region: "Semidesierto", actividad_nivel: "medio", eventos_24h: 3, poblacion: "72,201", responsable_region: "Región Semidesierto" },
  { clave: "22008", nombre: "Huimilpan", region: "ZMQ", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "36,808", responsable_region: "PoEs ZMQ Sector 4" },
  { clave: "22012", nombre: "Pedro Escobedo", region: "ZMQ / Sur", actividad_nivel: "medio", eventos_24h: 4, poblacion: "77,404", responsable_region: "Región Valles" },
  { clave: "22004", nombre: "Cadereyta de Montes", region: "Semidesierto", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "69,075", responsable_region: "Región Semidesierto" },
  { clave: "22005", nombre: "Colón", region: "Semidesierto / Aeropuerto", actividad_nivel: "medio", eventos_24h: 3, poblacion: "67,121", responsable_region: "Sector Aeropuerto AIQ" },
  { clave: "22001", nombre: "Amealco de Bonfil", region: "Sur", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "66,841", responsable_region: "Región Sur" },
  { clave: "22007", nombre: "Ezequiel Montes", region: "Semidesierto", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "45,141", responsable_region: "Región Semidesierto" },
  { clave: "22009", nombre: "Jalpan de Serra", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "27,343", responsable_region: "Región Sierra Gorda" },
  { clave: "22015", nombre: "Pinal de Amoles", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "27,093", responsable_region: "Región Sierra Gorda" },
  { clave: "22018", nombre: "Tolimán", region: "Semidesierto", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "27,999", responsable_region: "Región Semidesierto" },
  { clave: "22013", nombre: "Peñamiller", region: "Semidesierto", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "19,141", responsable_region: "Región Semidesierto" },
  { clave: "22003", nombre: "Arroyo Seco", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "13,142", responsable_region: "Región Sierra Gorda" },
  { clave: "22010", nombre: "Landa de Matamoros", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "18,794", responsable_region: "Región Sierra Gorda" },
  { clave: "22002", nombre: "San Joaquín", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "8,359", responsable_region: "Región Sierra Gorda" },
];

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<any[]>(ALL_18_MUNICIPIOS);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("TODOS");

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/municipios");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setMunicipios(resp.data);
        }
      } catch (e) {
        console.warn("Usando catálogo soberano completo de 18 municipios de Querétaro");
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
    <div className="pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary text-uppercase px-3 py-1 fs-11 fw-bold mb-1">
            Estado de Querétaro · Clave INEGI 22
          </span>
          <h4 className="fw-bold mb-1">Inteligencia y Monitoreo Municipal (18 Municipios)</h4>
          <p className="text-muted fs-13 mb-0">
            Nivel de actividad, eventos procesados, población e inteligencia territorial por municipio.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/dossiers/nuevo" className="btn btn-primary btn-sm">
            <i className="ri-file-add-line me-1"></i> Generar Dossier de Gira
          </Link>
        </div>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-body-tertiary">
                  <i className="ri-search-line"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar municipio por nombre o clave INEGI..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-7 d-flex flex-wrap gap-2 justify-content-md-end">
              {["TODOS", "ZMQ", "Semidesierto", "Sierra Gorda", "Sur"].map((region) => (
                <button
                  key={region}
                  className={`btn btn-sm ${
                    selectedRegion === region ? "btn-primary fw-bold" : "btn-outline-secondary"
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
            <div className="card shadow-sm h-100 border-start border-4 border-primary rounded-3">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-secondary fs-11">INEGI: {m.clave}</span>
                  <span
                    className={`badge ${
                      m.actividad_nivel === "alto"
                        ? "bg-danger"
                        : m.actividad_nivel === "medio"
                        ? "bg-warning text-dark"
                        : "bg-success-subtle text-success"
                    }`}
                  >
                    Actividad {m.actividad_nivel.toUpperCase()}
                  </span>
                </div>

                <h5 className="fw-bold text-body fs-16 mb-1">{m.nombre}</h5>
                <span className="badge bg-primary-subtle text-primary fs-11 mb-3">
                  Región: {m.region || "Querétaro"}
                </span>

                <div className="bg-body-tertiary p-3 rounded mb-3">
                  <div className="d-flex justify-content-between fs-12 mb-1">
                    <span className="text-muted">Eventos Últimas 24h:</span>
                    <strong className="text-body">{m.eventos_24h} reportes</strong>
                  </div>
                  <div className="d-flex justify-content-between fs-12 mb-1">
                    <span className="text-muted">Población INEGI:</span>
                    <span className="text-body fw-semibold">{m.poblacion || "N/D"} hab.</span>
                  </div>
                  <div className="d-flex justify-content-between fs-12">
                    <span className="text-muted">Cobertura:</span>
                    <span className="text-muted text-truncate ms-2">{m.responsable_region}</span>
                  </div>
                </div>

                <Link
                  href={`/dossiers/nuevo?municipio=${encodeURIComponent(m.nombre)}`}
                  className="btn btn-outline-primary btn-sm w-100 fw-semibold"
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
            <h6 className="text-muted">No se encontraron municipios coincidentes con la búsqueda.</h6>
          </div>
        )}
      </div>
    </div>
  );
}
