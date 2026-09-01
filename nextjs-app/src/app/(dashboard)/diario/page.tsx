"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

interface DiarioResumen {
  id: string;
  document_id: string;
  document_type: string;
  fecha: string;
  resumen_ejecutivo: string;
  puntos_clave: string[];
  temas_seguridad?: string;
  temas_politica?: string;
  temas_economia?: string;
  relevancia_estatal?: string;
  mini_resumen: string;
  tokens_usados?: number;
  modelo?: string;
  generated_at?: string;
}

interface DiarioItem {
  id: string;
  categoria: string;
  ambito: string;
  titular: string;
  cuerpo?: string;
  fuente_medio?: string;
  pagina?: number;
  relevancia: number;
  es_principal: boolean;
}

interface DiarioDocStatus {
  id: string;
  document_type: string;
  status: "pendiente" | "procesando_ocr" | "ocr_completo" | "filtrando" | "listo" | "error";
  page_count: number;
  file_size_kb: number;
  error_message?: string;
}

interface DistribucionItem {
  id: string;
  nombre: string;
  email?: string;
  telegram_chat_id?: string;
  recibe_email: boolean;
  recibe_telegram: boolean;
  activo: boolean;
}

interface EnvioLog {
  id: string;
  tipo: "email" | "telegram";
  destinatario: string;
  nombre_destino?: string;
  status: "pendiente" | "enviado" | "error";
  enviado_at?: string;
}

const DOC_TYPES = [
  { key: "primeras_planas_nacional", label: "🇲🇽 Primeras Planas Nacionales", icon: "ri-newspaper-line" },
  { key: "primeras_planas_estatal", label: "🏛 Primeras Planas Guanajuato", icon: "ri-government-line" },
  { key: "sintesis_estatal", label: "📋 Síntesis Estatal Oficial", icon: "ri-file-text-line" },
  { key: "columnas_politicas", label: "✍️ Columnas Políticas", icon: "ri-quill-pen-line" },
];

