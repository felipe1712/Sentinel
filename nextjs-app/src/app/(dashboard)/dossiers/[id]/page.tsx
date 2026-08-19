"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

const DEFAULT_DOSSIER_MAP: Record<string, any> = {
  dos_qro_01: {
    id: "dos_qro_01",
    type: "Gira Municipal",
    title: "Dossier Estratégico · Gira de Trabajo Santiago de Querétaro",
    bluf: "Análisis situacional de la capital: avance de obras en Paseo 5 de Febrero, coordinación PoEs/C4 municipal y temas prioritarios de concertación vecinal.",
    date: "19 de Agosto, 2026",
    confidence: "Alta (98%)",
    content: {
      situacion_actual: "La capital de Querétaro registra un dinamismo económico sólido con aforo vehicular controlado en arterias principales como Paseo 5 de Febrero y Bernardo Quintana. Se mantiene presencia coordinada de la Policía Estatal (PoEs) y Seguridad Pública Municipal.",
      actores_clave: [
        "Presidente Municipal Constitucional de Santiago de Querétaro",
        "Secretaría de Seguridad Pública Municipal (SSPMQ / C4)",
        "Policía Estatal del Estado de Querétaro (PoEs)",
        "Comités de Concertación Ciudadana y Comercio Organizado (CANACO QRO)"
      ],
      escenarios: {
        optimista: "Reunión de trabajo fluida con respaldo vecinal y anuncio de entrega de obras complementarias.",
        probable: "Diálogo institucional con peticiones ordinarias de agilización vial en cruces secundarios.",
        pesimista: "Cuestionamiento por tiempos de traslado en laterales en horas pico."
      },
      recomendaciones: [
        "Reafirmar el compromiso presupuestal del Estado en infraestructura metropolitana.",
        "Instruir a PoEs mantener el despliegue de grúas y señalización preventiva en nodos críticos.",
        "Agendar corte informativo conjunto con la Presidencia Municipal a las 14:00 hrs."
      ]
    }
  },
  dos_batan_02: {
    id: "dos_batan_02",
    type: "Infraestructura & Agua",
    title: "Dossier de Coyuntura · Proyecto Hídrico Batán Agua para Todos",
    bluf: "Viabilidad financiera y ambiental del acuífero, estado del convenio federal con CONAGUA y estrategia de comunicación institucional.",
    date: "18 de Agosto, 2026",
    confidence: "Muy Alta (99%)",
    content: {
      situacion_actual: "El proyecto hídrico Batán representa la solución estratégica de largo plazo para abastecer de agua potable a la Zona Metropolitana de Querétaro por los próximos 30 años. Se cuenta con aval técnico y seguimiento con la Comisión Nacional del Agua (CONAGUA).",
      actores_clave: [
        "Comisión Estatal del Agua de Querétaro (CEA)",
        "Dirección General de CONAGUA",
        "Secretaría de Desarrollo Sustentable (SEDESU)",
        "Especialistas en Hidrología de la UAQ"
      ],
      escenarios: {
        optimista: "Firma definitiva del convenio de cofinanciamiento federal y arranque de licitaciones de primera fase.",
        probable: "Revisión final del expediente técnico en mesas de trabajo conjuntas.",
        pesimista: "Demoras administrativas en la liberación de participaciones presupuestales federales."
      },
      recomendaciones: [
        "Mantener la interlocución directa al más alto nivel con la Dirección General de CONAGUA.",
        "Desplegar campaña informativa sobre cultura del agua y sustentabilidad hídrica.",
        "Priorizar la transparencia y consulta técnica permanente con colegios de ingenieros."
      ]
    }
  },
  dos_marques_03: {
    id: "dos_marques_03",
    type: "Desarrollo Económico",
    title: "Dossier Regional · Desarrollo Industrial y Data Centers El Marqués",
    type_label: "Desarrollo Económico",
    bluf: "Evaluación de parques industriales, demanda de energía eléctrica, infraestructura carretera y potencial de generación de empleo calificado.",
    date: "17 de Agosto, 2026",
    confidence: "Alta (95%)",
    content: {
      situacion_actual: "El Marqués se consolida como el hub de centros de datos y manufactura avanzada más importante de la región central del país, atrayendo más de $1,200 MDD en inversión extranjera directa.",
      actores_clave: [
        "Presidencia Municipal de El Marqués",
        "Secretaría de Desarrollo Sustentable (SEDESU QRO)",
        "Comisión Federal de Electricidad (CFE Distribución)",
        "Asociación de Parques Industriales de Querétaro (APIQ)"
      ],
      escenarios: {
        optimista: "Anuncio de 3 nuevas inversiones tecnológicas de alto impacto con empleos especializados.",
        probable: "Desarrollo continuo de subestaciones eléctricas privadas y parques ecológicos.",
        pesimista: "Saturación en accesos viales a la carretera 57 en horas de cambio de turno."
      },
      recomendaciones: [
        "Coordinar con CFE la aceleración de subestaciones eléctricas dedicadas.",
        "Reforzar la capacitación técnica mediante la Universidad Aeronáutica y la UAQ.",
        "Supervisar el mantenimiento vial de conectores entre la carretera 57 y los parques industriales."
      ]
    }
  }
};

