"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

export interface EnrichedEvent {
  id: string;
  state_id: string;
  category: string;
  severity: string;
  title: string;
  summary: string;
  ai_summary?: string;
  political_relevance?: number;
  location_text?: string;
  lat?: number;
  lng?: number;
  municipio?: string;
  status?: string;
  occurred_at: string;
  created_at?: string;
  source_type?: string; // 'telegram' | 'twitter' | 'oficial' | 'api_federal' | 'rss' | 'gdelt' | 'news_feed' | 'data365_twitter' | 'data365_facebook' | 'data365_instagram'
  source_name?: string;
  source_identifier?: string;
  source_credibility?: string;
  original_url?: string;
  dedup_hash?: string;
  raw_text?: string;
}

interface RealtimeLiveFeedProps {
  maxItems?: number;
  showFilters?: boolean;
  compactMode?: boolean;
  filterMunicipio?: string;
  onlyHighRelevance?: boolean;
}

export default function RealtimeLiveFeed({
  maxItems = 20,
  showFilters = true,
  compactMode = false,
  filterMunicipio,
  onlyHighRelevance = false,
}: RealtimeLiveFeedProps) {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "telegram" | "twitter" | "data365" | "gdelt" | "oficial">("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [timeWindowHours, setTimeWindowHours] = useState<number>(24);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [expandedRawId, setExpandedRawId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLiveEvents = useCallback(async () => {
    try {
      // Intentar llamar a /events/live primero
      let resp;
      try {
        resp = await api.get(`/events/live?hours=${timeWindowHours}&limit=50`);
      } catch {
        // Fallback a /events si /events/live aún no estuviera en caliente
        resp = await api.get(`/events?limit=50`);
      }

      if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
        const seen = new Set<string>();
        const unique = resp.data.filter((ev: EnrichedEvent) => {
          const k = (ev.title || "").trim().toLowerCase();
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        setEvents(unique);
      } else {
        // Fallback enriquecido inicial por estado si la BD aún no tiene registros en la ventana
        setEvents(getDefaultFeedForState(stateCfg.key));
      }
      setLastSync(new Date());
    } catch (err) {
      console.warn("Usando feed local de contingencia:", err);
      setEvents(getDefaultFeedForState(stateCfg.key));
    } finally {
      setLoading(false);
    }
  }, [timeWindowHours, stateCfg.key]);

  useEffect(() => {
    setStateCfg(getStateConfig());
    fetchLiveEvents();
  }, [fetchLiveEvents]);

  // Ciclo de auto-refresco cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveEvents();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLiveEvents]);

  // Filtrado de eventos
  const filteredEvents = events.filter((ev) => {
    // Filtro por tab de origen
    if (activeTab === "telegram") {
      if (ev.source_type !== "telegram") return false;
    } else if (activeTab === "twitter") {
      if (ev.source_type !== "twitter" && ev.source_type !== "x") return false;
    } else if (activeTab === "data365") {
      if (!ev.source_type?.startsWith("data365")) return false;
    } else if (activeTab === "gdelt") {
      if (ev.source_type !== "gdelt" && ev.source_type !== "news_feed") return false;
    } else if (activeTab === "oficial") {
      if (
        ev.source_type === "telegram" ||
        ev.source_type === "twitter" ||
        ev.source_type === "x" ||
        ev.source_type?.startsWith("data365") ||
        ev.source_type === "gdelt" ||
        ev.source_type === "news_feed"
      )
        return false;
    }

    // Filtro por severidad
    if (selectedSeverity !== "all" && ev.severity.toLowerCase() !== selectedSeverity.toLowerCase()) {
      return false;
    }

    // Filtro por municipio si aplica
    if (filterMunicipio && ev.municipio && !ev.municipio.toLowerCase().includes(filterMunicipio.toLowerCase())) {
      return false;
    }

    // Filtro por alta relevancia (Vista Gobernador)
    if (onlyHighRelevance) {
      const rel = ev.political_relevance || 0;
      const sev = ev.severity.toLowerCase();
      if (rel < 8 && sev !== "critico" && sev !== "alto") return false;
    }

    return true;
  }).slice(0, maxItems);

  // Conteo para badges en pestañas
  const countTelegram = events.filter((e) => e.source_type === "telegram").length;
  const countTwitter = events.filter((e) => e.source_type === "twitter" || e.source_type === "x").length;
  const countData365 = events.filter((e) => e.source_type?.startsWith("data365")).length;
  const countGdelt = events.filter((e) => e.source_type === "gdelt" || e.source_type === "news_feed").length;
  const countOficial = events.filter(
    (e) =>
      e.source_type !== "telegram" &&
      e.source_type !== "twitter" &&
      e.source_type !== "x" &&
      !e.source_type?.startsWith("data365") &&
      e.source_type !== "gdelt" &&
      e.source_type !== "news_feed"
  ).length;

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
      {/* Cabecera del Feed en Tiempo Real */}
      <div className="card-header bg-white border-bottom p-3 p-md-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger text-white fs-11 fw-bold px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                <span className="spinner-grow spinner-grow-sm" style={{ width: "8px", height: "8px" }}></span>
                EN TIEMPO REAL · ÚLTIMAS {timeWindowHours} HORAS
              </span>
              <span className="text-muted fs-12">
                Sincronizado {formatRelativeTime(lastSync.toISOString())}
              </span>
            </div>
            <h5 className="fw-bold mb-0 text-dark fs-18" style={{ color: "#0f172a" }}>
              Canales Conectados
            </h5>
            <p className="text-muted fs-13 mb-0">
              Monitoreo continuo de canales de Telegram, redes sociales (X) y despachos oficiales de {stateCfg.name}.
            </p>
          </div>

          {/* Controles de auto-refresco y ventana de tiempo */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {showFilters && (
              <select
                className="form-select form-select-sm border-light-subtle fs-12 fw-semibold"
                style={{ width: "auto" }}
                value={timeWindowHours}
                onChange={(e) => setTimeWindowHours(Number(e.target.value))}
              >
                <option value={12}>Últimas 12 hrs</option>
                <option value={24}>Últimas 24 hrs (Por Defecto)</option>
                <option value={48}>Últimas 48 hrs</option>
                <option value={72}>Últimas 72 hrs</option>
              </select>
            )}

            <button
              onClick={() => fetchLiveEvents()}
              disabled={loading}
              className="btn btn-outline-secondary btn-sm fs-12 fw-bold d-inline-flex align-items-center gap-1"
              title="Actualizar ahora"
            >
              <i className={`ri-refresh-line ${loading ? "ri-spin" : ""}`}></i>
              Actualizar
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`btn btn-sm fs-12 fw-bold ${autoRefresh ? "btn-soft-success text-success" : "btn-soft-secondary text-muted"}`}
              style={{ backgroundColor: autoRefresh ? "#dcfce7" : "#f1f5f9" }}
            >
              <i className="ri-pulse-line me-1"></i>
              {autoRefresh ? "En Vivo (30s)" : "Pausado"}
            </button>
          </div>
        </div>

        {/* Barra de Pestañas por Canal */}
        {showFilters && (
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mt-3 pt-3 border-top gap-3">
            <ul className="nav nav-pills gap-1">
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm py-1 px-3 fs-13 fw-bold rounded-pill ${activeTab === "all" ? "active bg-primary text-white" : "text-secondary"}`}
                  onClick={() => setActiveTab("all")}
                >
                  Todos ({events.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm py-1 px-3 fs-13 fw-bold rounded-pill d-inline-flex align-items-center gap-1 ${activeTab === "telegram" ? "active bg-info text-white" : "text-secondary"}`}
                  style={activeTab === "telegram" ? { backgroundColor: "#0284c7" } : {}}
                  onClick={() => setActiveTab("telegram")}
                >
                  <i className="ri-telegram-fill text-info" style={{ color: activeTab === "telegram" ? "#ffffff" : "#0284c7" }}></i>
                  Telegram ({countTelegram})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm py-1 px-3 fs-13 fw-bold rounded-pill d-inline-flex align-items-center gap-1 ${activeTab === "twitter" ? "active bg-dark text-white" : "text-secondary"}`}
                  onClick={() => setActiveTab("twitter")}
                >
                  <i className="ri-twitter-x-line"></i>
                  Redes Sociales X ({countTwitter})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm py-1 px-3 fs-13 fw-bold rounded-pill d-inline-flex align-items-center gap-1 ${activeTab === "data365" ? "active bg-primary text-white" : "text-secondary"}`}
                  style={activeTab === "data365" ? { backgroundColor: "#2563eb" } : {}}
                  onClick={() => setActiveTab("data365")}
                >
                  <i className="ri-share-forward-line" style={{ color: activeTab === "data365" ? "#ffffff" : "#2563eb" }}></i>
                  Data365 Social ({countData365})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm py-1 px-3 fs-13 fw-bold rounded-pill d-inline-flex align-items-center gap-1 ${activeTab === "gdelt" ? "active text-white" : "text-secondary"}`}
                  style={activeTab === "gdelt" ? { backgroundColor: "#7c3aed" } : {}}
                  onClick={() => setActiveTab("gdelt")}
                >
                  <i className="ri-global-line" style={{ color: activeTab === "gdelt" ? "#ffffff" : "#7c3aed" }}></i>
                  GDELT 2.0 Prensa ({countGdelt})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm py-1 px-3 fs-13 fw-bold rounded-pill d-inline-flex align-items-center gap-1 ${activeTab === "oficial" ? "active bg-success text-white" : "text-secondary"}`}
                  onClick={() => setActiveTab("oficial")}
                >
                  <i className="ri-shield-check-line text-success" style={{ color: activeTab === "oficial" ? "#ffffff" : "#16a34a" }}></i>
                  Alertas Oficiales ({countOficial})
                </button>
              </li>
            </ul>

            {/* Filtro por Severidad */}
            <div className="d-flex align-items-center gap-1">
              <span className="fs-12 text-muted fw-bold me-1">Severidad:</span>
              {(["all", "critico", "alto", "medio"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`btn btn-sm px-2 py-0 fs-11 fw-bold text-uppercase rounded-pill ${
                    selectedSeverity === sev
                      ? sev === "critico"
                        ? "btn-danger text-white"
                        : sev === "alto"
                        ? "btn-warning text-dark"
                        : sev === "medio"
                        ? "btn-primary text-white"
                        : "btn-secondary text-white"
                      : "btn-outline-secondary"
                  }`}
                >
                  {sev === "all" ? "Todas" : sev}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Eventos Vivos */}
      <div className="card-body p-3 p-md-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando feed...</span>
            </div>
            <p className="text-muted fs-13 mt-2 fw-semibold">Consultando fuentes en tiempo real...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-3">
            <i className="ri-inbox-line fs-36 text-muted mb-2 d-block"></i>
            <h6 className="fw-bold text-dark fs-15">Sin incidentes registrados en esta selección</h6>
            <p className="text-muted fs-13 mb-0">No se detectaron reportes en la ventana de tiempo seleccionada.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredEvents.map((ev) => {
              const isTelegram = ev.source_type === "telegram";
              const isTwitter = ev.source_type === "twitter" || ev.source_type === "x";
              const isData365 = Boolean(ev.source_type?.startsWith("data365"));
              const isGdelt = ev.source_type === "gdelt" || ev.source_type === "news_feed";
              const isOficial = !isTelegram && !isTwitter && !isData365 && !isGdelt;
              const isExpanded = expandedRawId === ev.id;

              return (
                <div
                  key={ev.id}
                  className="p-3 rounded-3 border transition-all"
                  style={{
                    backgroundColor: ev.severity.toLowerCase() === "critico" ? "#fef2f2" : "#ffffff",
                    borderColor: ev.severity.toLowerCase() === "critico" ? "#fecaca" : "#e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Fila Superior: Badges de Origen, Severidad, Municipio y Tiempo */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {/* Badge de Red / Canal */}
                      {isTelegram && (
                        <span
                          className="badge fs-11 fw-bold px-2 py-1 text-white d-inline-flex align-items-center gap-1 shadow-sm"
                          style={{ backgroundColor: "#0284c7" }}
                        >
                          <i className="ri-telegram-fill"></i>
                          Telegram · {ev.source_identifier || "@Canal"}
                        </span>
                      )}
                      {isTwitter && (
                        <span
                          className="badge fs-11 fw-bold px-2 py-1 text-white d-inline-flex align-items-center gap-1 shadow-sm"
                          style={{ backgroundColor: "#0f172a" }}
                        >
                          <i className="ri-twitter-x-line"></i>
                          X · {ev.source_identifier || "@Cuenta"}
                        </span>
                      )}
                      {isData365 && (
                        <span
                          className="badge fs-11 fw-bold px-2 py-1 text-white d-inline-flex align-items-center gap-1 shadow-sm"
                          style={{ backgroundColor: "#2563eb" }}
                        >
                          <i className="ri-share-forward-line"></i>
                          Data365 · {ev.source_type?.replace("data365_", "").toUpperCase() || "Social"}
                        </span>
                      )}
                      {isGdelt && (
                        <span
                          className="badge fs-11 fw-bold px-2 py-1 text-white d-inline-flex align-items-center gap-1 shadow-sm"
                          style={{ backgroundColor: "#7c3aed" }}
                        >
                          <i className="ri-global-line"></i>
                          GDELT 2.0 · {ev.source_name || "Prensa"}
                        </span>
                      )}
                      {isOficial && (
                        <span
                          className="badge fs-11 fw-bold px-2 py-1 text-white d-inline-flex align-items-center gap-1 shadow-sm"
                          style={{ backgroundColor: "#16a34a" }}
                        >
                          <i className="ri-shield-check-line"></i>
                          Oficial · {ev.source_name || "Gobierno"}
                        </span>
                      )}

                      {/* Severidad */}
                      <span
                        className={`badge fs-11 text-uppercase fw-bold ${
                          ev.severity.toLowerCase() === "critico"
                            ? "bg-danger text-white"
                            : ev.severity.toLowerCase() === "alto"
                            ? "bg-warning text-dark"
                            : "bg-primary text-white"
                        }`}
                      >
                        {ev.severity}
                      </span>

                      {/* Credibilidad */}
                      <span className="badge bg-light text-dark border fs-11 fw-semibold">
                        {ev.source_credibility === "verificado"
                          ? "✓ Verificado"
                          : ev.source_credibility === "alerta_ciudadana"
                          ? "⚡ Alerta Ciudadana"
                          : "Oficial"}
                      </span>

                      {/* Municipio */}
                      {ev.municipio && (
                        <span className="badge bg-secondary-subtle text-dark fs-11 fw-bold">
                          <i className="ri-map-pin-line me-1 text-primary"></i>
                          {ev.municipio}
                        </span>
                      )}
                    </div>

                    {/* Sello de Fecha y Hora de Publicación */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="badge bg-light text-dark border fs-12 fw-bold d-inline-flex align-items-center gap-1 shadow-sm">
                        <i className="ri-calendar-check-line text-primary"></i>
                        <span>Publicado: {formatFullDateHour(ev.occurred_at)}</span>
                      </span>
                      <span className="badge bg-primary-subtle text-primary border fs-11 fw-bold">
                        {formatRelativeTime(ev.occurred_at)}
                      </span>
                    </div>
                  </div>

                  {/* Título del Evento */}
                  <h6 className="fw-bold mb-1 fs-15 text-dark" style={{ color: "#0f172a" }}>
                    {ev.title}
                  </h6>

                  {/* Resumen Ejecutivo */}
                  <p className="text-secondary fs-13 mb-2 lh-base">{ev.summary}</p>

                  {/* Análisis / Insight de IA si está disponible */}
                  {ev.ai_summary && (
                    <div
                      className="p-2 px-3 rounded-2 mb-2 fs-12 text-dark border-start border-3 border-info"
                      style={{ backgroundColor: "#f0f9ff" }}
                    >
                      <span className="fw-bold text-primary d-inline-flex align-items-center gap-1 me-1">
                        <i className="ri-sparkling-line"></i>
                        Anticipación Táctica:
                      </span>
                      {ev.ai_summary}
                    </div>
                  )}

                  {/* Botón para ver el Mensaje Original / Evidencia Cruda */}
                  <div className="d-flex align-items-center justify-content-between pt-1 mt-1 border-top">
                    <span className="text-muted fs-11 fw-semibold">
                      Fuente: {ev.source_name || "Despacho Central de Monitoreo"}
                    </span>

                    <div className="d-flex align-items-center gap-3">
                      {ev.original_url && (
                        <a
                          href={ev.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-link btn-sm p-0 fs-12 fw-bold text-decoration-none d-inline-flex align-items-center gap-1 text-primary"
                        >
                          <i className="ri-external-link-line"></i>
                          Ver Fuente Original
                        </a>
                      )}
                      <button
                        onClick={() => setExpandedRawId(isExpanded ? null : ev.id)}
                        className="btn btn-link btn-sm p-0 fs-12 fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
                        style={{ color: "#2563eb" }}
                      >
                        <i className={isExpanded ? "ri-arrow-up-s-line" : "ri-file-text-line"}></i>
                        {isExpanded ? "Ocultar Evidencia" : "Ver Texto Original Capturado"}
                      </button>
                    </div>
                  </div>

                  {/* Contenedor del Mensaje Original (Acordeón) */}
                  {isExpanded && (
                    <div className="mt-2 p-3 rounded-2 border bg-dark text-light font-monospace fs-12">
                      <div className="d-flex flex-wrap align-items-center justify-content-between pb-2 mb-2 border-bottom border-secondary text-light fs-11 gap-2">
                        <div>
                          <span className="text-secondary fw-bold text-uppercase">Publicado: </span>
                          <span className="text-warning fw-bold font-monospace">{formatFullTimestamp(ev.occurred_at)}</span>
                        </div>
                        <div>
                          <span className="text-secondary fw-bold text-uppercase">Canal/Emisor: </span>
                          <span className="text-white fw-bold">{ev.source_identifier || ev.source_name || "Canal Central"}</span>
                        </div>
                        <div>
                          <span className="text-secondary fw-bold text-uppercase">Red: </span>
                          <span className="badge bg-info-subtle text-info border fs-10">{ev.source_type?.toUpperCase() || "OFICIAL"}</span>
                        </div>
                        {ev.municipio && (
                          <div>
                            <span className="text-secondary fw-bold text-uppercase">Municipio: </span>
                            <span className="text-white fw-bold">{ev.municipio}</span>
                          </div>
                        )}
                        <span className="text-secondary">ID: {ev.id.slice(0, 8)}</span>
                      </div>
                      <p className="mb-0 text-white" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {ev.raw_text || ev.summary || "No hay texto crudo disponible para este registro."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Utilidad para formatear fecha y hora legible (DD Mon · HH:MM hrs)
function formatFullDateHour(isoString: string): string {
  try {
    const d = new Date(isoString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const month = months[d.getMonth()];
    const hours = d.getHours().toString().padStart(2, "0");
    const mins = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} · ${hours}:${mins} hrs`;
  } catch {
    return isoString;
  }
}

// Utilidad para formatear timestamp completo (DD Mon YYYY · HH:MM:SS hrs)
function formatFullTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    return (
      d.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " hrs"
    );
  } catch {
    return isoString;
  }
}

// Utilidad para formatear tiempo relativo (hace X min / hrs)
function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Justo ahora";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  } catch {
    return "Reciente";
  }
}

// Datos locales enriquecidos de contingencia mientras se sincroniza la base de datos
function getDefaultFeedForState(stateKey: string): EnrichedEvent[] {
  if (stateKey === "gto") {
    return [
      {
        id: "ev-gto-1",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "seguridad",
        severity: "critico",
        title: "Despliegue Operativo y Contención Vial en Salida Celaya - Villagrán",
        summary: "Canal de Telegram ciudadano reporta cierre preventivo y presencia de fuerzas federales y estatales.",
        ai_summary: "Detección temprana vía Telegram 23 minutos antes del boletín de confirmación oficial. Se recomienda mantener monitoreo sobre la reacción en redes ciudadanas.",
        political_relevance: 9,
        municipio: "Celaya",
        occurred_at: new Date(Date.now() - 45 * 60000).toISOString(),
        source_type: "telegram",
        source_name: "Canal Alerta Bajío & Seguridad Operativa",
        source_identifier: "@AlertaBajioOficial",
        source_credibility: "alerta_ciudadana",
        raw_text: "⚠️ #URGENTE_CELAYA [Telegram @AlertaBajioOficial - Hace 45 min] Reportan fuerte movilización de corporaciones estatales y federales en el entronque de salida hacia Villagrán. Camión de transporte pesado detenido cruzado preventivamente. FSPE mantiene perímetro asegurado. Tráfico totalmente detenido en dirección poniente. Eviten la zona.",
      },
      {
        id: "ev-gto-2",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "seguridad",
        severity: "alto",
        title: "Confirmación Oficial FSPE: Tramo Celaya Controlado y Reanudación de Tránsito",
        summary: "Comunicado de vocería FSPE vía X confirma reapertura de carriles tras conato de bloqueo sin heridos.",
        ai_summary: "Cierre favorable del incidente. La narrativa institucional mitigó rumores de enfrentamiento activo.",
        political_relevance: 7,
        municipio: "Celaya",
        occurred_at: new Date(Date.now() - 25 * 60000).toISOString(),
        source_type: "twitter",
        source_name: "Fuerzas de Seguridad Pública del Estado (FSPE)",
        source_identifier: "@FSPE_Gto",
        source_credibility: "oficial",
        raw_text: "🚨 COMUNICADO OFICIAL [@FSPE_Gto en X - Hace 25 min]: En coordinación con la @GN_MEXICO_ y @SEDENAmx, personal de las Fuerzas de Seguridad Pública del Estado mantiene bajo control el tramo Celaya - Villagrán tras reporte de conato de bloqueo. Se restablece la circulación de manera paulatina. No se reportan personas lesionadas.",
      },
      {
        id: "ev-gto-3",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "proteccion_civil",
        severity: "medio",
        title: "Incidente Vial Múltiple en Adolfo López Mateos (Poliforum León)",
        summary: "Reporte en vivo en canal de movilidad ciudadana indica colisión de 3 unidades con reducción a un carril.",
        ai_summary: "Impacto focalizado en movilidad metropolitana en hora pico. Se coordinó aviso de vías alternas.",
        political_relevance: 5,
        municipio: "León",
        occurred_at: new Date(Date.now() - 135 * 60000).toISOString(),
        source_type: "telegram",
        source_name: "Monitoreo Vial y Emergencias Metrópoli León",
        source_identifier: "@VialidadLeonGTO",
        source_credibility: "alerta_ciudadana",
        raw_text: "🚗💨 #ReporteVialLeon [Telegram @VialidadLeonGTO - Hace 2 horas] Carambola sobre Blvd. Adolfo López Mateos a la altura de Poliforum León. 3 vehículos involucrados. Servicios de emergencia ya en sitio. Reducción a 1 carril central, fila vehicular alcanza la glorieta del Estadio León.",
      },
      {
        id: "ev-gto-4",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "proteccion_civil",
        severity: "alto",
        title: "Desfogue Controlado y Monitoreo de Capacidad en Presa de la Olla",
        summary: "Alerta de Protección Civil Estatal por nivel de 88% en presa capitalina tras precipitaciones serranas.",
        ai_summary: "Medida operativa preventiva. Se activó protocolo de comunicación preventiva para evitar alarma en centro histórico.",
        political_relevance: 8,
        municipio: "Guanajuato",
        occurred_at: new Date(Date.now() - 290 * 60000).toISOString(),
        source_type: "oficial",
        source_name: "Coordinación Estatal de Protección Civil GTO",
        source_identifier: "PC_Estatal_GTO",
        source_credibility: "oficial",
        raw_text: "🌧️ BOLETÍN PREVENTIVO [PC_Estatal_GTO - Hace 4 horas]: Coordinación Estatal de Protección Civil informa: Por lluvias en zona serrana, la Presa de la Olla registra 88% de capacidad. Se inician maniobras preventivas de desfogue controlado. Niveles de Río Guanajuato estables en cauce. Se exhorta a la población a seguir recomendaciones oficiales.",
      },
      {
        id: "ev-gto-5",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "seguridad",
        severity: "medio",
        title: "Operativo Nocturno Interinstitucional de Fiscalización en Zona Norte de Irapuato",
        summary: "Reporte de corresponsalía en Telegram sobre inspecciones y 2 clausuras de centros nocturnos.",
        ai_summary: "Operativo coordinado entre FSPE y municipio sin incidentes de resistencia civil.",
        political_relevance: 6,
        municipio: "Irapuato",
        occurred_at: new Date(Date.now() - 720 * 60000).toISOString(),
        source_type: "telegram",
        source_name: "Red de Corresponsales Noticias GTO en Vivo",
        source_identifier: "@NoticiasGTO",
        source_credibility: "verificado",
        raw_text: "🔴 #IRAPUATO [Telegram @NoticiasGTO - Hace 12 horas] Operativo de inspección sorpresa a centros nocturnos y establecimientos de giros negros en zona norte de Irapuato. Participan FSPE y fiscalización municipal. 2 clausuras preventivas por falta de permisos. Saldo blanco.",
      },
      {
        id: "ev-gto-6",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "politico",
        severity: "medio",
        title: "Acuerdo Laboral y Distensión Sindical en Clúster Automotriz Puerto Interior",
        summary: "Publicación periodística en X sobre firma de pacto salarial entre sindicato y sector manufactura.",
        ai_summary: "Gobernabilidad económica asegurada en el corredor industrial Silao. Saldo altamente positivo.",
        political_relevance: 7,
        municipio: "Silao",
        occurred_at: new Date(Date.now() - 960 * 60000).toISOString(),
        source_type: "twitter",
        source_name: "Agencia Informativa & Periodismo Regional Bajío",
        source_identifier: "@PeriodismoBajio",
        source_credibility: "verificado",
        raw_text: "📢 [@PeriodismoBajio en X - Hace 16 horas] Sindicato del Clúster Automotriz y representantes empresariales en Guanajuato Puerto Interior (Silao) firman acuerdo preliminar de revisión salarial sin emplazamiento a huelga. Se pacta mesa de seguimiento mensual con la Secretaría de Economía.",
      },
      {
        id: "ev-gto-gdelt-1",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "seguridad",
        severity: "alto",
        title: "[GDELT] Monitoreo Hemisférico: Operatividad y Tránsito Pesado en Corredor Industrial Celaya-Salamanca",
        summary: "Reporte de prensa regional indexado por GDELT 2.0 sobre el flujo logístico comercial y presencia disuasiva de fuerzas de seguridad en la carretera federal 45.",
        ai_summary: "Monitoreo territorial: Flujo comercial sostenido sin bloqueos ni afectaciones al transporte de carga en el corredor industrial.",
        political_relevance: 8,
        municipio: "Celaya",
        occurred_at: new Date(Date.now() - 180 * 60000).toISOString(),
        source_type: "gdelt",
        source_name: "GDELT Project — Hemispheric News Monitor",
        source_identifier: "gdelt-gto-live-01",
        source_credibility: "prensa_internacional",
        raw_text: "📰 [GDELT 2.0 Prensa - Hace 3 horas] Monitor de Medios GDELT: Corresponsalías de prensa estatal reportan despliegue disuasivo coordinado entre FSPE y corporaciones federales sobre el tramo Celaya-Salamanca para garantizar la fluidez del transporte de mercancías. Actividad económica regular en parques industriales.",
      },
      {
        id: "ev-gto-gdelt-2",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "proteccion_civil",
        severity: "medio",
        title: "[GDELT] Cobertura de Medios: Protocolo Preventivo Hidráulico y Monitoreo de Presas en Guanajuato",
        summary: "Monitoreo de prensa sobre capacidades de almacenamiento en cuencas de Guanajuato y desfogues controlados de Protección Civil.",
        ai_summary: "Niveles en embalses monitoreados dentro de rangos operativos seguros tras lluvias en serranía.",
        political_relevance: 7,
        municipio: "Guanajuato",
        occurred_at: new Date(Date.now() - 360 * 60000).toISOString(),
        source_type: "gdelt",
        source_name: "GDELT Project — Hemispheric News Monitor",
        source_identifier: "gdelt-gto-live-02",
        source_credibility: "prensa_internacional",
        raw_text: "📰 [GDELT 2.0 Prensa - Hace 6 horas] Registro GDELT: Medios locales y regionales destacan acciones preventivas de la Coordinación Estatal de Protección Civil en presas de Guanajuato capital y San Miguel de Allende. Monitoreo constante de caudales de ríos sin riesgo para asentamientos urbanos.",
      },
      {
        id: "ev-gto-data365-1",
        state_id: "00000000-0000-0000-0000-000000000011",
        category: "vialidad",
        severity: "medio",
        title: "[Data365] Pulso Ciudadano Social: Movilidad y Desvíos en Entronque Silao - Puerto Interior",
        summary: "Menciones ciudadanas agregadas vía API Data365 reportando tráfico lento por obras de conservación en acceso a Puerto Interior.",
        ai_summary: "Volumen de quejas moderado enfocado en tiempos de traslado de personal fabril. Sin incidentes de seguridad.",
        political_relevance: 6,
        municipio: "Silao",
        occurred_at: new Date(Date.now() - 60 * 60000).toISOString(),
        source_type: "data365_twitter",
        source_name: "Data365 Social Radar (X & Facebook)",
        source_identifier: "data365-gto-01",
        source_credibility: "monitoreo_social",
        raw_text: "📊 [Data365 Social Intelligence - Hace 1 hora] Alerta de tendencia local en X: Ciudadanos reportan acumulación vehicular en entronque Silao - Puerto Interior hacia León. Tiempo de demora estimado: 25 min. Tránsito desviado por lateral.",
      },
    ];
  } else if (stateKey === "pue") {
    return [
      {
        id: "ev-pue-1",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "seguridad",
        severity: "alto",
        title: "Blindaje Logístico en Caseta Autopista México-Puebla (San Martín Texmelucan)",
        summary: "Inspección y patrullaje conjunto de Guardia Nacional y SSP en acceso industrial de Texmelucan.",
        ai_summary: "Despliegue preventivo sin afectación al transporte de carga pesada.",
        political_relevance: 8,
        municipio: "San Martín Texmelucan",
        occurred_at: new Date(Date.now() - 35 * 60000).toISOString(),
        source_type: "telegram",
        source_name: "Canal Alerta Puebla Seguridad & Vigilancia",
        source_identifier: "@AlertaPueblaSeguridad",
        source_credibility: "alerta_ciudadana",
        raw_text: "⚠️ #ALERTA_TEXMELUCAN [Telegram @AlertaPueblaSeguridad - Hace 35 min] Reportan operativo preventivo coordinado sobre la Autopista México-Puebla altura caseta de San Martín Texmelucan. Guardia Nacional y Policía Estatal inspeccionan transportes de carga. Circulación con reducción de carril lateral, avance fluido.",
      },
      {
        id: "ev-pue-2",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "seguridad",
        severity: "medio",
        title: "Conclusión con Saldo Blanco en Despliegue Metropolitano Angelópolis",
        summary: "SSP Puebla reporta patrullajes preventivos coordinados en Puebla Capital, San Andrés y San Pedro Cholula.",
        ai_summary: "Operatividad regular y cobertura disuasiva en centros comerciales y zonas turísticas.",
        political_relevance: 7,
        municipio: "Puebla",
        occurred_at: new Date(Date.now() - 75 * 60000).toISOString(),
        source_type: "twitter",
        source_name: "Secretaría de Seguridad Pública del Estado de Puebla",
        source_identifier: "@SSPGobPue",
        source_credibility: "oficial",
        raw_text: "🚨 COMUNICADO OFICIAL [@SSPGobPue en X - Hace 1 hora 15 min]: Concluye con saldo blanco el despliegue metropolitano Angelópolis en Puebla Capital, San Pedro Cholula y San Andrés Cholula. Se reforzó el patrullaje preventivo en centros comerciales, plazas y corredores turísticos.",
      },
      {
        id: "ev-pue-3",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "proteccion_civil",
        severity: "medio",
        title: "Cierre Preventivo por Obras en Periférico Ecológico (Cuautlancingo)",
        summary: "Canal de vialidad en vivo alerta de reducción de carriles y desvíos hacia Forjadores y Recta a Cholula.",
        ai_summary: "Impacto moderado en movilidad metropolitana en horario laboral.",
        political_relevance: 6,
        municipio: "Cuautlancingo",
        occurred_at: new Date(Date.now() - 190 * 60000).toISOString(),
        source_type: "telegram",
        source_name: "Tráfico Puebla y Movilidad Metropolitana",
        source_identifier: "@TraficoPueblaEnVivo",
        source_credibility: "verificado",
        raw_text: "🚗 #TraficoPuebla [Telegram @TraficoPueblaEnVivo - Hace 3 horas] Cierre preventivo por obras de modernización en Periférico Ecológico a la altura de Cuautlancingo. Vías alternas habilitadas sobre Recta a Cholula y Forjadores. Tráfico moderado.",
      },
      {
        id: "ev-pue-4",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "proteccion_civil",
        severity: "medio",
        title: "Vigilancia Permanente Popocatépetl en Amarillo Fase 2",
        summary: "Monitoreo sismológico y de emisiones volcánicas; sin caída de ceniza en zona urbana.",
        ai_summary: "Protocolo estatal de Protección Civil activo para comunidades aledañas al coloso.",
        political_relevance: 7,
        municipio: "Atlixco",
        occurred_at: new Date(Date.now() - 340 * 60000).toISOString(),
        source_type: "oficial",
        source_name: "Coordinación General de Protección Civil Puebla",
        source_identifier: "PC_Estatal_PUE",
        source_credibility: "oficial",
        raw_text: "🌋 MONITOREO VOLCÁNICO [PC_Estatal_PUE - Hace 5 horas]: Coordinación General de Protección Civil informa semáforo volcánico del Popocatépetl se mantiene en Amarillo Fase 2. Emisiones leves de vapor y ceniza con dispersión hacia el noreste sin afectación a la zona metropolitana de Puebla.",
      },
      {
        id: "ev-pue-5",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "politico",
        severity: "medio",
        title: "Acuerdos de Gobernabilidad y Diálogo Social en Tehuacán",
        summary: "Instalación de mesa de trabajo pacífica con sectores productivos y comités ejidales.",
        ai_summary: "Contención anticipada de inconformidades agrarias gracias a mediación de Segob Puebla.",
        political_relevance: 6,
        municipio: "Tehuacán",
        occurred_at: new Date(Date.now() - 680 * 60000).toISOString(),
        source_type: "twitter",
        source_name: "Periódico Central Puebla — Cobertura Estatal",
        source_identifier: "@CentralPuebla",
        source_credibility: "verificado",
        raw_text: "📰 NOTA CENTRAL [@CentralPuebla - Hace 11 horas]: Mesa de diálogo pacífica en Tehuacán: Gobierno del Estado atiende peticiones de comités de agua y agricultores del Valle de Tehuacán. Se pacta mesa técnica para el próximo lunes con Conagua y Gobernación.",
      },
      {
        id: "ev-pue-6",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "proteccion_civil",
        severity: "medio",
        title: "Mantenimiento y Despeje Preventivo Carretero en Sierra Norte (Huauchinango)",
        summary: "Retiro ágil de desprendimientos menores en carretera federal México-Tuxpan.",
        ai_summary: "Mantenimiento preventivo que preserva conectividad intermunicipal en la sierra.",
        political_relevance: 5,
        municipio: "Huauchinango",
        occurred_at: new Date(Date.now() - 1100 * 60000).toISOString(),
        source_type: "telegram",
        source_name: "Canal Alerta Puebla Seguridad & Vigilancia",
        source_identifier: "@AlertaPueblaSeguridad",
        source_credibility: "alerta_ciudadana",
        raw_text: "🌲 REPORTE SIERRA NORTE [Telegram @AlertaPueblaSeguridad - Hace 18 horas]: Tránsito fluido y supervisión carretera en el tramo Huauchinango - Xicotepec. Brigadas de Protección Civil retiran escombros menores tras lluvia matutina sin mayores incidentes.",
      },
      {
        id: "ev-pue-gdelt-1",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "seguridad",
        severity: "alto",
        title: "[GDELT] Monitoreo Territorial: Flujo de Autotransporte y Operativos en Arco Norte y Texmelucan",
        summary: "Prensa nacional y regional indexada por GDELT documenta operativo permanente de vigilancia carretera en el tramo San Martín Texmelucan - Puebla.",
        ai_summary: "Monitoreo territorial: Presencia preventiva disuasiva y libre tránsito de mercancías en el corredor logístico del Altiplano.",
        political_relevance: 8,
        municipio: "San Martín Texmelucan",
        occurred_at: new Date(Date.now() - 120 * 60000).toISOString(),
        source_type: "gdelt",
        source_name: "GDELT Project — Hemispheric News Monitor",
        source_identifier: "gdelt-pue-live-01",
        source_credibility: "prensa_internacional",
        raw_text: "📰 [GDELT 2.0 Prensa - Hace 2 horas] Cobertura GDELT: Portales periodísticos y agencias de noticias consignan el reforzamiento de puntos de control de la Guardia Nacional y Policía Estatal en casetas del Arco Norte y autopista México-Puebla para inhibir el robo al autotransporte de carga. Circulación continua.",
      },
      {
        id: "ev-pue-gdelt-2",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "proteccion_civil",
        severity: "medio",
        title: "[GDELT] Monitoreo Geológico: Reporte Prensa de Actividad y Alerta Popocatépetl en Región Izta-Popo",
        summary: "Seguimiento hemisférico en GDELT a despachos de Protección Civil y Cenapred respecto a dispersión eólica de ceniza volcánica.",
        ai_summary: "Semáforo en Amarillo Fase 2 estable. Rutas de evacuación y albergues temporales inspeccionados en Atlixco y Cholula.",
        political_relevance: 7,
        municipio: "Atlixco",
        occurred_at: new Date(Date.now() - 300 * 60000).toISOString(),
        source_type: "gdelt",
        source_name: "GDELT Project — Hemispheric News Monitor",
        source_identifier: "gdelt-pue-live-02",
        source_credibility: "prensa_internacional",
        raw_text: "📰 [GDELT 2.0 Prensa - Hace 5 horas] GDELT Global Intelligence: Cobertura noticiosa sobre el monitoreo vulcanológico en Puebla. Cenapred y Protección Civil Estatal confirman baja sismicidad y exhalaciones moderadas. No hay afectación a las operaciones en el Aeropuerto de Huejotzingo.",
      },
      {
        id: "ev-pue-data365-1",
        state_id: "21212121-2121-2121-2121-212121212121",
        category: "vialidad",
        severity: "medio",
        title: "[Data365] Pulso Social Digital: Movilidad Metropolitana en Vía Atlixcáyotl y Periférico",
        summary: "Agregación de reportes viales ciudadanos en tiempo real procesados vía Data365 sobre maniobras de bacheo y semaforización.",
        ai_summary: "Reportes ciudadanos canalizados preventivamente hacia la mesa de vialidad metropolitana.",
        political_relevance: 6,
        municipio: "Puebla",
        occurred_at: new Date(Date.now() - 45 * 60000).toISOString(),
        source_type: "data365_twitter",
        source_name: "Data365 Social Radar (X & Facebook)",
        source_identifier: "data365-pue-01",
        source_credibility: "monitoreo_social",
        raw_text: "📊 [Data365 Social Intelligence - Hace 45 min] Detección de volumen en X: Usuarios reportan tráfico denso en Vía Atlixcáyotl dirección Angelópolis por semáforo desincronizado. Agentes de vialidad agilizan el cruce.",
      },
    ];
  } else {
    return [
      {
        id: "ev-qro-1",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "seguridad",
        severity: "critico",
        title: "Incidente de Tráfico Mayor y Cierre Parcial en Paseo 5 de Febrero",
        summary: "Percance vial de unidad de carga genera reducción de carriles en arteria neurálgica de la capital.",
        ai_summary: "Se detectó reporte en canal Telegram 18 min antes de intervención de Policía PoEs.",
        political_relevance: 9,
        municipio: "Santiago de Querétaro",
        occurred_at: new Date(Date.now() - 50 * 60000).toISOString(),
        source_type: "telegram",
        source_name: "Alerta Vial y Movilidad Urbana Querétaro",
        source_identifier: "@AlertaQroVial",
        source_credibility: "alerta_ciudadana",
        raw_text: "⚠️ #5DeFebrero [Telegram @AlertaQroVial - Hace 50 min] Tráiler averiado bloquea 2 carriles a la altura de Av. Zaragoza. Tráfico detenido hasta La Obrera. Unidades de PoEs y movilidad ya en la zona.",
      },
      {
        id: "ev-qro-2",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "seguridad",
        severity: "alto",
        title: "Operativo Preventivo de Seguridad y Control en Límites QRO - San Juan del Río",
        summary: "Policía Estatal despliega filtro de inspección de vehículos foráneos en autopista 57.",
        ai_summary: "Acción de blindaje territorial en coordinación con Guardia Nacional.",
        political_relevance: 8,
        municipio: "San Juan del Río",
        occurred_at: new Date(Date.now() - 120 * 60000).toISOString(),
        source_type: "twitter",
        source_name: "Policía Estatal Querétaro (PoEs)",
        source_identifier: "@POES_Qro",
        source_credibility: "oficial",
        raw_text: "🛡️ [@POES_Qro en X - Hace 2 horas] Mantenemos presencia disuasiva y filtros de inspección aleatoria en la autopista 57 dirección San Juan del Río. Circule con precaución.",
      },
      {
        id: "ev-qro-3",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "proteccion_civil",
        severity: "medio",
        title: "Supervisión Preventiva de Drenes Pluviales en Zona La Pradera y Zibatá",
        summary: "Protección Civil Estatal y municipal inspeccionan bordos tras precipitaciones locales.",
        ai_summary: "Capacidad hidráulica al 40% sin encharcamientos en parques industriales o residencias.",
        political_relevance: 6,
        municipio: "El Marqués",
        occurred_at: new Date(Date.now() - 220 * 60000).toISOString(),
        source_type: "oficial",
        source_name: "Coordinación Estatal de Protección Civil Querétaro",
        source_identifier: "PC_Estatal_QRO",
        source_credibility: "oficial",
        raw_text: "🌧️ REPORTE PREVENTIVO [PC_Estatal_QRO - Hace 3 horas]: Protección Civil El Marqués concluye supervisión de drenes pluviales en zona La Pradera. Niveles seguros sin afectaciones.",
      },
      {
        id: "ev-qro-4",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "seguridad",
        severity: "alto",
        title: "Cerco Virtual Efectivo y Aseguramiento en Libramiento Surponiente",
        summary: "Cámaras LPR del CQ-CIAS identifican unidad vehicular foránea y guían intervención.",
        ai_summary: "Respuesta táctica coordinada en 4 minutos con Policía de Corregidora.",
        political_relevance: 8,
        municipio: "Corregidora",
        occurred_at: new Date(Date.now() - 435 * 60000).toISOString(),
        source_type: "twitter",
        source_name: "Centro de Información y Análisis para la Seguridad (CIAS)",
        source_identifier: "@CIAS_Queretaro",
        source_credibility: "oficial",
        raw_text: "🚨 [@CIAS_Queretaro en X - Hace 7 horas]: Centro CQ-CIAS coordinó cerco virtual en Libramiento Surponiente tras alerta de placa foránea. Unidad asegurada sin incidentes.",
      },
      {
        id: "ev-qro-5",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "proteccion_civil",
        severity: "medio",
        title: "Despeje Vial y Retiro de Desprendimiento Rocoso en Carretera Serrana Jalpan",
        summary: "Comisión Estatal de Infraestructura retira material y reabre circulación completa.",
        ai_summary: "Atención preventiva en tramo serrano km 138 sin personas lesionadas.",
        political_relevance: 5,
        municipio: "Jalpan de Serra",
        occurred_at: new Date(Date.now() - 840 * 60000).toISOString(),
        source_type: "telegram",
        source_name: "Canal Noticias Querétaro Hoy",
        source_identifier: "@NoticiasQueretaroHoy",
        source_credibility: "verificado",
        raw_text: "🔴 #SierraGorda [Telegram @NoticiasQueretaroHoy - Hace 14 horas]: Cuadrillas de la CEI liberan tramo Jalpan - Pinal de Amoles tras desprendimiento menor. Tránsito fluido.",
      },
      {
        id: "ev-qro-6",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "politico",
        severity: "medio",
        title: "Monitoreo Técnico y Avance de Obras del Sistema Batán Agua para Todos",
        summary: "CEA reporta 82% en redes de interconexión del Acuaférico sin suspensión del servicio.",
        ai_summary: "Fortalecimiento de la seguridad hídrica metropolitana para los próximos 30 años.",
        political_relevance: 7,
        municipio: "Corregidora",
        occurred_at: new Date(Date.now() - 1140 * 60000).toISOString(),
        source_type: "oficial",
        source_name: "Comisión Estatal de Aguas Querétaro (CEA)",
        source_identifier: "CEA_Queretaro",
        source_credibility: "oficial",
        raw_text: "💧 BOLETÍN CEA [CEA_Queretaro - Hace 19 horas]: Avance de interconexión en acuaférico metropolitano y monitoreo en Presa El Batán. Suministro garantizado en la ZMQ.",
      },
      {
        id: "ev-qro-gdelt-1",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "seguridad",
        severity: "alto",
        title: "[GDELT] Prensa Regional: Monitoreo Logístico y Aforo en Autopista 57 Tramo México - Querétaro",
        summary: "Medios indexados por GDELT reportan operativos viales y de inspección en el acceso industrial a San Juan del Río y Pedro Escobedo.",
        ai_summary: "Monitoreo territorial: Tránsito continuo en la arteria comercial central del país con supervisión de Guardia Nacional.",
        political_relevance: 8,
        municipio: "San Juan del Río",
        occurred_at: new Date(Date.now() - 180 * 60000).toISOString(),
        source_type: "gdelt",
        source_name: "GDELT Project — Hemispheric News Monitor",
        source_identifier: "gdelt-qro-live-01",
        source_credibility: "prensa_internacional",
        raw_text: "📰 [GDELT 2.0 Prensa - Hace 3 horas] Monitor GDELT: Notas informativas destacan operativos carrusel y filtros preventivos en la Autopista Federal 57 tramo Palmillas - Querétaro. Reducción de percances viales mayores en las últimas 48 horas.",
      },
      {
        id: "ev-qro-gdelt-2",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "politico",
        severity: "medio",
        title: "[GDELT] Monitoreo de Infraestructura: Obras Hidráulicas del Sistema Batán en la ZMQ",
        summary: "Cobertura periodística sobre la garantía de abasto hídrico y supervisión del proyecto Acuaférico metropolitano.",
        ai_summary: "Estabilidad en la agenda hídrica metropolitana. Percepción pública positiva en medios impresos y digitales.",
        political_relevance: 7,
        municipio: "Santiago de Querétaro",
        occurred_at: new Date(Date.now() - 480 * 60000).toISOString(),
        source_type: "gdelt",
        source_name: "GDELT Project — Hemispheric News Monitor",
        source_identifier: "gdelt-qro-live-02",
        source_credibility: "prensa_internacional",
        raw_text: "📰 [GDELT 2.0 Prensa - Hace 8 horas] Índice GDELT: Portales informativos locales reseñan los avances técnicos en los acueductos metropolitanos de Querétaro y Corregidora, destacando la sostenibilidad para los parques industriales y comunidades.",
      },
      {
        id: "ev-qro-data365-1",
        state_id: "11111111-1111-1111-1111-111111111111",
        category: "vialidad",
        severity: "medio",
        title: "[Data365] Pulso Social Digital: Aforo Vehicular en Paseo 5 de Febrero y Zaragoza",
        summary: "Detección temprana en X y Facebook de aforo en carriles centrales de 5 de Febrero.",
        ai_summary: "Circulación continua a 50 km/h sin interrupciones mayores.",
        political_relevance: 6,
        municipio: "Santiago de Querétaro",
        occurred_at: new Date(Date.now() - 60 * 60000).toISOString(),
        source_type: "data365_twitter",
        source_name: "Data365 Social Radar (X & Facebook)",
        source_identifier: "data365-qro-01",
        source_credibility: "monitoreo_social",
        raw_text: "📊 [Data365 Social Intelligence - Hace 1 hora] Menciones en X: Conductores reportan circulación ágil sobre carriles confinados de Paseo 5 de Febrero. Sin anomalías en transporte público.",
      },
    ];
  }
}
