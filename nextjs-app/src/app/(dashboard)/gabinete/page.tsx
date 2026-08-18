"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SemaforoCard from "@/components/velzon/SemaforoCard";
import api from "@/lib/api";

// Dynamically import SituacionalMap
const SituacionalMap = dynamic(
  () => import("@/components/velzon/SituacionalMap"),
  { ssr: false, loading: () => <div className="p-5 text-center text-muted fs-16">Cargando Mapa de Calor de Querétaro...</div> }
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
  const [isCrisis, setIsCrisis] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [selectedDetail, setSelectedDetail] = useState<DrilldownItem | null>({
    type: "municipio",
    title: "Santiago de Querétaro",
    subtitle: "Zona Metropolitana de Querétaro (ZMQ)",
    badge: "ALERTA VIAL · 12 INCIDENTES",
    badgeColor: "bg-danger",
    eventsCount: 12,
    relevance: 9,
    description:
      "Operativo especial de agilidad vial en Paseo 5 de Febrero y Zaragoza. Intervención continua de la Policía Estatal (PoEs) y Movilidad Municipal. Tránsito encauzando en carriles centrales sin bloqueos totales.",
    actions: [
      "Mantener despliegue de 45 elementos PoEs en intersecciones clave.",
      "Coordinación con Comunicación Social para avisos viales en tiempo real.",
      "Sugerir corte informativo a la Jefatura de Oficina a las 14:00 hrs.",
    ],
    timeline: [
      { time: "05:30 AM", text: "Reporte matutino C4/PoEs sin bloqueos mayores." },
      { time: "07:15 AM", text: "Incremento de aforo vehicular en Paseo 5 de Febrero." },
      { time: "08:45 AM", text: "Despliegue de grúas y señalización preventiva." },
    ],
  });

  const detailPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/cabinet/snapshot");
        setSnapshot(resp.data);
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
    const dataMap: Record<string, DrilldownItem> = {
      "Santiago de Querétaro": {
        type: "municipio",
        title: "Santiago de Querétaro",
        subtitle: "Zona Metropolitana de Querétaro (ZMQ) · Clave 22014",
        badge: "ALERTA VIAL · 12 INCIDENTES",
        badgeColor: "bg-danger",
        eventsCount: 12,
        relevance: 9,
        description:
          "Operativo especial de agilidad vial en Paseo 5 de Febrero y Zaragoza. Intervención de PoEs y Movilidad Municipal en tramos en obras. Se reportan 3 vehículos varados atendidos en laterales.",
        actions: [
          "Mantener presencia de PoEs en cruces de alta densidad.",
          "Informar avance de flujo vehicular al Gobernador antes de la gira.",
          "Monitorear cámaras C4 en tramo Universidad - Zaragoza.",
        ],
        timeline: [
          { time: "05:30 AM", text: "Briefing 05:30 AM registra aforo elevado." },
          { time: "07:30 AM", text: "Supervisión de carriles exclusivos de transporte." },
          { time: "09:10 AM", text: "Flujo continuo en cuerpo central." },
        ],
      },
      "El Marqués": {
        type: "municipio",
        title: "El Marqués",
        subtitle: "Zona Metropolitana de Querétaro · Clave 22011",
        badge: "VIGILANCIA PREVENTIVA · 7 INCIDENTES",
        badgeColor: "bg-warning text-dark",
        eventsCount: 7,
        relevance: 8,
        description:
          "Monitoreo pluvial e hidrológico en la cuenca del Río Querétaro y drenes en Saldarriaga y Chichimequillas. Capacidad de embalses al 65%. Coordinación con Protección Civil Municipal.",
        actions: [
          "Mantener recorrido de patrullas preventivas en zonas de riesgo.",
          "Verificar desazolve de canales en comunidad Amazcala.",
          "Enlace permanente con el Alcalde de El Marqués.",
        ],
        timeline: [
          { time: "06:00 AM", text: "Inspección visual de cauces sin novedad extraordinaria." },
          { time: "08:00 AM", text: "Reporte meteorológico indica precipitación ligera por la tarde." },
        ],
      },
      "Corregidora": {
        type: "municipio",
        title: "Corregidora",
        subtitle: "Zona Metropolitana de Querétaro · Clave 22006",
        badge: "OPERACIÓN NORMAL · 6 INCIDENTES",
        badgeColor: "bg-primary",
        eventsCount: 6,
        relevance: 7,
        description:
          "Operativo interinstitucional de seguridad y vigilancia en Paseo Constituyentes y Candiles. Coordinación efectiva entre PoEs y Seguridad Pública de Corregidora.",
        actions: [
          "Mantener filtro de revisión metropolitana en límites con Guanajuato.",
          "Supervisión del patrullaje en colonias colindantes.",
        ],
        timeline: [
          { time: "06:30 AM", text: "Verificación de patrullaje metropolitano." },
          { time: "08:30 AM", text: "Tránsito fluido en Constituyentes." },
        ],
      },
      "San Juan del Río": {
        type: "municipio",
        title: "San Juan del Río",
        subtitle: "Región Sur / Valles · Clave 22016",
        badge: "VIGILANCIA CARRETERA · 3 INCIDENTES",
        badgeColor: "bg-success",
        eventsCount: 3,
        relevance: 7,
        description:
          "Coordinación con Guardia Nacional en tramo de la Carretera Federal 57. Tránsito fluido en caseta de cobro y zona industrial. Sin incidentes delictivos mayores.",
        actions: [
          "Monitorear aforo de carga pesada en México-Querétaro.",
          "Mantener comunicación con la cámara nacional de la industria (CANACINTRA SJR).",
        ],
        timeline: [
          { time: "05:00 AM", text: "Inspección de carreteras de acceso sur." },
          { time: "07:45 AM", text: "Apertura completa de carriles en caseta." },
        ],
      },
    };

    const target = dataMap[nombre] || dataMap["Santiago de Querétaro"];
    setSelectedDetail(target);

    setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSelectArea = (areaName: string, nivel: string, color: string, mensaje: string) => {
    setSelectedDetail({
      type: "area",
      title: `Ramo: ${areaName}`,
      subtitle: `Evaluación de Gobernabilidad · Estado de Querétaro`,
      badge: nivel,
      badgeColor: color === "danger" ? "bg-danger" : color === "warning" ? "bg-warning text-dark" : "bg-success",
      relevance: 9,
      description: mensaje,
      actions: [
        `Instruir seguimiento prioritario a la secretaría del ramo (${areaName}).`,
        "Mantener informada a la Oficina del Gobernador sobre cambios de semáforo.",
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

  return (
    <div
      className={`min-vh-100 pt-4 pt-md-5 mt-2 px-3 px-md-4 px-lg-5 pb-5 ${
        isCrisis ? "bg-danger-subtle text-danger-emphasis" : "bg-dark text-white"
      }`}
      style={{ fontSize: "1.15rem", maxWidth: "1600px", margin: "0 auto" }}
    >
      {/* Header Proyector */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-bottom border-secondary pb-4 gap-3">
        <div>
          <span className="badge bg-primary px-3 py-2 fs-13 text-uppercase fw-bold mb-2 shadow-sm">
            SALA DE GABINETE DE GOBIERNO · ESTADO DE QUERÉTARO
          </span>
          <h2 className="fw-extrabold text-white mb-0 fs-28">
            Monitoreo Estratégico en Tiempo Real
          </h2>
        </div>
        <div className="text-md-end pt-1">
          <div className="fs-13 text-muted text-uppercase fw-semibold mb-1">Nivel de Alerta General</div>
          <span className={`badge fs-16 px-4 py-2 shadow ${isCrisis ? "bg-danger text-white" : "bg-warning text-dark"}`}>
            {isCrisis ? "CRISIS ACTIVA (CTRL+ALT+C)" : snapshot?.alert_level || "ALERTA PREVENTIVA"}
          </span>
        </div>
      </div>

      {/* Layout 2 Columnas Proyector */}
      <div className="row g-4 mb-4">
        {/* Izquierda (60%): Mapa Situacional Interactivo */}
        <div className="col-lg-7">
          <div className="card bg-black border-secondary h-100 overflow-hidden shadow-lg">
            <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
              <h4 className="card-title mb-0 fw-bold fs-16 text-white">
                <i className="ri-map-pin-2-fill text-danger me-2"></i> Mapa de Calor Querétaro
              </h4>
              <span className="badge bg-info-subtle text-info fs-11">
                Haz clic en los círculos para hacer Drilldown &darr;
              </span>
            </div>
            <div className="card-body p-0 position-relative">
              <SituacionalMap onSelectMunicipio={handleSelectMunicipio} />
            </div>
            <div className="card-footer bg-dark border-secondary p-3 d-flex flex-wrap gap-2 justify-content-center">
              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                onClick={() => handleSelectMunicipio("Santiago de Querétaro")}
              >
                🔴 Santiago de Querétaro (12 evt)
              </button>
              <button
                className="btn btn-outline-warning btn-sm rounded-pill px-3"
                onClick={() => handleSelectMunicipio("El Marqués")}
              >
                🟡 El Marqués (7 evt)
              </button>
              <button
                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                onClick={() => handleSelectMunicipio("Corregidora")}
              >
                🔵 Corregidora (6 evt)
              </button>
              <button
                className="btn btn-outline-success btn-sm rounded-pill px-3"
                onClick={() => handleSelectMunicipio("San Juan del Río")}
              >
                🟢 San Juan del Río (3 evt)
              </button>
            </div>
          </div>
        </div>

        {/* Derecha (40%): Semáforos Interactivos por Ramo */}
        <div className="col-lg-5">
          <div className="card bg-dark border-secondary h-100 shadow-lg">
            <div className="card-header bg-secondary-subtle border-secondary d-flex justify-content-between align-items-center py-3">
              <h4 className="card-title mb-0 fw-bold fs-18 text-body">Semáforos por Ramo</h4>
              <span className="badge bg-secondary fs-10">Haz clic en un recuadro &darr;</span>
            </div>
            <div className="card-body p-4 d-flex flex-column gap-3">
              <div
                className="cursor-pointer transition-all hover-shadow"
                onClick={() =>
                  handleSelectArea(
                    "Seguridad & Movilidad ZMQ",
                    "ALERTA PREVENTIVA",
                    "danger",
                    "Operativo de agilidad vial en Paseo 5 de Febrero y Bernardo Quintana con 45 elementos de PoEs."
                  )
                }
              >
                <SemaforoCard
                  area="Seguridad & Movilidad ZMQ"
                  nivel="ALERTA PREVENTIVA"
                  color="danger"
                  mensaje="Operativo de agilidad vial en Paseo 5 de Febrero y Bernardo Quintana."
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
                    "Monitoreo pluvial en El Marqués, San Juan del Río y Tequisquiapan. Cauces y presas bajo control."
                  )
                }
              >
                <SemaforoCard
                  area="Protección Civil & Clima"
                  nivel="VIGILANCIA ORDINARIA"
                  color="warning"
                  mensaje="Monitoreo pluvial en El Marqués y San Juan del Río. Cauces bajo control."
                  tendencia="estable"
                />
              </div>

              <div
                className="cursor-pointer transition-all hover-shadow"
                onClick={() =>
                  handleSelectArea(
                    "Gobernabilidad & Congreso",
                    "OPERACIÓN NORMAL",
                    "success",
                    "Mesa de concertación política y diálogo parlamento abierto sobre proyectos de agua e infraestructura."
                  )
                }
              >
                <SemaforoCard
                  area="Gobernabilidad & Congreso"
                  nivel="OPERACIÓN NORMAL"
                  color="success"
                  mensaje="Mesa de concertación de proyectos hídricos avanzando sin fricciones."
                  tendencia="estable"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DE DETALLE & DRILLDOWN SELECCIONADO (Se muestra abajo) */}
      {selectedDetail && (
        <div ref={detailPanelRef} className="card bg-dark-subtle border-primary shadow-lg rounded-4 overflow-hidden mb-5 border-2">
          <div className="card-header bg-primary text-white p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div>
              <span className="badge bg-white text-primary text-uppercase px-3 py-1 fs-11 fw-bold mb-1">
                Panel de Detalle & Drilldown de Gabinete
              </span>
              <h3 className="fw-bold text-white mb-0 display-7">{selectedDetail.title}</h3>
              <p className="text-white-50 fs-13 mb-0">{selectedDetail.subtitle}</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={`badge ${selectedDetail.badgeColor} fs-14 px-3 py-2 fw-bold`}>
                {selectedDetail.badge}
              </span>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => setSelectedDetail(null)}
                title="Cerrar panel"
              >
                <i className="ri-close-line fs-18"></i>
              </button>
            </div>
          </div>

          <div className="card-body p-4 p-md-5">
            <div className="row g-4">
              {/* Columna Izquierda: Diagnóstico Ejecutivo */}
              <div className="col-lg-7">
                <h5 className="fw-bold text-primary mb-3">
                  <i className="ri-file-text-line me-2"></i> Diagnóstico de Inteligencia Procesada
                </h5>
                <p className="fs-15 lh-lg text-body mb-4 bg-body p-3 rounded-3 border border-dark">
                  {selectedDetail.description}
                </p>

                <h5 className="fw-bold text-primary mb-3">
                  <i className="ri-checkbox-circle-line me-2"></i> Acciones Sugeridas para la Mesa de Gabinete
                </h5>
                <ul className="list-group list-group-flush mb-4">
                  {selectedDetail.actions.map((act, idx) => (
                    <li key={idx} className="list-group-item bg-transparent text-body fs-14 border-dark py-2 px-0 d-flex align-items-start">
                      <i className="ri-arrow-right-s-fill text-primary me-2 mt-1"></i>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Columna Derecha: Cronología & Expediente */}
              <div className="col-lg-5">
                <div className="bg-body p-4 rounded-3 border border-dark h-100">
                  <h5 className="fw-bold text-body mb-3 fs-16">
                    <i className="ri-history-line me-2 text-warning"></i> Cronología del Incidente (24h)
                  </h5>

                  <div className="timeline-widget mb-4">
                    {selectedDetail.timeline.map((item, idx) => (
                      <div key={idx} className="d-flex mb-3 align-items-start">
                        <span className="badge bg-secondary-subtle text-body fs-11 me-3 py-1 px-2 font-monospace">
                          {item.time}
                        </span>
                        <div className="fs-13 text-muted">{item.text}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-top border-dark d-flex gap-2">
                    <Link
                      href={`/dossiers/nuevo?municipio=${encodeURIComponent(selectedDetail.title)}`}
                      className="btn btn-primary btn-sm w-100 fw-semibold"
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