export default function DossierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get(`/dossiers/${id}`);
        if (resp.data && resp.data.title) {
          setDossier(resp.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Usando catálogo soberano de dossiers de Querétaro");
      }

      // Fallback object matching ID or default
      const key = String(id);
      const fallback = DEFAULT_DOSSIER_MAP[key] || DEFAULT_DOSSIER_MAP["dos_qro_01"];
      setDossier(fallback);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="pb-5 pt-4 text-center">
        <div className="spinner-border text-primary me-2" role="status"></div>
        <span className="fw-bold text-dark fs-15">Cargando Dossier de Inteligencia...</span>
      </div>
    );
  }

  const data = dossier || DEFAULT_DOSSIER_MAP["dos_qro_01"];

  return (
    <div className="pb-5 pt-4 pt-md-5 mt-2" style={{ maxWidth: "950px", margin: "0 auto" }}>
      {/* Header con Margen Generoso */}
      <div className="d-flex align-items-center justify-content-between mb-4 gap-3">
        <div>
          <Link href="/dossiers" className="btn btn-outline-secondary btn-sm fw-bold mb-2">
            <i className="ri-arrow-left-line me-1"></i> Volver a Dossiers
          </Link>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold ms-2 shadow-sm">
            Confidencial · Oficina del Gobernador
          </span>
        </div>
        <button className="btn btn-primary btn-sm fw-bold shadow-sm" onClick={() => window.print()}>
          <i className="ri-printer-line me-1"></i> Imprimir Dossier Oficial
        </button>
      </div>

      {/* Tarjeta Principal del Dossier Modo Claro */}
      <div className="card bg-white border-0 shadow-lg rounded-4 overflow-hidden border-top border-5 border-primary mb-5">
        <div className="card-header bg-white border-bottom p-4 p-md-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase fs-12 px-3 py-2">
              Dossier {data.type || "Ejecutivo"}
            </span>
            <span className="text-dark fs-13 fw-bold" style={{ color: "#334155" }}>
              <i className="ri-calendar-line me-1 text-primary"></i> {data.date || "19 de Agosto, 2026"}
            </span>
          </div>

          <h2 className="fw-extrabold text-dark display-6 mb-3" style={{ color: "#0f172a" }}>
            {data.title}
          </h2>

          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-success text-white fw-bold fs-12 px-3 py-1 shadow-sm">
              Confianza: {data.confidence || "Alta (98%)"}
            </span>
            <span className="badge bg-secondary-subtle text-dark fw-bold fs-12 px-3 py-1">
              Estado de Querétaro
            </span>
          </div>
        </div>

        <div className="card-body p-4 p-md-5 bg-white">
          {/* BLUF Box */}
          <div className="p-4 bg-light rounded-3 border-start border-5 border-primary mb-5 shadow-sm">
            <h6 className="fw-extrabold text-primary text-uppercase fs-12 mb-2" style={{ color: "#1e40af" }}>
              <i className="ri-shield-flash-line me-1"></i> BLUF (Bottom Line Up Front)
            </h6>
            <p className="mb-0 fs-15 lh-lg fw-bold text-dark" style={{ color: "#0f172a" }}>
              {data.bluf}
            </p>
          </div>

          {/* 1. Situación Actual */}
          <div className="mb-5">
            <h5 className="fw-extrabold text-primary border-bottom border-gray-300 pb-3 mb-3 fs-18" style={{ color: "#1e40af" }}>
              1. Situación Actual & Diagnóstico Territorial
            </h5>
            <p className="fs-15 lh-lg text-dark fw-semibold" style={{ color: "#0f172a" }}>
              {data.content?.situacion_actual || "Diagnóstico estratégico actualizado para el Estado de Querétaro."}
            </p>
          </div>

          {/* 2. Actores Clave */}
          {data.content?.actores_clave && (
            <div className="mb-5">
              <h5 className="fw-extrabold text-primary border-bottom border-gray-300 pb-3 mb-3 fs-18" style={{ color: "#1e40af" }}>
                2. Actores Clave & Dependencias Involucradas
              </h5>
              <div className="row g-3">
                {data.content.actores_clave.map((actor: string, idx: number) => (
                  <div key={idx} className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border border-gray-300 d-flex align-items-center">
                      <i className="ri-user-star-fill text-primary fs-20 me-3"></i>
                      <span className="fw-bold text-dark fs-14" style={{ color: "#0f172a" }}>{actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Escenarios Prospectivos */}
          {data.content?.escenarios && (
            <div className="mb-5">
              <h5 className="fw-extrabold text-primary border-bottom border-gray-300 pb-3 mb-3 fs-18" style={{ color: "#1e40af" }}>
                3. Escenarios Prospectivos de Gestión
              </h5>
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="p-4 bg-white rounded-3 border border-success border-2 shadow-sm h-100">
                    <span className="badge bg-success text-white fw-bold fs-11 text-uppercase mb-2 shadow-sm">
                      Escenario Optimista
                    </span>
                    <p className="fs-13 text-dark fw-semibold mb-0" style={{ color: "#0f172a" }}>
                      {data.content.escenarios.optimista}
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-4 bg-white rounded-3 border border-primary border-2 shadow-sm h-100">
                    <span className="badge bg-primary text-white fw-bold fs-11 text-uppercase mb-2 shadow-sm">
                      Escenario Probable
                    </span>
                    <p className="fs-13 text-dark fw-semibold mb-0" style={{ color: "#0f172a" }}>
                      {data.content.escenarios.probable}
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-4 bg-white rounded-3 border border-danger border-2 shadow-sm h-100">
                    <span className="badge bg-danger text-white fw-bold fs-11 text-uppercase mb-2 shadow-sm">
                      Escenario Pesimista
                    </span>
                    <p className="fs-13 text-dark fw-semibold mb-0" style={{ color: "#0f172a" }}>
                      {data.content.escenarios.pesimista}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Recomendaciones */}
          {data.content?.recomendaciones && (
            <div>
              <h5 className="fw-extrabold text-primary border-bottom border-gray-300 pb-3 mb-3 fs-18" style={{ color: "#1e40af" }}>
                4. Recomendaciones de Acción Política para el Gobernador
              </h5>
              <ul className="list-group list-group-flush">
                {data.content.recomendaciones.map((rec: string, idx: number) => (
                  <li key={idx} className="list-group-item bg-white text-dark fw-bold fs-14 border-bottom py-3 px-0 d-flex align-items-start" style={{ color: "#0f172a" }}>
                    <i className="ri-checkbox-circle-fill text-success fs-18 me-2 mt-0"></i>
                    <span style={{ color: "#0f172a" }}>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
