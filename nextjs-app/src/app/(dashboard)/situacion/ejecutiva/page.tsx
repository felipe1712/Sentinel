"use client";

import React from "react";
import Link from "next/link";

export default function SituacionEjecutivaGobernadorPage() {
  return (
    <div className="container-fluid" style={{ maxWidth: "1000px" }}>
      {/* Banner de saludo al Gobernador */}
      <div className="card bg-primary text-white mb-4 shadow">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="badge bg-white text-primary text-uppercase px-3 py-1 fs-12 fw-bold mb-2">
                Vista Exclusiva del Gobernador
              </span>
              <h3 className="fw-bold text-white mb-1">
                Bienvenido, Señor Gobernador
              </h3>
              <p className="mb-0 text-white-50 fs-14">
                Resumen procesado de inteligencia y gobernabilidad para el Estado de Querétaro.
              </p>
            </div>
            <Link href="/briefing" className="btn btn-light btn-md fw-bold text-primary">
              <i className="ri-file-text-line me-1"></i> Abrir Briefing Matutino (05:30)
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Asuntos Principales de Hoy */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card h-100 border-start border-4 border-danger shadow-sm">
            <div className="card-body">
              <span className="badge bg-danger-subtle text-danger mb-2">Prioridad 1 · Movilidad</span>
              <h5 className="fw-bold text-body fs-15 mb-2">Paseo 5 de Febrero</h5>
              <p className="fs-13 text-muted mb-0">
                Operativo especial de agilidad vial atendido por PoEs y municipio. Tránsito fluido.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-start border-4 border-warning shadow-sm">
            <div className="card-body">
              <span className="badge bg-warning-subtle text-dark mb-2">Prioridad 2 · Clima</span>
              <h5 className="fw-bold text-body fs-15 mb-2">Monitoreo El Marqués</h5>
              <p className="fs-13 text-muted mb-0">
                Drenes y cauces en niveles de seguridad. Protección Civil en vigilancia preventiva.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-start border-4 border-success shadow-sm">
            <div className="card-body">
              <span className="badge bg-success-subtle text-success mb-2">Prioridad 3 · Agua</span>
              <h5 className="fw-bold text-body fs-15 mb-2">Sistema Batán</h5>
              <p className="fs-13 text-muted mb-0">
                Consenso favorable con la federación para la viabilidad técnica del proyecto hídrico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Síntesis del Briefing Matutino */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-body-tertiary">
          <h5 className="card-title mb-0 fw-bold">Síntesis Ejecutiva Matutina</h5>
        </div>
        <div className="card-body">
          <p className="fs-15 lh-base text-body mb-0">
            Durante las últimas 24 horas, las corporaciones de seguridad y protección civil del Estado de Querétaro mantuvieron una cobertura efectiva en los 18 municipios. La coordinación con los alcaldes metropolitanos permanece estable. No se registran amenazas extraordinarias a la paz ni a la gobernabilidad del estado.
          </p>
        </div>
      </div>
    </div>
  );
}
