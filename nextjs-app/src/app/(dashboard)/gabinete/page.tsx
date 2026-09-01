"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SemaforoCard from "@/components/velzon/SemaforoCard";
import api from "@/lib/api";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

// Dynamically import SituacionalMap
const SituacionalMap = dynamic(
  () => import("@/components/velzon/SituacionalMap"),
  { ssr: false, loading: () => <div className="p-5 text-center text-dark fs-16 fw-bold">Cargando Mapa del Estado...</div> }
);

interface DrilldownItem {
  type: "municipio" | "area";
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  eventsCount?: number;
  description: string;
  relevance: number;
  actions: string[];
  timeline: { time: string; text: string }[];
}

export default function GabineteView() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [isCrisis, setIsCrisis] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [diarioResumenes, setDiarioResumenes] = useState<any[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<DrilldownItem | null>(null);

  const detailPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    const today = new Date().toISOString().split("T")[0];

    const firstM = cfg.municipios[0];
    setSelectedDetail({
      type: "municipio",
      title: firstM.nombre,
      subtitle: `${cfg.name} · Clave ${firstM.clave}`,
      badge: `ALERTA OPERATIVA · ${firstM.eventos_24h} INCIDENTES`,
      badgeColor: "bg-danger text-white",
      eventsCount: firstM.eventos_24h,
      relevance: 9,
      description: `Operativo especial y seguimiento situacional en ${firstM.nombre}. Intervención continua de corporaciones de seguridad y monitoreo de movilidad en accesos principales.`,
      actions: [
        `Mantener presencia de mandos operativos en ${firstM.nombre}.`,
        "Coordinación con Comunicación Social para avisos oficiales en tiempo real.",
        "Sugerir corte informativo al despacho ejecutivo a las 14:00 hrs.",
      ],
      timeline: [
        { time: "05:30 AM", text: "Reporte matutino registra aforo elevado y patrullaje preventivo." },
        { time: "07:15 AM", text: "Despliegue coordinado en nodos de mayor movilidad." },
        { time: "08:45 AM", text: "Monitoreo continuo de cámaras de videovigilancia." },
      ],
    });

    async function load() {
      try {
        const [snapResp, diarioResp] = await Promise.all([
          api.get("/cabinet/snapshot"),
          api.get(`/diario/resumenes/${cfg.stateId}/${today}`).catch(() => ({ data: [] })),
        ]);
        setSnapshot(snapResp.data);
        if (diarioResp && Array.isArray(diarioResp.data)) {
          setDiarioResumenes(diarioResp.data);
        }
      } catch (e) {
        console.error("Error cargando gabinete:", e);
      }
    }
    load();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setIsCrisis((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectMunicipio = (nombre: string) => {
    const mMatch = stateCfg.municipios.find((item) => item.nombre.toLowerCase().includes(nombre.toLowerCase())) || stateCfg.municipios[0];

    setSelectedDetail({
      type: "municipio",
      title: mMatch.nombre,
      subtitle: `${stateCfg.name} · Región ${mMatch.region} (Clave ${mMatch.clave})`,
      badge: `ACTIVIDAD ${mMatch.actividad_nivel.toUpperCase()} · ${mMatch.eventos_24h} EVENTOS`,
      badgeColor: mMatch.actividad_nivel === "alto" ? "bg-danger text-white" : "bg-warning text-dark fw-bold",
      eventsCount: mMatch.eventos_24h,
      relevance: 9,
      description: `Monitoreo situacional y cobertura de seguridad en ${mMatch.nombre}. Cobertura activa a cargo de ${mMatch.responsable_region}.`,
      actions: [
        `Reforzar vigilancia en accesos y vías principales de ${mMatch.nombre}.`,
        "Mantener comunicación constante con la alcaldía municipal.",
        "Verificar disponibilidad de unidades de protección civil.",
      ],
      timeline: [
        { time: "05:30 AM", text: "Briefing 05:30 AM registra condiciones bajo control." },
        { time: "08:00 AM", text: `Inspección operativa de la región ${mMatch.region}.` },
      ],
    });

    setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSelectArea = (areaName: string, nivel: string, color: string, mensaje: string) => {
    setSelectedDetail({
      type: "area",
      title: `Ramo: ${areaName}`,
      subtitle: `Evaluación de Gobernabilidad · ${stateCfg.name}`,
      badge: nivel,
      badgeColor: color === "danger" ? "bg-danger text-white" : color === "warning" ? "bg-warning text-dark fw-bold" : "bg-success text-white",
      relevance: 9,
      description: mensaje,
      actions: [
        `Instruir seguimiento prioritario a la secretaría del ramo (${areaName}).`,
        "Mantener informada a la Oficina Ejecutiva sobre cambios de semáforo.",
        "Coordinar apoyo institucional con las dependencias involucradas.",
      ],
      timeline: [
        { time: "05:30 AM", text: "Evaluación matutina de semáforos estatales." },
        { time: "08:00 AM", text: "Actualización de indicadores de gobernabilidad." },
      ],
    });

    setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const miniGto = diarioResumenes.find((r) => r.document_type === "primeras_planas_estatal")?.mini_resumen;
  const miniSintesis = diarioResumenes.find((r) => r.document_type === "sintesis_estatal")?.mini_resumen?.split(".")[0];

  return (
    <div
      className={`min-vh-100 pt-4 pt-md-5 mt-2 px-3 px-md-4 px-lg-5 pb-5 ${
        isCrisis ? "bg-danger-subtle text-danger-emphasis" : "bg-light text-dark"
      }`}
      style={{ fontSize: "1.15rem", maxWidth: "1600px", margin: "0 auto" }}
    >
      {/* Header Proyector Modo Claro */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-bottom border-gray-300 pb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white px-3 py-2 fs-13 text-uppercase fw-bold mb-2 shadow-sm">
            SALA DE GABINETE DE GOBIERNO · {stateCfg.name.toUpperCase()}
          </span>
          <h2 className="fw-extrabold text-dark mb-0 fs-28" style={{ color: "#0f172a" }}>
            Monitoreo Estratégico en Tiempo Real
          </h2>
        </div>
        <div className="text-md-end pt-1">
          <div className="fs-13 text-dark text-uppercase fw-bold mb-1" style={{ color: "#0f172a" }}>Nivel de Alerta General</div>
          <span className={`badge fs-16 px-4 py-2 shadow ${isCrisis ? "bg-danger text-white" : "bg-warning text-dark fw-bold"}`}>
            {isCrisis ? "CRISIS ACTIVA (CTRL+ALT+C)" : snapshot?.alert_level || "ALERTA PREVENTIVA"}
          </span>
        </div>
      </div>

      {/* Layout 2 Columnas Proyector Modo Claro */}
      <div className="row g-4 mb-4">
        {/* Izquierda (60%): Mapa Situacional Interactivo Modo Claro */}
        <div className="col-lg-7">
          <div className="card bg-white border-0 overflow-hidden shadow-sm h-100 rounded-3">
            <div className="card-header bg-white border-bottom py-3">
              <h4 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                <i className="ri-map-pin-2-fill text-danger me-2"></i> Mapa de Calor {stateCfg.shortName}
              </h4>
            </div>
            <div className="card-body p-0 bg-white position-relative">
              <SituacionalMap onSelectMunicipio={handleSelectMunicipio} />
            </div>
            <div className="card-footer bg-white border-top p-3 d-flex flex-wrap gap-2 justify-content-center">
              {stateCfg.municipios.slice(0, 4).map((m, idx) => (
                <button
                  key={m.clave}
                  className={`btn ${idx === 0 ? "btn-outline-danger" : idx === 1 ? "btn-outline-warning text-dark" : "btn-outline-primary"} btn-sm rounded-pill px-3 fw-bold`}
                  onClick={() => handleSelectMunicipio(m.nombre)}
                >
                  {m.nombre} ({m.eventos_24h} evt)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Derecha (40%): Semáforos Interactivos + Prensa de Hoy */}
        <div className="col-lg-5">
          <div className="card bg-white border-0 h-100 shadow-sm rounded-3">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h4 className="card-title mb-0 fw-extrabold text-dark fs-18" style={{ color: "#0f172a" }}>Semáforos por Ramo</h4>
              <span className="badge bg-primary text-white fs-10 fw-bold">Clic para seleccionar &darr;</span>
            </div>
            <div className="card-body p-4 bg-white d-flex flex-column gap-3">
              <div
                className="cursor-pointer transition-all hover-shadow"
                onClick={() =>
                  handleSelectArea(
                    `Seguridad Pública & Paz (${stateCfg.shortName})`,
                    "ALERTA PREVENTIVA",
                    "danger",
                    stateCfg.prioridades[0]?.descripcion || "Operativo de agilidad y patrullaje preventivo."
                  )
                }
              >
                <SemaforoCard
                  area={`Seguridad Pública & Paz (${stateCfg.shortName})`}
                  nivel="ALERTA PREVENTIVA"
                  color="danger"
                  mensaje={stateCfg.prioridades[0]?.descripcion}
                  tendencia="subiendo"
                />
              </div>

              <div
                className="cursor-pointer transition-all hover-shadow"
                onClick={() =>
                  handleSelectArea(
                    "Protección Civil & Clima",
                    "VIGILANCIA PREVENTIVA",
                    "warning",
                    stateCfg.prioridades[1]?.descripcion || "Monitoreo pluvial e hidrológico."
                  )
                }
              >
                <SemaforoCard
                  area="Protección Civil & Clima"
                  nivel="VIGILANCIA ORDINARIA"
                  color="warning"
                  mensaje={stateCfg.prioridades[1]?.descripcion}
                  tendencia="estable"
                />
              </div>

              <div
                className="cursor-pointer transition-all hover-shadow"
                onClick={() =>
                  handleSelectArea(
                    "Gobernabilidad & Diálogo",
                    "OPERACIÓN NORMAL",
                    "success",
                    stateCfg.prioridades[2]?.descripcion || "Mesa de concertación de proyectos estratégicos."
                  )
                }
              >
                <SemaforoCard
                  area="Gobernabilidad & Diálogo"
                  nivel="OPERACIÓN NORMAL"
                  color="success"
                  mensaje={stateCfg.prioridades[2]?.descripcion}
                  tendencia="estable"
                />
              </div>

              {/* Mini-sección: PRENSA DE HOY (Pantalla Proyector) */}
              <div className="p-3 bg-light rounded-3 border border-gray-300 shadow-sm mt-1">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary text-white fs-11 fw-bold text-uppercase">
                    📰 PRENSA DE HOY (07:00 AM)
                  </span>
                  <span className="badge bg-success text-white fs-10 fw-bold">OCR Listo</span>
                </div>
                <div className="fs-14 fw-extrabold text-dark mb-1 lh-base" style={{ color: "#0f172a" }}>
                  {miniGto || "Monitoreo matutino de periódicos estatales listo para revisión ejecutiva de la mesa."}
                </div>
                <div className="fs-12 text-muted fw-semibold">
                  {miniSintesis || "Síntesis informativa de dependencias y acuerdos de gobierno."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DE DETALLE & DRILLDOWN MODO CLARO */}
      {selectedDetail && (
        <div ref={detailPanelRef} className="card bg-white border-primary shadow-lg rounded-4 overflow-hidden mb-5 border-2">
          <div className="card-header bg-primary text-white p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div>
              <span className="badge bg-white text-primary text-uppercase px-3 py-1 fs-11 fw-bold mb-1 shadow-sm">
                Panel de Detalle & Drilldown de Gabinete
              </span>
              <h3 className="fw-extrabold text-white mb-0 display-7">{selectedDetail.title}</h3>
              <p className="text-white fw-medium fs-13 mb-0" style={{ color: "#ffffff" }}>{selectedDetail.subtitle}</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={`badge ${selectedDetail.badgeColor} fs-14 px-3 py-2 fw-bold shadow-sm`}>
                {selectedDetail.badge}
              </span>
              <button
                className="btn btn-outline-light btn-sm text-white"
                onClick={() => setSelectedDetail(null)}
                title="Cerrar panel"
              >
                <i className="ri-close-line fs-18"></i>
              </button>
            </div>
          </div>

          <div className="card-body p-4 p-md-5 bg-white">
            <div className="row g-4">
              <div className="col-lg-7">
                <h5 className="fw-extrabold text-primary mb-3 fs-16" style={{ color: "#1e40af" }}>
                  <i className="ri-file-text-line me-2"></i> Diagnóstico de Inteligencia Procesada
                </h5>
                <div className="p-4 rounded-3 border border-gray-300 bg-white mb-4 shadow-sm" style={{ borderLeft: "5px solid #2563eb" }}>
                  <p className="fs-15 lh-lg text-dark fw-semibold mb-0" style={{ color: "#0f172a" }}>
                    {selectedDetail.description}
                  </p>
                </div>

                <h5 className="fw-extrabold text-primary mb-3 fs-16" style={{ color: "#1e40af" }}>
                  <i className="ri-checkbox-circle-line me-2"></i> Acciones Sugeridas para la Mesa de Gabinete
                </h5>
                <ul className="list-group list-group-flush mb-4">
                  {selectedDetail.actions.map((act, idx) => (
                    <li key={idx} className="list-group-item bg-white text-dark fw-semibold fs-14 border-bottom py-3 px-0 d-flex align-items-start" style={{ color: "#0f172a" }}>
                      <i className="ri-arrow-right-s-fill text-primary me-2 fs-18 mt-0"></i>
                      <span style={{ color: "#0f172a" }}>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-lg-5">
                <div className="bg-light p-4 rounded-3 border border-gray-300 h-100 shadow-sm">
                  <h5 className="fw-extrabold text-dark mb-3 fs-16" style={{ color: "#0f172a" }}>
                    <i className="ri-history-line me-2 text-warning"></i> Cronología del Incidente (24h)
                  </h5>

                  <div className="timeline-widget mb-4">
                    {selectedDetail.timeline.map((item, idx) => (
                      <div key={idx} className="d-flex mb-3 align-items-start">
                        <span className="badge bg-primary text-white fs-11 me-3 py-1 px-2 font-monospace shadow-sm">
                          {item.time}
                        </span>
                        <div className="fs-13 text-dark fw-bold" style={{ color: "#0f172a" }}>{item.text}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-top border-gray-300 d-flex gap-2">
                    <Link
                      href={`/dossiers/nuevo?municipio=${encodeURIComponent(selectedDetail.title)}`}
                      className="btn btn-primary btn-sm w-100 fw-bold py-2 shadow-sm"
                    >
                      <i className="ri-file-add-line me-1"></i> Solicitar Dossier de Gira
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
