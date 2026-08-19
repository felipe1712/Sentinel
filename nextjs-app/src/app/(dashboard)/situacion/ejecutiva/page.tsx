"use client";

import React from "react";
import Link from "next/link";

export default function SituacionEjecutivaGobernadorPage() {
  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-4 pb-5 mb-5" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header & Banner de saludo al Gobernador (Texto en Azul Medio Oscuro #1e3a8a) */}
      <div className="card bg-white border-0 shadow-sm mb-4 rounded-4 overflow-hidden border-start border-5 border-primary">
        <div className="card-body p-4 p-md-5 bg-white">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-primary text-white text-uppercase px-3 py-2 fs-12 fw-bold mb-3 shadow-sm rounded-pill">
                Despacho del Gobernador · Estado de Querétaro
              </span>
              <h2 className="fw-extrabold mb-2 display-6" style={{ color: "#1e3a8a" }}>
                Bienvenido, Señor Gobernador
              </h2>
              <p className="mb-0 fs-15 lh-lg fw-bold" style={{ color: "#334155" }}>
                Resumen procesado de inteligencia territorial, paz pública y proyectos estratégicos del estado.
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

      {/* Indicadores Clave de Alerta con Colores Representativos y Texto Negro Progresivo */}
      <div className="row g-4 mb-4">
        {/* Paz Pública: Verde / Estable */}
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

        {/* Municipios en Calma: Azul / 18/18 */}
        <div className="col-md-3">
          <div className="card bg-white border-0 shadow-sm border-start border-4 border-primary rounded-3 h-100 p-4">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-primary text-white rounded-circle p-2 me-3 fs-20 text-center shadow-sm">
                <i className="ri-map-pin-2-line"></i>
              </div>
              <div>
                <span className="text-dark fs-12 text-uppercase fw-bold" style={{ color: "#0f172a" }}>Municipios en Calma</span>
                <h5 className="fw-extrabold mb-0 text-primary fs-16" style={{ color: "#1d4ed8" }}>18 / 18 Cobertura</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Movilidad Urbana: Ambar / Fluido */}
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

        {/* Proyecto Hídrico: Teal / Batán Avanzado */}
        <div className="col-md-3">
          <div className="card bg-white border-0 shadow-sm border-start border-4 border-info rounded-3 h-100 p-4">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-info text-white rounded-circle p-2 me-3 fs-20 text-center shadow-sm">
                <i className="ri-drop-line"></i>
              </div>
              <div>
                <span className="text-dark fs-12 text-uppercase fw-bold" style={{ color: "#0f172a" }}>Proyecto Hídrico</span>
                <h5 className="fw-extrabold mb-0 text-info fs-16" style={{ color: "#0284c7" }}>Batán Avanzado</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prioridades Estratégicas del Día */}
      <h5 className="fw-extrabold text-dark mb-3 fs-18" style={{ color: "#0f172a" }}>Prioridades Estratégicas del Día</h5>
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card bg-white border-0 h-100 border-start border-4 border-danger shadow-sm rounded-3">
            <div className="card-body p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-danger text-white px-3 py-1 fs-12 fw-bold shadow-sm">
                  Prioridad 1 · Movilidad
                </span>
                <span className="fs-12 text-dark fw-bold" style={{ color: "#0f172a" }}>ZMQ</span>
              </div>
              <h5 className="fw-extrabold text-dark fs-16 mb-2" style={{ color: "#0f172a" }}>Paseo 5 de Febrero</h5>
              <p className="fs-14 text-dark fw-semibold lh-base mb-0" style={{ color: "#334155" }}>
                Operativo especial de agilidad vial atendido por PoEs y municipio en nodos estratégicos. Flujo vehicular continuo en horas pico.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-white border-0 h-100 border-start border-4 border-warning shadow-sm rounded-3">
            <div className="card-body p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-warning text-dark px-3 py-1 fs-12 fw-bold shadow-sm">
                  Prioridad 2 · Prevención
                </span>
                <span className="fs-12 text-dark fw-bold" style={{ color: "#0f172a" }}>El Marqués</span>
              </div>
              <h5 className="fw-extrabold text-dark fs-16 mb-2" style={{ color: "#0f172a" }}>Monitoreo Hidrológico</h5>
              <p className="fs-14 text-dark fw-semibold lh-base mb-0" style={{ color: "#334155" }}>
                Drenes y cauces en niveles de seguridad. Coordinación preventiva de Protección Civil estatal y municipal activa.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-white border-0 h-100 border-start border-4 border-success shadow-sm rounded-3">
            <div className="card-body p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-success text-white px-3 py-1 fs-12 fw-bold shadow-sm">
                  Prioridad 3 · Agua
                </span>
                <span className="fs-12 text-dark fw-bold" style={{ color: "#0f172a" }}>Federal</span>
              </div>
              <h5 className="fw-extrabold text-dark fs-16 mb-2" style={{ color: "#0f172a" }}>Sistema Batán Agua para Todos</h5>
              <p className="fs-14 text-dark fw-semibold lh-base mb-0" style={{ color: "#334155" }}>
                Consenso favorable con la CONAGUA y dependencias federales para la viabilidad técnica y financiamiento del proyecto hídrico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Síntesis del Briefing Matutino - Colores Invertidos */}
      <div className="card bg-white border-0 shadow-sm rounded-3 mb-4 overflow-hidden border-top border-4 border-primary">
        <div className="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 fw-extrabold text-white fs-18">Síntesis Ejecutiva Matutina</h5>
          <span className="badge bg-white text-primary fs-12 fw-bold shadow-sm">Emitido 05:30 AM</span>
        </div>
        <div className="card-body p-4 p-md-5 bg-white">
          <p className="fs-15 lh-lg text-dark fw-bold mb-3" style={{ color: "#0f172a" }}>
            Durante las últimas 24 horas, las corporaciones de seguridad y protección civil del Estado de Querétaro mantuvieron una cobertura efectiva en los 18 municipios. La coordinación institucional con la XVII Zona Militar y la Guardia Nacional permanece sin novedad de relevancia.
          </p>
          <p className="fs-15 lh-lg text-dark fw-bold mb-0" style={{ color: "#0f172a" }}>
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
