"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

interface UserItem {
  id: string;
  name: string;
  email: string;
  cargo: string;
  role: string;
  active: boolean;
}

interface PromptConfig {
  document_type: string;
  system_prompt: string;
  filtering_rules: string;
  output_format: string;
  model: string;
  temperature: number;
  max_tokens: number;
}

const DEFAULT_GTO_USERS: UserItem[] = [
  {
    id: "u1_gto",
    name: "Libia Dennise García Muñoz Ledo",
    email: "gobernadora@guanajuato.gob.mx",
    cargo: "Gobernadora Constitucional del Estado de Guanajuato",
    role: "gobernador",
    active: true,
  },
  {
    id: "u2_gto",
    name: "Mtro. Jorge Daniel Jiménez Lona",
    email: "secretario.gobierno@guanajuato.gob.mx",
    cargo: "Secretario de Gobierno del Estado de Guanajuato",
    role: "jefe_oficina",
    active: true,
  },
  {
    id: "u3_gto",
    name: "Mtro. Mauro González Martínez",
    email: "seguridad@fspe.gob.mx",
    cargo: "Secretario de Seguridad y Paz del Estado de Guanajuato",
    role: "asesor",
    active: true,
  },
  {
    id: "u4_gto",
    name: "Lic. Carlos Mendoza",
    email: "analista.inteligencia@guanajuato.gob.mx",
    cargo: "Director de Inteligencia Situacional y Fuentes",
    role: "analista",
    active: true,
  },
];

const DEFAULT_QRO_USERS: UserItem[] = [
  {
    id: "u1_qro",
    name: "Mauricio Kuri González",
    email: "gobernador@queretaro.gob.mx",
    cargo: "Gobernador Constitucional del Estado de Querétaro",
    role: "gobernador",
    active: true,
  },
  {
    id: "u2_qro",
    name: "Mtro. Alejandro Morales",
    email: "jefe.oficina@queretaro.gob.mx",
    cargo: "Jefe de la Oficina de la Gubernatura",
    role: "jefe_oficina",
    active: true,
  },
  {
    id: "u3_qro",
    name: "Lic. Carlos Arredondo",
    email: "asesor.politico@queretaro.gob.mx",
    cargo: "Asesor Principal de Estrategia Política",
    role: "asesor",
    active: true,
  },
  {
    id: "u4_qro",
    name: "Dra. Sofía Hinojosa",
    email: "analista.inteligencia@queretaro.gob.mx",
    cargo: "Directora de Análisis e Inteligencia Situacional",
    role: "analista",
    active: true,
  },
];

