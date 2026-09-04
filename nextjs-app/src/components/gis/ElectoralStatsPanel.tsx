"use client";

import React from "react";
import { ElectoralResult, GisEventItem } from "@/lib/electoralTypes";
import { getPartyColor, PARTY_COLORS } from "@/lib/gisColors";

interface StatsPanelProps {
  selectedSection: any | null;
  sectionResult: ElectoralResult | null;
  associatedEvents: GisEventItem[];
  selectedYear: number;
  totalSectionsCount: number;
  selectedMunicipio: number | null;
  municipiosList: { id: number; nombre: string }[];
  electoralCache: Record<string, Record<string, ElectoralResult>>;
  onClearSelection: () => void;
}

export const ElectoralStatsPanel: React.FC<StatsPanelProps> = ({
  selectedSection,
  sectionResult,
  associatedEvents,
  selectedYear,
  totalSectionsCount,
  selectedMunicipio,
  municipiosList,
  electoralCache,
  onClearSelection,
}) => {
  const currentMpioObj = municipiosList.find((m) => m.id === selectedMunicipio);

  // Calcular agregados si hay un municipio seleccionado
  let mpioTotalVotos = 0;
  let mpioTotalLista = 0;
  let mpioSectionsCount = 0;
  const mpioPartyVotes: Record<string, number> = {};

  if (selectedMunicipio) {
    const yearData = electoralCache[String(selectedYear)] || {};
    Object.values(yearData).forEach((r) => {
      if (r.clave_municipio === selectedMunicipio) {
        mpioSectionsCount++;
        mpioTotalVotos += r.total_votos || 0;
        mpioTotalLista += r.lista_nominal || 0;
        Object.entries(r.votos_partidos || {}).forEach(([p, v]) => {
          mpioPartyVotes[p] = (mpioPartyVotes[p] || 0) + Number(v);
        });
      }
    });
  }

  const mpioSortedParties = Object.entries(mpioPartyVotes).sort(([, a], [, b]) => b - a);
  const mpioGanador = mpioSortedParties[0]?.[0] || null;
  const mpioGanadorVotos = mpioSortedParties[0]?.[1] || 0;
  const mpioParticipacion = mpioTotalLista > 0 ? ((mpioTotalVotos / mpioTotalLista) * 100).toFixed(1) : "0";

  return (
    <div className="card bg-white border-0 shadow-sm rounded-3 h-100 overflow-hidden d-flex flex-column">
      {/* Header del Panel */}
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <div>
          <span className="badge bg-primary text-white fs-10 fw-bold text-uppercase mb-1">
            Análisis Político-Electoral
          </span>
          <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
            {selectedSection
              ? selectedSection.featureTitle || (selectedSection.seccion ? `Sección ${selectedSection.seccion}` : `Distrito ${selectedSection.id}`)
              : selectedMunicipio
              ? `Municipio: ${currentMpioObj?.nombre || selectedMunicipio}`
              : "Resumen Estatal Guanajuato"}
          </h6>
          {selectedSection?.featureSubtitle && (
            <small className="text-muted fs-11 d-block mt-1">
              {selectedSection.featureSubtitle}
            </small>
          )}
        </div>
        {(selectedSection || selectedMunicipio) && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary fw-bold"
            onClick={onClearSelection}
            title="Limpiar selección"
          >
            <i className="ri-close-line"></i>
          </button>
        )}
      </div>

      <div className="card-body p-3 bg-white overflow-auto flex-grow-1">
        {selectedSection ? (
          /* 1. VISTA DETALLADA DE LA SECCIÓN O DISTRITO SELECCIONADO */
          <div>
            {/* Ficha Territorial INE */}
            <div className="p-3 bg-light rounded-3 mb-3 border border-gray-200">
              <span className="fs-11 text-muted fw-bold text-uppercase d-block mb-1">
                Datos Territoriales INE
              </span>
              <div className="row g-2 fs-13 text-dark fw-semibold">
                <div className="col-6">
                  <span className="text-muted d-block fs-11">Nivel Territorial:</span>
                  <strong className="text-dark text-capitalize">
                    {selectedSection.baseBoundary ? selectedSection.baseBoundary.replace("_", " ") : "Sección"}
                  </strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block fs-11">
                    {selectedSection.seccion ? "Tipo de Sección:" : "Secciones Agrupadas:"}
                  </span>
                  <span className="badge bg-secondary-subtle text-dark fw-bold">
                    {selectedSection.seccion
                      ? (selectedSection.tipo === 1 ? "Urbana" : selectedSection.tipo === 2 ? "Rural" : "Mixta")
                      : `${(sectionResult as any)?.secciones_count || selectedSection.secciones || "Varias"} Secciones`}
                  </span>
                </div>
                {selectedSection.seccion && (
                  <>
                    <div className="col-6">
                      <span className="text-muted d-block fs-11">Distrito Local:</span>
                      <strong className="text-dark">Dtto. {selectedSection.distrito_l || "N/D"}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block fs-11">Distrito Federal:</span>
                      <strong className="text-dark">Dtto. {selectedSection.distrito_f || "N/D"}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Resultados Electorales de la Sección */}
            {sectionResult ? (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fs-12 text-dark fw-extrabold text-uppercase">
                    Resultado Elección {selectedYear}
                  </span>
                  <span className="badge bg-primary text-white fw-bold fs-11">
                    {sectionResult.election_type}
                  </span>
                </div>

                {/* Tarjeta Ganador */}
                <div
                  className="p-3 rounded-3 mb-3 text-white shadow-sm"
                  style={{ backgroundColor: getPartyColor(sectionResult.ganador_partido) }}
                >
                  <span className="fs-11 text-uppercase text-white-50 fw-bold d-block">
                    Partido Ganador en la Sección
                  </span>
                  <h4 className="fw-extrabold mb-1 text-white">{sectionResult.ganador_partido}</h4>
                  <div className="d-flex justify-content-between fs-12 text-white fw-bold">
                    <span>{sectionResult.ganador_votos?.toLocaleString()} votos</span>
                    <span>{sectionResult.ganador_pct}% del total</span>
                  </div>
                </div>

                {/* Métricas de Participación y Margen */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 bg-light rounded-2 border text-center">
                      <span className="fs-10 text-muted fw-bold text-uppercase d-block">Participación</span>
                      <strong className="fs-14 text-dark">{sectionResult.participacion_pct}%</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-light rounded-2 border text-center">
                      <span className="fs-10 text-muted fw-bold text-uppercase d-block">Margen Victoria</span>
                      <strong className="fs-14 text-dark">+{sectionResult.margen_victoria_pct}%</strong>
                    </div>
                  </div>
                </div>

                {/* Desglose por Partido */}
                <span className="fs-11 text-muted fw-bold text-uppercase d-block mb-2">
                  Desglose de Votos por Partido
                </span>
                <div className="d-flex flex-column gap-2 mb-3">
                  {Object.entries(sectionResult.votos_partidos || {})
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([partido, votos]) => {
                      const pct = sectionResult.total_votos
                        ? Math.round(((votos as number) / sectionResult.total_votos) * 100)
                        : 0;
                      return (
                        <div key={partido}>
                          <div className="d-flex justify-content-between fs-12 fw-bold mb-1">
                            <span style={{ color: getPartyColor(partido) }}>{partido}</span>
                            <span className="text-dark">
                              {(votos as number).toLocaleString()} ({pct}%)
                            </span>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: getPartyColor(partido),
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-secondary-subtle rounded-3 mb-4 text-center">
                <i className="ri-file-chart-line fs-24 text-muted d-block mb-1"></i>
                <span className="fs-13 text-dark fw-bold d-block">Sin datos de {selectedYear} cargados</span>
                <small className="text-muted fs-11">
                  Sube el archivo CSV de la elección {selectedYear} para visualizar resultados en esta sección.
                </small>
              </div>
            )}

            {/* Cruce Espacial: Eventos e Incidentes en esta Sección */}
            <div className="border-top pt-3">
              <span className="fs-12 text-dark fw-extrabold text-uppercase d-block mb-2">
                <i className="ri-radar-line text-danger me-1"></i> Eventos Activos en esta Sección ({associatedEvents.length})
              </span>

              {associatedEvents.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {associatedEvents.map((ev) => (
                    <div key={ev.id} className="p-2 bg-light rounded-2 border border-danger-subtle">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="fs-12 text-dark">{ev.title}</strong>
                        <span className="badge bg-danger text-white fs-10">{ev.severity}</span>
                      </div>
                      <p className="fs-11 text-muted mb-0">{ev.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <small className="text-muted fs-12">
                  No hay incidentes de seguridad ni contingencias activas registradas en esta sección.
                </small>
              )}
            </div>
          </div>
        ) : selectedMunicipio ? (
          /* 2. VISTA AGREGADA MUNICIPAL */
          <div>
            <div className="p-3 bg-light rounded-3 mb-3 border border-primary-subtle">
              <span className="fs-11 text-primary fw-bold text-uppercase d-block mb-1">
                Municipio Enfocado · Clave {selectedMunicipio}
              </span>
              <h5 className="fw-extrabold text-dark mb-1">{currentMpioObj?.nombre}</h5>
              <div className="d-flex justify-content-between fs-12 text-muted fw-bold">
                <span>Estado de Guanajuato</span>
                <span className="badge bg-primary text-white">Zoom Activo</span>
              </div>
            </div>

            {mpioGanador ? (
              <div className="mb-4">
                <div
                  className="p-3 rounded-3 mb-3 text-white shadow-sm"
                  style={{ backgroundColor: getPartyColor(mpioGanador) }}
                >
                  <span className="fs-11 text-uppercase text-white-50 fw-bold d-block">
                    Ganador en {currentMpioObj?.nombre} ({selectedYear})
                  </span>
                  <h4 className="fw-extrabold mb-1 text-white">{mpioGanador}</h4>
                  <div className="d-flex justify-content-between fs-12 text-white fw-bold">
                    <span>{mpioGanadorVotos.toLocaleString()} votos</span>
                    <span>{mpioParticipacion}% participación</span>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 bg-light rounded-2 border text-center">
                      <span className="fs-10 text-muted fw-bold text-uppercase d-block">Total Votos</span>
                      <strong className="fs-14 text-dark">{mpioTotalVotos.toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-light rounded-2 border text-center">
                      <span className="fs-10 text-muted fw-bold text-uppercase d-block">Lista Nominal</span>
                      <strong className="fs-14 text-dark">{mpioTotalLista.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <span className="fs-11 text-muted fw-bold text-uppercase d-block mb-2">
                  Votos Agregados por Partido
                </span>
                <div className="d-flex flex-column gap-2 mb-3">
                  {mpioSortedParties.map(([partido, votos]) => {
                    const pct = mpioTotalVotos ? Math.round((votos / mpioTotalVotos) * 100) : 0;
                    return (
                      <div key={partido}>
                        <div className="d-flex justify-content-between fs-12 fw-bold mb-1">
                          <span style={{ color: getPartyColor(partido) }}>{partido}</span>
                          <span className="text-dark">
                            {votos.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar"
                            style={{ width: `${pct}%`, backgroundColor: getPartyColor(partido) }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-secondary-subtle rounded-3 mb-4 text-center">
                <i className="ri-file-chart-line fs-24 text-muted d-block mb-1"></i>
                <span className="fs-13 text-dark fw-bold d-block">Sin datos agregados cargados para este municipio</span>
                <small className="text-muted fs-11">
                  Usa el botón <strong>Cargar Resultados CSV</strong> para subir las actas de {currentMpioObj?.nombre}.
                </small>
              </div>
            )}
          </div>
        ) : (
          /* 3. VISTA AGREGADA ESTATAL GENERAL */
          <div>
            <div className="p-3 bg-light rounded-3 mb-4 border border-gray-200">
              <span className="fs-11 text-muted fw-bold text-uppercase d-block mb-1">
                Marco Geográfico Activo
              </span>
              <h5 className="fw-extrabold text-dark mb-1">Estado de Guanajuato</h5>
              <div className="d-flex justify-content-between fs-12 text-muted fw-bold">
                <span>3,357 Secciones Electorales</span>
                <span>46 Municipios</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="fs-12 text-dark fw-extrabold text-uppercase d-block mb-2">
                Instrucciones de Uso
              </span>
              <ul className="fs-13 text-dark ps-3 mb-0 lh-base">
                <li className="mb-2">
                  <strong>Selecciona un municipio</strong> en el combobox superior para hacer zoom y ver exclusivamente su territorio.
                </li>
                <li className="mb-2">
                  <strong>Haz clic en cualquier sección</strong> para ver su ficha técnica, historial de votación e incidentes en tiempo real.
                </li>
                <li className="mb-2">
                  <strong>Cambia el modo de visualización</strong> (Ganador, Participación, Margen de Victoria o Swing).
                </li>
              </ul>
            </div>

            {/* Simbología de Partidos */}
            <div className="border-top pt-3">
              <span className="fs-11 text-muted fw-bold text-uppercase d-block mb-2">
                Simbología Partidista
              </span>
              <div className="row g-2 fs-12 fw-bold">
                {Object.entries(PARTY_COLORS).map(([partido, color]) => (
                  <div key={partido} className="col-6 d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-inline-block"
                      style={{ width: "12px", height: "12px", backgroundColor: color }}
                    ></span>
                    <span className="text-dark">{partido}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectoralStatsPanel;
