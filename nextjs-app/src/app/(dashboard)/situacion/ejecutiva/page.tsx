"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

export default function SituacionEjecutivaGobernadorPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());

  useEffect(() => {
    setStateCfg(getStateConfig());
  }, []);

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-4 pb-5 mb-5" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header & Banner de saludo al Gobernador */}
      <div className="card bg-white border-0 shadow-sm mb-4 rounded-4 overflow-hidden border-start border-5 border-primary">
        <div className="card-body p-4 p-md-5 bg-white">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-primary text-white text-uppercase px-3 py-2 fs-12 fw-bold mb-3 shadow-sm rounded-pill">
                {stateCfg.governorTitle}
              </span>
              <h2 className="fw-extrabold mb-2 display-6" style={{ color: "#1e3a8a" }}>
                {stateCfg.welcomeTitle}
              </h2>
              <p className="mb-0 fs-15 lh-lg fw-bold" style={{ color: "#334155" }}>
                Resumen procesado de inteligencia territorial, paz pública y proyectos estratégicos para el {stateCfg.name}.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/briefing" className="btn btn-primary btn-lg fw-bold text-white px-4 py-3 shadow-sm">
                <i className="ri-file-text-line me-2"></i> Briefing Matutino (05:30 AM)
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores Clave de Alerta */}
      <div className="row g-4 mb-4">
        {/* Paz Pública */}
        <div className="col-md-3">
          <div className="card bg-white border-0 shadow-sm border-start border-4 border-success rounded-3 h-100 p-4">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-success text-white rounded-circle p-2 me-3 fs-20 text-center shadow-sm">
                <i className="ri-shield-check-line"></i>
              </div>
              <div>
                <span className="text-dark fs-12 text-uppercase fw-bold" style={{ color: "#0f172a" }}>Paz Pública</span>
                <h5 className="fw-extrabold mb-0 text-success fs-16">Estable (Verde)</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Municipios en Calma */}
        <div className="col-md-3">
          <div className="card bg-white border-0 shadow-sm border-start border-4 border-primary rounded-3 h-100 p-4">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-primary text-white rounded-circle p-2 me-3 fs-20 text-center shadow-sm">
                <i className="ri-map-pin-2-line"></i>
              </div>
              <div>
                <span className="text-dark fs-12 text-uppercase fw-bold" style={{ color: "#0f172a" }}>Municipios en Calma</span>
                <h5 className="fw-extrabold mb-0 text-primary fs-16" style={{ color: "#1d4ed8" }}>{stateCfg.coberturaText}</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Movilidad Urbana */}
        <div className="col-md-3">
          <div className="card bg-white border-0 shadow-sm border-start border-4 border-warning rounded-3 h-100 p-4">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-warning text-dark rounded-circle p-2 me-3 fs-20 text-center shadow-sm fw-bold">
                <i className="ri-route-line"></i>
              </div>
              <div>
                <span className="text-dark fs-12 text-uppercase fw-bold" style={{ color: "#0f172a" }}>Movilidad Urbana</span>
                <h5 className="fw-extrabold mb-0 text-warning fs-16" style={{ color: "#b45309" }}>Tránsito Fluido</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Proyecto Estratégico */}
        <div className="col-md-3">
          <div className="card bg-white border-0 shadow-sm border-start border-4 border-info rounded-3 h-100 p-4">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-info text-white rounded-circle p-2 me-3 fs-20 text-center shadow-sm">
                <i className="ri-drop-line"></i>
              </div>
              <div>
                <span className="text-dark fs-12 text-uppercase fw-bold" style={{ color: "#0f172a" }}>Estrategia Estatal</span>
                <h5 className="fw-extrabold mb-0 text-info fs-16" style={{ color: "#0284c7" }}>En Avance</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prioridades Estratégicas del Día Dinámicas */}
      <h5 className="fw-extrabold text-dark mb-3 fs-18" style={{ color: "#0f172a" }}>Prioridades Estratégicas del Día</h5>
      <div className="row g-4 mb-4">
        {stateCfg.prioridades.map((p, idx) => (
          <div key={idx} className="col-md-4">
            <div className={`card bg-white border-0 h-100 border-start border-4 ${p.border} shadow-sm rounded-3`}>
              <div className="card-body p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className={`badge ${p.badgeBg} px-3 py-1 fs-12 fw-bold shadow-sm`}>
                    {p.tag}
                  </span>
                  <span className="fs-12 text-dark fw-bold" style={{ color: "#0f172a" }}>{p.region}</span>
                </div>
                <h5 className="fw-extrabold text-dark fs-16 mb-2" style={{ color: "#0f172a" }}>{p.titulo}</h5>
                <p className="fs-14 text-dark fw-semibold lh-base mb-0" style={{ color: "#334155" }}>
                  {p.descripcion}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Síntesis del Briefing Matutino */}
      <div className="card bg-white border-0 shadow-sm rounded-3 mb-4 overflow-hidden border-top border-4 border-primary">
        <div className="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 fw-extrabold text-white fs-18">Síntesis Ejecutiva Matutina</h5>
          <span className="badge bg-white text-primary fs-12 fw-bold shadow-sm">Emitido 05:30 AM</span>
        </div>
        <div className="card-body p-4 p-md-5 bg-white">
          <p className="fs-15 lh-lg text-dark fw-bold mb-3" style={{ color: "#0f172a" }}>
            {stateCfg.sintesisEjecutiva}
          </p>
          <p className="fs-15 lh-lg text-dark fw-bold mb-0" style={{ color: "#0f172a" }}>
            No se registran amenazas extraordinarias a la paz social ni a la gobernabilidad. Los servicios esenciales de agua, transporte y energía operan con normalidad en el {stateCfg.name}.
          </p>
        </div>
      </div>

      {/* Acciones Rápidas del Gobernador */}
      <div className="d-flex flex-wrap gap-3 pt-2 pb-5">
        <Link href="/gabinete" className="btn btn-outline-primary fw-bold px-4 py-2">
          <i className="ri-tv-2-line me-2"></i> Ver Modo Proyector de Gabinete
        </Link>
        <Link href="/dossiers/nuevo" className="btn btn-outline-secondary fw-bold px-4 py-2">
          <i className="ri-file-add-line me-2"></i> Solicitar Dossier Especial
        </Link>
        <Link href="/municipios" className="btn btn-outline-info fw-bold px-4 py-2">
          <i className="ri-map-pin-line me-2"></i> Explorar Mapa Municipal
        </Link>
      </div>
    </div>
  );
}
