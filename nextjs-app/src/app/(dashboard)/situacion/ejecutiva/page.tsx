"use client";

import React from "react";
import Link from "next/link";

export default function SituacionEjecutivaGobernadorPage() {
  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-4 pb-5 mb-5" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header & Banner de saludo al Gobernador */}
      <div className="card bg-primary bg-gradient text-white mb-4 shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-body p-4 p-md-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-white text-primary text-uppercase px-3 py-2 fs-12 fw-bold mb-3 shadow-sm rounded-pill">
                Despacho del Gobernador · Estado de Querétaro
              </span>
              <h2 className="fw-extrabold text-white mb-2 display-6">
                Bienvenido, Señor Gobernador
              </h2>
              <p className="mb-0 text-white-50 fs-15 lh-lg">
                Resumen procesado de inteligencia territorial, paz pública y proyectos estratégicos del estado.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/briefing" className="btn btn-light btn-lg fw-bold text-primary px-4 py-3 shadow">
                <i className="ri-file-text-line me-2"></i> Briefing Matutino (05:30 AM)
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores Clave de Gobernabilidad */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-3 h-100 p-3 bg-body">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-success-subtle text-success rounded-circle p-2 me-3 fs-20 text-center">
                <i className="ri-shield-check-line"></i>
              </div>
              <div>
                <span className="text-muted fs-12 text-uppercase fw-semibold">Paz Pública</span>
                <h5 className="fw-bold mb-0 text-success">Estable (Verde)</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-3 h-100 p-3 bg-body">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-info-subtle text-info rounded-circle p-2 me-3 fs-20 text-center">
                <i className="ri-map-pin-2-line"></i>
              </div>
              <div>
                <span className="text-muted fs-12 text-uppercase fw-semibold">Municipios en Calma</span>
                <h5 className="fw-bold mb-0 text-body">18 / 18 Cobertura</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-3 h-100 p-3 bg-body">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-warning-subtle text-warning rounded-circle p-2 me-3 fs-20 text-center">
                <i className="ri-route-line"></i>
              </div>
              <div>
                <span className="text-muted fs-12 text-uppercase fw-semibold">Movilidad Urbana</span>
                <h5 className="fw-bold mb-0 text-warning">Tránsito Fluido</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-3 h-100 p-3 bg-body">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-primary-subtle text-primary rounded-circle p-2 me-3 fs-20 text-center">
                <i className="ri-drop-line"></i>
              </div>
              <div>
                <span className="text-muted fs-12 text-uppercase fw-semibold">Proyecto Hídrico</span>
                <h5 className="fw-bold mb-0 text-primary">Batán Avanzado</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Asuntos Principales de Hoy */}
      <h5 className="fw-bold text-body mb-3">Prioridades Estratégicas del Día</h5>
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card h-100 border-start border-4 border-danger shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-danger-subtle text-danger px-3 py-1 fs-12 fw-bold">
                  Prioridad 1 · Movilidad
                </span>
                <span className="fs-12 text-muted">ZMQ</span>
              </div>
              <h5 className="fw-bold text-body fs-16 mb-2">Paseo 5 de Febrero</h5>
              <p className="fs-14 text-muted lh-base mb-0">
                Operativo especial de agilidad vial atendido por PoEs y municipio en nodos estratégicos. Flujo vehicular continuo en horas pico.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-start border-4 border-warning shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-warning-subtle text-dark px-3 py-1 fs-12 fw-bold">
                  Prioridad 2 · Prevención
                </span>
                <span className="fs-12 text-muted">El Marqués</span>
              </div>
              <h5 className="fw-bold text-body fs-16 mb-2">Monitoreo Hidrológico</h5>
              <p className="fs-14 text-muted lh-base mb-0">
                Drenes y cauces en niveles de seguridad. Coordinación preventiva de Protección Civil estatal y municipal activa.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-start border-4 border-success shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-success-subtle text-success px-3 py-1 fs-12 fw-bold">
                  Prioridad 3 · Agua
                </span>
                <span className="fs-12 text-muted">Federal</span>
              </div>
              <h5 className="fw-bold text-body fs-16 mb-2">Sistema Batán Agua para Todos</h5>
              <p className="fs-14 text-muted lh-base mb-0">
                Consenso favorable con la CONAGUA y dependencias federales para la viabilidad técnica y financiamiento del proyecto hídrico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Síntesis del Briefing Matutino */}
      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-header bg-body-tertiary p-4 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 fw-bold fs-16">Síntesis Ejecutiva Matutina</h5>
          <span className="badge bg-dark fs-12">Emitido 05:30 AM</span>
        </div>
        <div className="card-body p-4 p-md-5">
          <p className="fs-15 lh-lg text-body mb-3">
            Durante las últimas 24 horas, las corporaciones de seguridad y protección civil del Estado de Querétaro mantuvieron una cobertura efectiva en los 18 municipios. La coordinación instituciona con la XVII Zona Militar y la Guardia Nacional permanece sin novedad de relevancia.
          </p>
          <p className="fs-15 lh-lg text-body mb-0">
            No se registran amenazas extraordinarias a la paz social ni a la gobernabilidad. Los servicios esenciales de agua, transporte y energía operan con normalidad en las regiones metropolitana, semidesierto y sierra gorda.
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