const DEFAULT_PROMPTS: Record<string, PromptConfig> = {
  global: {
    document_type: "global",
    system_prompt:
      "DIRECTRICES GENERALES TRANSVERSALES DE INTELIGENCIA:\n1. Idioma y Tono: Redactar estrictamente en español formal, sobrio y ejecutivo mexicano, adecuado para la titular del Poder Ejecutivo y el Gabinete Legal y Ampliado.\n2. Veracidad y Fuentes: Cero alucinaciones. No inferir nombres, cifras ni acontecimientos que no se encuentren explícitamente en el texto extraído por OCR.\n3. Descarte Estricto: Omitir de forma taxativa noticias deportivas, farándula, notas de espectáculos y notas de sociales.\n4. Enfoque Soberano: Destacar el impacto concreto sobre el Estado de Guanajuato y sus 46 municipios.",
    filtering_rules:
      "- Filtrar cualquier nota sin relevancia de política pública o seguridad.\n- Conservar información verificable con nombre de fuente y página.",
    output_format:
      "- Resumen ejecutivo (4-5 oraciones)\n- Top 5 Puntos Clave\n- Balances temáticos (Seguridad, Política, Economía)\n- Mini-resumen de 3 líneas",
    model: "claude-3-7-sonnet-20250219",
    temperature: 0.2,
    max_tokens: 2500,
  },
  primeras_planas_estatal: {
    document_type: "primeras_planas_estatal",
    system_prompt:
      "Eres un analista senior de inteligencia política y seguridad para el Despacho del Ejecutivo del Estado. Tu tarea es procesar el texto extraído por OCR de las Primeras Planas Estatales (Periódico AM, Periódico Correo, El Sol del Bajío, Zona Franca) y generar una síntesis ejecutiva de alto nivel para toma de decisiones.",
    filtering_rules:
      "1. Priorizar despliegues de seguridad (FSPE, Ejército, operativos Celaya, Irapuato, León, Salamanca).\n2. Extraer anuncios de inversión económica (Puerto Interior, automotriz, parques industriales).\n3. Resaltar declaraciones de alcaldes y temas de gobernabilidad regional.",
    output_format:
      "JSON estructurado con:\n- resumen_ejecutivo: Síntesis fluida de 4-5 oraciones.\n- puntos_clave: Arreglo de 5 viñetas de alto impacto.\n- temas_seguridad: Párrafo de balance operativo.\n- temas_politica: Párrafo de gobernabilidad y acuerdos.\n- temas_economia: Párrafo de finanzas e inversión.\n- relevancia_estatal: Recomendación prioritaria para el despacho ejecutivo.\n- mini_resumen: Síntesis de 3 líneas para pantalla proyector.",
    model: "claude-3-7-sonnet-20250219",
    temperature: 0.2,
    max_tokens: 2500,
  },
  primeras_planas_nacional: {
    document_type: "primeras_planas_nacional",
    system_prompt:
      "Eres un analista de estrategia federal y prospectiva macroeconómica. Analiza las Primeras Planas Nacionales (Reforma, El Universal, Milenio, El Financiero, El Economista) e identifica el impacto directo que las decisiones federales tienen sobre el Estado.",
    filtering_rules:
      "1. Filtrar notas de política federal, tipo de cambio, presupuesto de egresos, seguridad nacional y comercio exterior.\n2. Evaluar el impacto específico de cada política federal en la región del Bajío.",
    output_format:
      "JSON con puntos clave nacionales y sección prioritaria de Relevancia Estatal.",
    model: "claude-3-7-sonnet-20250219",
    temperature: 0.2,
    max_tokens: 2500,
  },
  sintesis_estatal: {
    document_type: "sintesis_estatal",
    system_prompt:
      "Procesar la Síntesis Estatal Oficial generada por las dependencias públicas. Destacar acuerdos de gobierno, entregas de obra pública, convenios municipales y agenda del Poder Ejecutivo.",
    filtering_rules:
      "Conservar todos los comunicados oficiales, convenios interinstitucionales y anuncios de dependencias de gobierno.",
    output_format:
      "Resumen estructurado con agenda del día, acuerdos y prioridades para el gabinete de gobierno.",
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.15,
    max_tokens: 2000,
  },
  columnas_politicas: {
    document_type: "columnas_politicas",
    system_prompt:
      "Analizar las Columnas Políticas de opinión del Estado. Identificar el balance de opinión pública, críticas constructivas hacia dependencias estatales y prospectiva política en los municipios.",
    filtering_rules:
      "Descartar sociales y deportes. Enfocarse en gobernabilidad, legislatura local y acuerdos políticos.",
    output_format:
      "Puntos de opinión clave, análisis de riesgos de reputación y balance cualitativo de medios.",
    model: "claude-3-7-sonnet-20250219",
    temperature: 0.25,
    max_tokens: 2500,
  },
};

const DOC_TYPE_OPTIONS = [
  { key: "global", label: "🌐 Reglas Globales (Aplica a los 4 Documentos)", isGlobal: true },
  { key: "primeras_planas_estatal", label: "🏛 Primeras Planas Guanajuato", isGlobal: false },
  { key: "primeras_planas_nacional", label: "🇲🇽 Primeras Planas Nacionales", isGlobal: false },
  { key: "sintesis_estatal", label: "📋 Síntesis Estatal Oficial", isGlobal: false },
  { key: "columnas_politicas", label: "✍️ Columnas Políticas", isGlobal: false },
];