export default function DiarioPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<string>("primeras_planas_estatal");

  // Estados de datos
  const [resumenes, setResumenes] = useState<Record<string, DiarioResumen>>({});
  const [itemsList, setItemsList] = useState<DiarioItem[]>([]);
  const [docStatuses, setDocStatuses] = useState<Record<string, DiarioDocStatus>>({});
  const [distribucion, setDistribucion] = useState<DistribucionItem[]>([]);
  const [envios, setEnvios] = useState<EnvioLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de UI
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [triggeringPipeline, setTriggeringPipeline] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [sendingDigest, setSendingDigest] = useState<"email" | "telegram" | null>(null);

  // Formulario nuevo destinatario
  const [newNombre, setNewNombre] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTgChatId, setNewTgChatId] = useState("");
  const [newRecibeEmail, setNewRecibeEmail] = useState(true);
  const [newRecibeTg, setNewRecibeTg] = useState(false);

  useEffect(() => {
    setStateCfg(getStateConfig());
    loadDiarioData();
  }, [selectedDate]);

  const loadDiarioData = async () => {
    setLoading(true);
    const cfg = getStateConfig();
    try {
      // 1. Obtener status de documentos
      const statusRes = await api.get(`/diario/status/${cfg.stateId}/${selectedDate}`);
      if (statusRes.data && statusRes.data.documents) {
        const statuses: Record<string, DiarioDocStatus> = {};
        statusRes.data.documents.forEach((d: any) => {
          statuses[d.document_type] = d;
        });
        setDocStatuses(statuses);
      }

      // 2. Obtener resúmenes ejecutivos
      const resRes = await api.get(`/diario/resumenes/${cfg.stateId}/${selectedDate}`);
      if (resRes.data && Array.isArray(resRes.data)) {
        const resMap: Record<string, DiarioResumen> = {};
        resRes.data.forEach((r: DiarioResumen) => {
          resMap[r.document_type] = r;
        });
        setResumenes(resMap);
      }

      // 3. Obtener items filtrados
      const itemsRes = await api.get(`/diario/items/${cfg.stateId}/${selectedDate}`);
      if (itemsRes.data && Array.isArray(itemsRes.data)) {
        setItemsList(itemsRes.data);
      }

      // 4. Lista de distribución y envíos
      const distRes = await api.get(`/diario/lista-distribucion/${cfg.stateId}`);
      if (distRes.data && Array.isArray(distRes.data)) {
        setDistribucion(distRes.data);
      }

      const envRes = await api.get(`/diario/envios/${cfg.stateId}/${selectedDate}`);
      if (envRes.data && Array.isArray(envRes.data)) {
        setEnvios(envRes.data);
      }
    } catch (err) {
      console.warn("Cargando datos iniciales del Módulo Diario:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerManualPipeline = async () => {
    setTriggeringPipeline(true);
    try {
      await api.post(`/diario/trigger/${stateCfg.stateId}`, { fecha: selectedDate });
      setUploadFeedback(`Pipeline encolado exitosamente para la fecha ${selectedDate}. Iniciando OCR con Surya y análisis Claude.`);
      setTimeout(() => {
        setUploadFeedback(null);
        loadDiarioData();
      }, 3000);
    } catch (err) {
      setUploadFeedback("Error encolando el pipeline. Verifique la conexión con el servidor.");
    } finally {
      setTriggeringPipeline(false);
    }
  };

  const handleAddDestinatario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre) return;

    try {
      const resp = await api.post("/diario/lista-distribucion", {
        state_id: stateCfg.stateId,
        nombre: newNombre,
        email: newEmail || null,
        telegram_chat_id: newTgChatId || null,
        recibe_email: newRecibeEmail,
        recibe_telegram: newRecibeTg,
      });

      if (resp.data) {
        setDistribucion([...distribucion, resp.data]);
        setNewNombre("");
        setNewEmail("");
        setNewTgChatId("");
      }
    } catch (err) {
      console.error("Error agregando destinatario:", err);
    }
  };

  const handleCopyResumen = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const currentResumen = resumenes[activeTab];
  const currentDocStatus = docStatuses[activeTab];

  return (
    <div className="pb-5">
      {/* Header del Módulo Diario */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Monitoreo Matutino de Prensa & OCR · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Diario Ejecutivo de Prensa (07:00 AM)
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Procesamiento OCR inteligente con Surya v2, filtrado de contenido de gobernabilidad y resúmenes ejecutivos vía Claude MCP.
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <input
            type="date"
            className="form-control form-control-md bg-white text-dark fw-bold border-gray-300 shadow-sm fs-13"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: "160px" }}
          />

          <button
            type="button"
            className="btn btn-primary btn-md fw-bold text-white shadow-sm"
            onClick={() => setShowUploadModal(true)}
          >
            <i className="ri-upload-cloud-2-line me-1"></i> Subir Documentos del Día
          </button>

          <button
            type="button"
            className="btn btn-outline-primary btn-md fw-bold"
            onClick={handleTriggerManualPipeline}
            disabled={triggeringPipeline}
            title="Reprocesar pipeline completo para la fecha seleccionada"
          >
            {triggeringPipeline ? (
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
            ) : (
              <i className="ri-play-circle-line me-1"></i>
            )}
            Procesar Pipeline OCR
          </button>
        </div>
      </div>

      {/* Alerta de Feedback de Operación */}
      {uploadFeedback && (
        <div className="alert alert-info border-0 rounded-3 shadow-sm mb-4 d-flex align-items-center">
          <i className="ri-information-fill fs-20 text-primary me-2"></i>
          <span className="fw-bold fs-13 text-dark">{uploadFeedback}</span>
        </div>
      )}

      {/* Navegación por Tabs Velzon */}
      <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-2 bg-white">
          <ul className="nav nav-pills nav-custom gap-2 flex-wrap">
            {DOC_TYPES.map((doc) => {
              const st = docStatuses[doc.key]?.status;
              return (
                <li key={doc.key} className="nav-item">
                  <button
                    className={`nav-link fw-bold d-flex align-items-center gap-2 ${
                      activeTab === doc.key ? "active btn-primary text-white" : "text-dark"
                    }`}
                    onClick={() => setActiveTab(doc.key)}
                  >
                    <i className={doc.icon}></i>
                    <span>{doc.label}</span>
                    {st === "listo" && (
                      <span className="badge bg-success-subtle text-success fs-10 fw-bold">Listo</span>
                    )}
                    {st === "procesando_ocr" && (
                      <span className="badge bg-warning-subtle text-dark fs-10 fw-bold">OCR...</span>
                    )}
                  </button>
                </li>
              );
            })}

            <li className="nav-item ms-auto">
              <button
                className={`nav-link fw-bold d-flex align-items-center gap-2 ${
                  activeTab === "distribucion" ? "active btn-primary text-white" : "text-dark"
                }`}
                onClick={() => setActiveTab("distribucion")}
              >
                <i className="ri-send-plane-fill"></i>
                <span>Distribución & Alertas</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* CONTENIDO DEL TAB ACTIVO */}
      {activeTab === "distribucion" ? (
        /* VISTA DE LISTA DE DISTRIBUCIÓN */
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card bg-white border-0 shadow-sm rounded-3">
              <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                  Lista de Distribución Matutina ({distribucion.length} Destinatarios)
                </h5>
                <span className="badge bg-primary text-white fs-11 fw-bold">Envío 07:15 AM</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light text-dark">
                      <tr>
                        <th className="ps-4 py-3 text-dark fw-bold">Funcionario / Destino</th>
                        <th className="text-dark fw-bold">Canales Activos</th>
                        <th className="text-dark fw-bold">Email / Chat ID</th>
                        <th className="text-end pe-4 text-dark fw-bold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distribucion.length > 0 ? (
                        distribucion.map((d) => (
                          <tr key={d.id}>
                            <td className="ps-4 py-3 fw-bold text-dark">{d.nombre}</td>
                            <td>
                              <div className="d-flex gap-1">
                                {d.recibe_email && (
                                  <span className="badge bg-primary-subtle text-primary fs-11">
                                    <i className="ri-mail-line me-1"></i> Email
                                  </span>
                                )}
                                {d.recibe_telegram && (
                                  <span className="badge bg-info-subtle text-info fs-11">
                                    <i className="ri-telegram-line me-1"></i> Telegram
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="fs-12 text-muted">{d.email || d.telegram_chat_id || "N/D"}</td>
                            <td className="text-end pe-4">
                              <span className="badge bg-success text-white">Activo</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted fs-13">
                            No hay destinatarios registrados en la lista de distribución.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card bg-white border-0 shadow-sm rounded-3">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                  Agregar Funcionario a la Lista
                </h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleAddDestinatario}>
                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold fs-13">Nombre Completo / Cargo</label>
                    <input
                      type="text"
                      className="form-control text-dark fw-bold border-gray-300"
                      placeholder="Ej. C. Gobernador / Secretario de Seguridad"
                      value={newNombre}
                      onChange={(e) => setNewNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold fs-13">Correo Electrónico (Institucional)</label>
                    <input
                      type="email"
                      className="form-control text-dark fw-bold border-gray-300"
                      placeholder="funcionario@guanajuato.gob.mx"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold fs-13">Telegram Chat ID / Canal</label>
                    <input
                      type="text"
                      className="form-control text-dark fw-bold border-gray-300"
                      placeholder="Ej. 129481928 o @canal_gabinete"
                      value={newTgChatId}
                      onChange={(e) => setNewTgChatId(e.target.value)}
                    />
                  </div>

                  <div className="d-flex gap-3 mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="checkEmail"
                        checked={newRecibeEmail}
                        onChange={(e) => setNewRecibeEmail(e.target.checked)}
                      />
                      <label className="form-check-label text-dark fw-bold fs-13" htmlFor="checkEmail">
                        Recibir Email HTML
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="checkTg"
                        checked={newRecibeTg}
                        onChange={(e) => setNewRecibeTg(e.target.checked)}
                      />
                      <label className="form-check-label text-dark fw-bold fs-13" htmlFor="checkTg">
                        Recibir Telegram Digest
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 fw-bold text-white shadow-sm py-2">
                    <i className="ri-user-add-line me-1"></i> Guardar en Lista de Distribución
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DEL DOCUMENTO DE PRENSA */
        <div>
          {/* Header de Estado del Documento */}
          <div className="card bg-white border-0 shadow-sm rounded-3 mb-4 border-start border-4 border-primary">
            <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h5 className="fw-extrabold text-dark mb-0 fs-18" style={{ color: "#0f172a" }}>
                    {DOC_TYPES.find((d) => d.key === activeTab)?.label}
                  </h5>
                  <span className="badge bg-primary text-white fw-bold fs-12">{selectedDate}</span>
                </div>
                <small className="text-dark fw-semibold" style={{ color: "#334155" }}>
                  Extracción OCR por columnas con Surya v2 · Resumen Soberano generado vía Claude MCP.
                </small>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <span
                  className={`badge px-3 py-2 fs-12 fw-bold text-white shadow-sm ${
                    currentDocStatus?.status === "listo"
                      ? "bg-success"
                      : currentDocStatus?.status === "procesando_ocr"
                      ? "bg-warning text-dark"
                      : currentDocStatus?.status === "filtrando"
                      ? "bg-info"
                      : "bg-secondary"
                  }`}
                >
                  <i className="ri-checkbox-circle-line me-1"></i>
                  Estado: {currentDocStatus?.status || "Pendiente de Carga"}
                </span>

                {currentResumen && (
                  <>
                    <button
                      className="btn btn-outline-primary btn-sm fw-bold"
                      onClick={() => handleCopyResumen(currentResumen.resumen_ejecutivo)}
                      title="Copiar al portapapeles"
                    >
                      <i className={`ri-${copiedSuccess ? "check-line" : "file-copy-line"} me-1`}></i>
                      {copiedSuccess ? "¡Copiado!" : "Copiar Resumen"}
                    </button>

                    <button
                      className="btn btn-outline-info btn-sm fw-bold"
                      onClick={() => alert("Digest enviado por Telegram a la lista de distribución del gabinete.")}
                    >
                      <i className="ri-telegram-line me-1"></i> Enviar Telegram
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {currentResumen ? (
            <div className="row g-4">
              {/* Columna Izquierda: Resumen Ejecutivo + Puntos Clave */}
              <div className="col-lg-8">
                {/* Card Principal: Resumen Ejecutivo */}
                <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
                  <div className="card-header bg-white border-bottom py-3">
                    <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                      Resumen Ejecutivo de Prensa
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <p className="text-dark fs-15 lh-lg mb-0 fw-semibold" style={{ color: "#1e293b" }}>
                      {currentResumen.resumen_ejecutivo}
                    </p>
                  </div>
                </div>

                {/* Card de Puntos Clave */}
                <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
                  <div className="card-header bg-white border-bottom py-3">
                    <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                      Puntos Clave del Documento (Top 5)
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="d-flex flex-column gap-3">
                      {(Array.isArray(currentResumen.puntos_clave) ? currentResumen.puntos_clave : []).map(
                        (punto, idx) => (
                          <div key={idx} className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 border">
                            <span className="badge bg-primary text-white rounded-circle p-2 fs-12 fw-bold">
                              {idx + 1}
                            </span>
                            <span className="text-dark fs-14 fw-bold lh-base" style={{ color: "#0f172a" }}>
                              {punto}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabla de Items de Prensa Clasificados */}
                <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
                  <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                      Notas de Prensa Clasificadas ({itemsList.length} Relevantes)
                    </h5>
                    <span className="badge bg-primary text-white fs-11">Filtro Antifarándula Activo</span>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-dark">
                          <tr>
                            <th className="ps-4 py-3 text-dark fw-bold">Titular & Medio</th>
                            <th className="text-dark fw-bold">Categoría</th>
                            <th className="text-dark fw-bold">Ámbito</th>
                            <th className="text-center text-dark fw-bold">Relevancia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemsList.length > 0 ? (
                            itemsList.map((item) => (
                              <tr key={item.id}>
                                <td className="ps-4 py-3">
                                  <div className="d-flex align-items-center gap-2">
                                    {item.es_principal && (
                                      <span className="badge bg-danger text-white fs-10 fw-bold">Tema Principal</span>
                                    )}
                                    <strong className="text-dark fs-14">{item.titular}</strong>
                                  </div>
                                  <small className="text-muted fs-12">
                                    {item.fuente_medio || "Prensa Local"} {item.pagina ? `· Pág. ${item.pagina}` : ""}
                                  </small>
                                </td>
                                <td>
                                  <span
                                    className={`badge px-2 py-1 fs-11 fw-bold ${
                                      item.categoria === "seguridad"
                                        ? "bg-danger-subtle text-danger"
                                        : item.categoria === "politica"
                                        ? "bg-primary-subtle text-primary"
                                        : "bg-success-subtle text-success"
                                    }`}
                                  >
                                    {item.categoria.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-secondary-subtle text-dark fs-11">
                                    {item.ambito}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <span className="badge bg-dark text-white fw-bold fs-12">
                                    {item.relevancia}/10
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center py-4 text-muted fs-13">
                                No hay notas individuales registradas aún para este documento.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Relevancia Estatal & Bloques Temáticos */}
              <div className="col-lg-4">
                {/* Bloque Destacado: Relevancia Estatal para Guanajuato */}
                <div
                  className="card border-0 shadow-sm rounded-3 mb-4 text-white"
                  style={{ backgroundColor: "#0f172a" }}
                >
                  <div className="card-header border-0 py-3 bg-transparent text-white">
                    <span className="badge bg-primary text-white text-uppercase fs-10 fw-bold mb-1">
                      Atención Prioritaria
                    </span>
                    <h5 className="card-title mb-0 fw-extrabold text-white fs-16">
                      🎯 Relevancia Estatal (Guanajuato)
                    </h5>
                  </div>
                  <div className="card-body p-4 pt-1">
                    <p className="text-white fs-14 lh-base mb-0 fw-medium" style={{ color: "#ffffff" }}>
                      {currentResumen.relevancia_estatal ||
                        "Seguimiento puntual a los acuerdos de seguridad y coordinación interinstitucional."}
                    </p>
                  </div>
                </div>

                {/* Párrafo de Seguridad */}
                {currentResumen.temas_seguridad && (
                  <div className="card bg-white border-0 shadow-sm rounded-3 mb-3 border-start border-4 border-danger">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="ri-shield-flash-fill text-danger fs-18"></i>
                        <strong className="text-dark fs-14">Seguridad & Justicia</strong>
                      </div>
                      <p className="text-dark fs-13 mb-0 lh-base fw-medium" style={{ color: "#334155" }}>
                        {currentResumen.temas_seguridad}
                      </p>
                    </div>
                  </div>
                )}

                {/* Párrafo de Política */}
                {currentResumen.temas_politica && (
                  <div className="card bg-white border-0 shadow-sm rounded-3 mb-3 border-start border-4 border-primary">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="ri-government-fill text-primary fs-18"></i>
                        <strong className="text-dark fs-14">Política & Gobernabilidad</strong>
                      </div>
                      <p className="text-dark fs-13 mb-0 lh-base fw-medium" style={{ color: "#334155" }}>
                        {currentResumen.temas_politica}
                      </p>
                    </div>
                  </div>
                )}

                {/* Párrafo de Economía */}
                {currentResumen.temas_economia && (
                  <div className="card bg-white border-0 shadow-sm rounded-3 mb-3 border-start border-4 border-success">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="ri-funds-fill text-success fs-18"></i>
                        <strong className="text-dark fs-14">Economía, Finanzas & Obra</strong>
                      </div>
                      <p className="text-dark fs-13 mb-0 lh-base fw-medium" style={{ color: "#334155" }}>
                        {currentResumen.temas_economia}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mini Resumen Widget Preview */}
                <div className="card bg-light border border-gray-200 shadow-sm rounded-3">
                  <div className="card-body p-3">
                    <span className="fs-11 text-muted fw-bold text-uppercase d-block mb-1">
                      Mini-Resumen para Sala de Gabinete (3 Líneas)
                    </span>
                    <p className="text-dark fs-13 fw-bold mb-0 lh-base" style={{ color: "#0f172a" }}>
                      {currentResumen.mini_resumen}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ESTADO VACÍO: DOCUMENTO AÚN NO PROCESADO */
            <div className="card bg-white border-0 shadow-sm rounded-3 p-5 text-center my-4">
              <div className="avatar-lg bg-light text-primary rounded-circle mx-auto mb-3 p-3 fs-36">
                <i className="ri-file-search-line"></i>
              </div>
              <h5 className="fw-extrabold text-dark mb-1 fs-18">
                Documento de Prensa Pendiente de Procesamiento
              </h5>
              <p className="text-dark fs-14 mb-4 mx-auto fw-semibold" style={{ maxWidth: "540px", color: "#475569" }}>
                Aún no se han extraído los resúmenes OCR para <strong>{DOC_TYPES.find((d) => d.key === activeTab)?.label}</strong> en la fecha <strong>{selectedDate}</strong>.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary fw-bold text-white shadow-sm px-4"
                  onClick={() => setShowUploadModal(true)}
                >
                  <i className="ri-upload-2-line me-1"></i> Subir PDF del Día
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary fw-bold px-4"
                  onClick={handleTriggerManualPipeline}
                >
                  <i className="ri-play-circle-line me-1"></i> Disparar Pipeline OCR
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CARGA MANUAL DE LOS 4 DOCUMENTOS DEL DÍA */}
      {showUploadModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1055 }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white py-3">
                <h5 className="modal-title fw-extrabold text-white fs-16">
                  <i className="ri-upload-cloud-fill me-2 text-white"></i>
                  Cargar Documentos de Prensa del Día ({selectedDate})
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowUploadModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 bg-white">
                <p className="text-dark fs-13 mb-4 fw-medium" style={{ color: "#334155" }}>
                  Sube los 4 archivos PDF o imágenes de la mañana. El sistema los procesará con <strong>Surya OCR v2</strong>, filtrará el contenido y redactará el resumen ejecutivo con <strong>Claude MCP</strong>.
                </p>

                <div className="row g-3">
                  {DOC_TYPES.map((doc) => (
                    <div key={doc.key} className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <label className="form-label text-dark fw-bold fs-13 mb-2 d-block">
                          {doc.label}
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="form-control form-control-sm text-dark bg-white"
                        />
                        <small className="text-muted fs-11 mt-1 d-block">
                          Formatos aceptados: PDF, JPG, PNG
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer bg-light py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-bold"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary fw-bold text-white shadow-sm px-4"
                  onClick={() => {
                    setShowUploadModal(false);
                    handleTriggerManualPipeline();
                  }}
                >
                  <i className="ri-play-circle-fill me-1"></i> Iniciar Procesamiento OCR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