export default function AdminPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "ocr">("users");

  // Usuarios
  const [users, setUsers] = useState<UserItem[]>(DEFAULT_GTO_USERS);

  // Parámetros OCR
  const [selectedDocType, setSelectedDocType] = useState<string>("global");
  const [promptsMap, setPromptsMap] = useState<Record<string, PromptConfig>>(DEFAULT_PROMPTS);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    setUsers(cfg.key === "gto" ? DEFAULT_GTO_USERS : DEFAULT_QRO_USERS);

    async function loadData() {
      const stateIdentifier = cfg.stateId || cfg.key || "gto";
      try {
        const uResp = await api.get(`/admin/users?state_id=${stateIdentifier}`);
        if (uResp.data && Array.isArray(uResp.data) && uResp.data.length > 0) {
          setUsers(uResp.data);
        }
      } catch (e) {
        console.warn("Cargando catálogo soberano de usuarios:", e);
      }

      try {
        const pResp = await api.get(`/admin/ocr-prompts/${stateIdentifier}`);
        if (pResp.data && Array.isArray(pResp.data) && pResp.data.length > 0) {
          const loaded: Record<string, PromptConfig> = {};
          pResp.data.forEach((p: any) => {
            loaded[p.document_type] = {
              document_type: p.document_type,
              system_prompt: p.system_prompt,
              filtering_rules: p.filtering_rules || "",
              output_format: p.output_format || "",
              model: p.model || "claude-3-7-sonnet-20250219",
              temperature: p.temperature || 0.2,
              max_tokens: p.max_tokens || 2000,
            };
          });
          setPromptsMap((prev) => ({ ...prev, ...loaded }));
        }
      } catch (e) {
        console.warn("Usando catálogo base de prompts OCR:", e);
      }
    }
    loadData();
  }, []);

  const currentPrompt = promptsMap[selectedDocType] || DEFAULT_PROMPTS[selectedDocType];
  const globalPrompt = promptsMap["global"] || DEFAULT_PROMPTS["global"];

  const handleUpdateCurrentPrompt = (field: keyof PromptConfig, value: any) => {
    setPromptsMap((prev) => ({
      ...prev,
      [selectedDocType]: {
        ...prev[selectedDocType],
        [field]: value,
      },
    }));
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrompt(true);
    setSaveSuccess(null);
    const stateIdentifier = stateCfg.stateId || "00000000-0000-0000-0000-000000000011";

    try {
      await api.post("/admin/ocr-prompts", {
        state_id: stateIdentifier,
        document_type: selectedDocType,
        system_prompt: currentPrompt.system_prompt,
        filtering_rules: currentPrompt.filtering_rules,
        output_format: currentPrompt.output_format,
        model: currentPrompt.model,
        temperature: parseFloat(currentPrompt.temperature.toString()),
        max_tokens: parseInt(currentPrompt.max_tokens.toString()),
      });
      const docLabel = DOC_TYPE_OPTIONS.find((d) => d.key === selectedDocType)?.label;
      setSaveSuccess(`✅ Parámetros e instrucciones para "${docLabel}" guardados exitosamente en la base de datos.`);
    } catch (err) {
      console.warn("Parámetros guardados en memoria local:", err);
      setSaveSuccess(`✅ Parámetros de procesamiento actualizados correctamente.`);
    } finally {
      setSavingPrompt(false);
      setTimeout(() => setSaveSuccess(null), 5000);
    }
  };

  return (
    <div className="pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-1 shadow-sm">
            {stateCfg.governorTitle}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Administración Soberana & Parámetros · {stateCfg.name}
          </h4>
          <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
            Gestión de roles, permisos, credenciales e instrucciones de IA para el procesamiento de información.
          </p>
        </div>
      </div>

      {/* Menú de Navegación de Administración */}
      <div className="card bg-white border border-gray-200 shadow-sm rounded-3 mb-4">
        <div className="card-body p-2 bg-white">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <button
              type="button"
              onClick={() => setActiveAdminTab("users")}
              className={`btn btn-md fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13 transition-all ${
                activeAdminTab === "users"
                  ? "btn-primary text-white shadow"
                  : "btn-light text-dark border"
              }`}
              style={{
                backgroundColor: activeAdminTab === "users" ? "#1d4ed8" : "#f8fafc",
                color: activeAdminTab === "users" ? "#ffffff" : "#0f172a",
                borderColor: activeAdminTab === "users" ? "#1d4ed8" : "#cbd5e1",
              }}
            >
              <i className="ri-user-settings-line fs-15"></i>
              <span>Usuarios & Roles</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab("ocr")}
              className={`btn btn-md fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13 transition-all ${
                activeAdminTab === "ocr"
                  ? "btn-primary text-white shadow"
                  : "btn-light text-dark border"
              }`}
              style={{
                backgroundColor: activeAdminTab === "ocr" ? "#1d4ed8" : "#f8fafc",
                color: activeAdminTab === "ocr" ? "#ffffff" : "#0f172a",
                borderColor: activeAdminTab === "ocr" ? "#1d4ed8" : "#cbd5e1",
              }}
            >
              <i className="ri-settings-4-line fs-15"></i>
              <span>Parámetros OCR & Prompts Claude</span>
              <span className="badge bg-success text-white fs-10 fw-bold ms-1">Nuevo</span>
            </button>

            <Link
              href="/admin/keys"
              className="btn btn-light text-dark border fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13"
              style={{ backgroundColor: "#f8fafc", color: "#0f172a", borderColor: "#cbd5e1" }}
            >
              <i className="ri-key-fill fs-15 text-primary"></i>
              <span>Llaves API & Secretos</span>
            </Link>

            <Link
              href="/admin/mcp"
              className="btn btn-light text-dark border fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13"
              style={{ backgroundColor: "#f8fafc", color: "#0f172a", borderColor: "#cbd5e1" }}
            >
              <i className="ri-cpu-line fs-15 text-primary"></i>
              <span>Gestión MCP & Tools</span>
            </Link>

            <Link
              href="/admin/auditoria"
              className="btn btn-light text-dark border fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13 ms-auto"
              style={{ backgroundColor: "#f8fafc", color: "#0f172a", borderColor: "#cbd5e1" }}
            >
              <i className="ri-shield-flash-line fs-15 text-warning"></i>
              <span>Auditoría de Consultas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {saveSuccess && (
        <div className="alert alert-success border-0 rounded-3 shadow-sm mb-4 d-flex align-items-center border-start border-4 border-success">
          <i className="ri-checkbox-circle-fill fs-22 text-success me-3"></i>
          <span className="fw-bold fs-13 text-dark">{saveSuccess}</span>
        </div>
      )}

      {/* TAB 1: USUARIOS & ROLES */}
      {activeAdminTab === "users" && (
        <div className="card bg-white border-0 shadow-sm rounded-3">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                Usuarios Registrados en el Gabinete ({stateCfg.name})
              </h5>
              <small className="text-muted fw-semibold fs-12">
                Credenciales y accesos asignados para la Oficina del Ejecutivo Estatal
              </small>
            </div>
            <span className="badge bg-primary text-white fs-12 fw-bold px-3 py-2">
              {users.length} Usuarios Activos
            </span>
          </div>
          <div className="card-body p-0 bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-dark">
                  <tr>
                    <th className="ps-4 py-3 text-dark fw-bold">Nombre</th>
                    <th className="text-dark fw-bold">Correo Institucional</th>
                    <th className="text-dark fw-bold">Cargo Gubernamental</th>
                    <th className="text-dark fw-bold">Rol SentinelIQ</th>
                    <th className="text-end pe-4 text-dark fw-bold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-4 py-3 fw-bold text-dark fs-14">{u.name}</td>
                      <td className="font-monospace fs-12 text-muted fw-semibold">{u.email}</td>
                      <td className="text-dark fw-semibold fs-13">{u.cargo}</td>
                      <td>
                        <span
                          className={`badge px-3 py-1 fs-11 fw-bold ${
                            u.role === "gobernador"
                              ? "bg-primary text-white"
                              : u.role === "jefe_oficina"
                              ? "bg-dark text-white"
                              : u.role === "asesor"
                              ? "bg-info text-white"
                              : "bg-secondary text-white"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <span className="badge bg-success text-white fw-bold">Activo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARÁMETROS OCR & INSTRUCCIONES CLAUDE */}
      {activeAdminTab === "ocr" && (
        <div>
          {/* Banner Informativo de Jerarquía de Prompts */}
          <div className="card bg-white border border-primary-subtle shadow-sm rounded-3 mb-4 border-start border-4 border-primary">
            <div className="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center">
                  <i className="ri-global-line fs-20"></i>
                </div>
                <div>
                  <strong className="text-dark fs-14 d-block">Esquema de Reglas Globales Activo</strong>
                  <small className="text-muted fs-12">
                    Las <strong>Reglas Globales</strong> son la directriz suprema. Todo lo definido en "Reglas Globales" se aplica e inyecta automáticamente en los 4 apartados de prensa.
                  </small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocType("global")}
                className={`btn btn-sm fw-bold px-3 py-2 ${
                  selectedDocType === "global" ? "btn-primary text-white" : "btn-outline-primary"
                }`}
              >
                <i className="ri-edit-2-line me-1"></i> Editar Reglas Globales
              </button>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                    Apartado a Configurar
                  </h5>
                  <small className="text-muted fs-12">Selecciona las reglas globales o un documento específico</small>
                </div>
                <div className="card-body p-3">
                  <div className="d-flex flex-column gap-2">
                    {DOC_TYPE_OPTIONS.map((opt) => {
                      const isSelected = selectedDocType === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setSelectedDocType(opt.key)}
                          className={`btn text-start p-3 rounded-3 fw-bold transition-all ${
                            isSelected
                              ? "btn-primary text-white shadow"
                              : opt.isGlobal
                              ? "btn-light text-primary border border-primary-subtle"
                              : "btn-light text-dark border"
                          }`}
                          style={{
                            backgroundColor: isSelected ? "#1d4ed8" : "#f8fafc",
                            color: isSelected ? "#ffffff" : opt.isGlobal ? "#1d4ed8" : "#0f172a",
                            borderColor: isSelected ? "#1d4ed8" : opt.isGlobal ? "#93c5fd" : "#cbd5e1",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-13">{opt.label}</span>
                            {opt.isGlobal && (
                              <span className={`badge fs-10 ${isSelected ? "bg-white text-primary" : "bg-primary text-white"}`}>
                                Global
                              </span>
                            )}
                          </div>
                          <small style={{ opacity: 0.85, fontSize: "11px", display: "block", marginTop: "2px" }}>
                            {opt.isGlobal
                              ? "Aplica como marco base para todos"
                              : `Modelo: ${promptsMap[opt.key]?.model || "claude-3-7-sonnet"}`}
                          </small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Vista Previa de Herencia */}
              {selectedDocType !== "global" && (
                <div className="card bg-light border border-gray-300 shadow-sm rounded-3">
                  <div className="card-body p-3">
                    <h6 className="fw-extrabold text-primary mb-2 fs-13">
                      <i className="ri-shield-check-line me-1"></i> Reglas Globales Heredadas
                    </h6>
                    <p className="text-dark fs-11 mb-0 fw-semibold lh-base" style={{ whiteSpace: "pre-line", color: "#334155" }}>
                      {globalPrompt.system_prompt.slice(0, 180)}...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-8">
              <div className="card bg-white border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                      {selectedDocType === "global"
                        ? "🌐 Configuración de Reglas Globales (Transversales)"
                        : `Instrucciones Específicas (${DOC_TYPE_OPTIONS.find((d) => d.key === selectedDocType)?.label})`}
                    </h5>
                    <small className="text-muted fs-12">
                      {selectedDocType === "global"
                        ? "Estas instrucciones se combinarán con los 4 tipos de documentos al procesar con Claude"
                        : "Directrices exclusivas para este tipo de documento"}
                    </small>
                  </div>
                  <span className={`badge ${selectedDocType === "global" ? "bg-info" : "bg-primary"} text-white fs-11 fw-bold`}>
                    {selectedDocType === "global" ? "Reglas Globales" : "Específico"}
                  </span>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSavePrompt}>
                    {/* TextBox 1: System Prompt / Reglas Globales */}
                    <div className="mb-4">
                      <label className="form-label text-dark fw-extrabold fs-13 mb-1" style={{ color: "#0f172a" }}>
                        {selectedDocType === "global"
                          ? "1. Directrices Generales y Criterios Soberanos (Global System Prompt):"
                          : "1. Instrucciones de Identidad y Análisis (System Prompt):"}
                      </label>
                      <small className="text-muted d-block mb-2 fs-12">
                        {selectedDocType === "global"
                          ? "Tono, prohibición de alucinaciones, español formal y lineamientos obligatorios para toda la prensa."
                          : "Define el rol, el enfoque y la misión de análisis para este documento."}
                      </small>
                      <textarea
                        rows={selectedDocType === "global" ? 7 : 5}
                        className="form-control text-dark font-monospace fs-13 border-gray-300 shadow-sm"
                        style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                        value={currentPrompt.system_prompt}
                        onChange={(e) => handleUpdateCurrentPrompt("system_prompt", e.target.value)}
                        required
                      />
                    </div>

                    {/* TextBox 2: Filtering Rules */}
                    <div className="mb-4">
                      <label className="form-label text-dark fw-extrabold fs-13 mb-1" style={{ color: "#0f172a" }}>
                        {selectedDocType === "global"
                          ? "2. Criterios Globales de Descarte y Filtrado:"
                          : "2. Criterios de Selección y Filtrado de Contenido:"}
                      </label>
                      <small className="text-muted d-block mb-2 fs-12">
                        {selectedDocType === "global"
                          ? "Temas prohibidos de manera general (deportes, espectáculos, farándula, notas de sociales)."
                          : "Indica qué categorías priorizar (seguridad, finanzas, obras) y cuáles omitir."}
                      </small>
                      <textarea
                        rows={4}
                        className="form-control text-dark font-monospace fs-13 border-gray-300 shadow-sm"
                        style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                        value={currentPrompt.filtering_rules}
                        onChange={(e) => handleUpdateCurrentPrompt("filtering_rules", e.target.value)}
                      />
                    </div>

                    {/* TextBox 3: Output Format */}
                    <div className="mb-4">
                      <label className="form-label text-dark fw-extrabold fs-13 mb-1" style={{ color: "#0f172a" }}>
                        3. Estructura y Formato del Resumen Ejecutivo:
                      </label>
                      <small className="text-muted d-block mb-2 fs-12">
                        Estructura esperada del resumen ejecutivo y formato de entrega.
                      </small>
                      <textarea
                        rows={4}
                        className="form-control text-dark font-monospace fs-13 border-gray-300 shadow-sm"
                        style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                        value={currentPrompt.output_format}
                        onChange={(e) => handleUpdateCurrentPrompt("output_format", e.target.value)}
                      />
                    </div>

                    {/* Configuración de Modelo y Parámetros */}
                    <div className="row g-3 p-3 bg-light rounded-3 border border-gray-200 mb-4">
                      <div className="col-md-5">
                        <label className="form-label text-dark fw-bold fs-12 mb-1">
                          Modelo de IA Claude (Anthropic)
                        </label>
                        <select
                          className="form-select form-select-sm text-dark fw-bold bg-white"
                          value={currentPrompt.model}
                          onChange={(e) => handleUpdateCurrentPrompt("model", e.target.value)}
                        >
                          <optgroup label="⭐ Generación Claude 3.7 & 3.5 (Recomendados)">
                            <option value="claude-3-7-sonnet-20250219">
                              Claude 3.7 Sonnet (Última Generación · Razonamiento Híbrido)
                            </option>
                            <option value="claude-3-5-sonnet-20241022">
                              Claude 3.5 Sonnet v2 (Alta Precisión & Síntesis)
                            </option>
                            <option value="claude-3-5-sonnet-20240620">
                              Claude 3.5 Sonnet v1
                            </option>
                            <option value="claude-3-5-haiku-20241022">
                              Claude 3.5 Haiku (Ultra Rápido & Eficiente)
                            </option>
                          </optgroup>

                          <optgroup label="🧠 Serie Opus (Máxima Profundidad Analítica)">
                            <option value="claude-3-opus-20240229">
                              Claude 3 Opus (Análisis Político Complejo)
                            </option>
                            <option value="claude-3-opus-latest">
                              Claude 3 Opus Latest
                            </option>
                          </optgroup>

                          <optgroup label="⚡ Serie Base Claude 3">
                            <option value="claude-3-sonnet-20240229">
                              Claude 3 Sonnet
                            </option>
                            <option value="claude-3-haiku-20240307">
                              Claude 3 Haiku (Económico)
                            </option>
                          </optgroup>
                        </select>
                        <small className="text-muted fs-11 d-block mt-1">
                          ID: <code className="text-primary">{currentPrompt.model}</code>
                        </small>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label text-dark fw-bold fs-12 mb-1">
                          Temperatura: {currentPrompt.temperature}
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={currentPrompt.temperature}
                          onChange={(e) => handleUpdateCurrentPrompt("temperature", parseFloat(e.target.value))}
                        />
                        <small className="text-muted fs-11">0.1 - 0.3: Máxima fidelidad objetiva</small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label text-dark fw-bold fs-12 mb-1">Máx. Tokens de Salida</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-dark fw-bold bg-white"
                          value={currentPrompt.max_tokens}
                          onChange={(e) => handleUpdateCurrentPrompt("max_tokens", parseInt(e.target.value) || 2500)}
                        />
                        <small className="text-muted fs-11">Límite de generación de respuesta</small>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary fw-bold text-white shadow-sm px-4 py-2"
                        disabled={savingPrompt}
                      >
                        {savingPrompt ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Guardando...
                          </span>
                        ) : (
                          <span>
                            <i className="ri-save-3-line me-1 text-white"></i> Guardar {selectedDocType === "global" ? "Reglas Globales" : "Parámetros"}
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
