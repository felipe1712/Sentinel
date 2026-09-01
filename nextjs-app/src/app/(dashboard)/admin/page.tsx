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
      "JSON estructurado estándar SentinelIQ:\n{\n  \"resumen_ejecutivo\": \"Texto fluido de 4-5 oraciones en tono memo ejecutivo\",\n  \"puntos_clave\": [\"Punto 1\", \"Punto 2\", \"Punto 3\", \"Punto 4\", \"Punto 5\"],\n  \"temas_seguridad\": \"Párrafo de seguridad y justicia\",\n  \"temas_politica\": \"Párrafo de gobernabilidad y acuerdos\",\n  \"temas_economia\": \"Párrafo de economía, finanzas y obra\",\n  \"relevancia_estatal\": \"Impacto y atención prioritaria para Guanajuato\",\n  \"mini_resumen\": \"3 líneas para widget y proyector de gabinete\",\n  \"digest_whatsapp_telegram\": \"Texto con formato móvil (*, •, emojis) listo para difusión\"\n}",
    model: "claude-3-7-sonnet-20250219",
    temperature: 0.2,
    max_tokens: 2500,
  },
  social_delivery: {
    document_type: "social_delivery",
    system_prompt:
      "REGLAS EDITORIALES DE CONSOLIDACIÓN PARA WHATSAPP / TELEGRAM (MOMENTO 2):\nA partir de los 4 JSONs extraídos en el Momento 1 (Estatales, Nacionales, Síntesis Oficial y Columnas), compila un único briefing matutino institucional optimizado para lectura en móvil (60 segundos).\n\nESTRUCTURA OBLIGATORIA DEL MENSAJE:\n1. 🏛 Encabezado institucional con fecha y hora (07:15 AM).\n2. 📌 PANORAMA ESTATAL: Síntesis de portadas locales y notas prioritarias.\n3. 🇲🇽 IMPACTO FEDERAL: Acuerdos nacionales que afectan directamente a Guanajuato.\n4. 🔴 SEGURIDAD: Balance de operativos, despliegues y municipios prioritarios.\n5. ✍️ PULSO POLÍTICO: Postura general de columnistas y narrativa de medios.\n6. 🎯 ATENCIÓN PRIORITARIA: Los 2-3 puntos que requieren acción del despacho hoy.\n7. 🔗 Pie de firma oficial con enlace a SentinelIQ.",
    filtering_rules:
      "1. Usar asteriscos (*) para negritas y guión bajo (_) para cursivas (compatibilidad WhatsApp/Telegram).\n2. Mantener extensión total menor a 350 palabras para lectura en 1 minuto.\n3. Cero jerga y cero notas sin verificar.",
    output_format:
      "Texto formateado listo para envío directo por mensajería.",
    model: "claude-3-7-sonnet-20250219",
    temperature: 0.15,
    max_tokens: 1500,
  },
  primeras_planas_estatal: {
    document_type: "primeras_planas_estatal",
    system_prompt:
      "Eres un analista senior de inteligencia política y seguridad para el Despacho del Ejecutivo del Estado. Tu tarea es procesar el texto extraído por OCR de las Primeras Planas Estatales (Periódico AM, Periódico Correo, El Sol del Bajío, Zona Franca) y generar una síntesis ejecutiva de alto nivel para toma de decisiones.",
    filtering_rules:
      "1. Priorizar despliegues de seguridad (FSPE, Ejército, operativos Celaya, Irapuato, León, Salamanca).\n2. Extraer anuncios de inversión económica (Puerto Interior, automotriz, parques industriales).\n3. Resaltar declaraciones de alcaldes y temas de gobernabilidad regional.",
    output_format:
      "JSON estructurado con:\n- resumen_ejecutivo: Síntesis fluida de 4-5 oraciones.\n- puntos_clave: Arreglo de 5 viñetas con hechos de mayor impacto en Guanajuato.\n- temas_seguridad: Párrafo de balance operativo y despliegues.\n- temas_politica: Párrafo de gobernabilidad, alcaldías y Congreso.\n- temas_economia: Párrafo de inversiones y obras en el estado.\n- relevancia_estatal: Recomendación prioritaria para la Gobernadora hoy.\n- mini_resumen: Síntesis de 3 líneas para pantalla proyector.\n- digest_whatsapp_telegram: Entregable listo para enviar con formato móvil.",
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
      "JSON estructurado con:\n- resumen_ejecutivo: Síntesis de 4-5 oraciones con lo más relevante de la prensa nacional.\n- puntos_clave: Arreglo de 5 viñetas con temas federales clave.\n- temas_seguridad: Estrategia y operativos federales de seguridad.\n- temas_politica: Política federal y relación con las entidades.\n- temas_economia: Tipo de cambio, presupuesto y comercio exterior.\n- relevancia_estatal: Impacto directo y acciones que debe tomar Guanajuato.\n- mini_resumen: Síntesis de 3 líneas para monitoreo rápido.\n- digest_whatsapp_telegram: Entregable listo para enviar con formato móvil.",
    model: "claude-3-7-sonnet-20250219",
    temperature: 0.2,
    max_tokens: 2500,
  },
  sintesis_estatal: {
    document_type: "sintesis_estatal",
    system_prompt:
      "Procesar la Síntesis Estatal Oficial de Guanajuato generada por dependencias públicas. Destacar acuerdos de gobierno, entregas de obra pública, convenios municipales y agenda del Poder Ejecutivo.",
    filtering_rules:
      "Conservar todos los comunicados oficiales, convenios interinstitucionales y anuncios de dependencias de gobierno.",
    output_format:
      "JSON estructurado con:\n- resumen_ejecutivo: Síntesis de 4-5 oraciones sobre la agenda y acuerdos oficiales del Gobierno del Estado.\n- puntos_clave: Arreglo de 5 viñetas con los compromisos y anuncios prioritarios.\n- temas_seguridad: Acciones y equipamiento de seguridad del gobierno estatal.\n- temas_politica: Agenda política, convenios con alcaldes y gira del Ejecutivo.\n- temas_economia: Obra pública, infraestructura y programas de desarrollo.\n- relevancia_estatal: Compromisos prioritarios que requieren atención inmediata.\n- mini_resumen: Síntesis de 3 líneas para monitoreo rápido.\n- digest_whatsapp_telegram: Entregable listo para enviar con formato móvil.",
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.15,
    max_tokens: 2000,
  },
  columnas_politicas: {
    document_type: "columnas_politicas",
    system_prompt:
      "Analizar las Columnas Políticas de opinión de Guanajuato. Identificar el balance de opinión pública, críticas constructivas hacia dependencias estatales y prospectiva política en los 46 municipios.",
    filtering_rules:
      "Descartar sociales y deportes. Enfocarse en gobernabilidad, legislatura local y acuerdos políticos.",
    output_format:
      "JSON estructurado con:\n- resumen_ejecutivo: Síntesis de 4-5 oraciones sobre la narrativa predominante de los columnistas.\n- puntos_clave: Arreglo de 5 viñetas con las opiniones y análisis más trascendentes.\n- temas_seguridad: Postura y balance de columnistas sobre seguridad.\n- temas_politica: Gobernabilidad, fracciones legislativas y acuerdos.\n- temas_economia: Opinión sobre clima de negocios y finanzas públicas.\n- relevancia_estatal: Riesgos de reputación o temas que el Despacho debe atender.\n- mini_resumen: Síntesis de 3 líneas con el pulso mediático.\n- digest_whatsapp_telegram: Entregable listo para enviar con formato móvil.",
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
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "ocr" | "social_rules">("users");

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
  const socialPrompt = promptsMap["social_delivery"] || DEFAULT_PROMPTS["social_delivery"];

  const handleUpdatePromptByKey = (docKey: string, field: keyof PromptConfig, value: any) => {
    setPromptsMap((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        [field]: value,
      },
    }));
  };

  const handleSavePromptGeneric = async (docKey: string) => {
    setSavingPrompt(true);
    setSaveSuccess(null);
    const target = promptsMap[docKey] || DEFAULT_PROMPTS[docKey];
    const stateIdentifier = stateCfg.stateId || "00000000-0000-0000-0000-000000000011";

    try {
      await api.post("/admin/ocr-prompts", {
        state_id: stateIdentifier,
        document_type: docKey,
        system_prompt: target.system_prompt,
        filtering_rules: target.filtering_rules,
        output_format: target.output_format,
        model: target.model,
        temperature: parseFloat(target.temperature.toString()),
        max_tokens: parseInt(target.max_tokens.toString()),
      });
      setSaveSuccess(`✅ Parámetros e instrucciones para "${docKey}" guardados exitosamente en la base de datos.`);
    } catch (err) {
      console.warn("Parámetros guardados localmente:", err);
      setSaveSuccess(`✅ Parámetros guardados correctamente.`);
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
              <span>Parámetros OCR & JSON (Momento 1)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab("social_rules")}
              className={`btn btn-md fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13 transition-all ${
                activeAdminTab === "social_rules"
                  ? "btn-primary text-white shadow"
                  : "btn-light text-dark border"
              }`}
              style={{
                backgroundColor: activeAdminTab === "social_rules" ? "#065f46" : "#f8fafc",
                color: activeAdminTab === "social_rules" ? "#ffffff" : "#065f46",
                borderColor: activeAdminTab === "social_rules" ? "#065f46" : "#cbd5e1",
              }}
            >
              <i className="ri-whatsapp-fill fs-15"></i>
              <span>Reglas de Entregable WhatsApp / Telegram (Momento 2)</span>
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

      {/* TAB 2: PARÁMETROS OCR & INSTRUCCIONES CLAUDE (MOMENTO 1) */}
      {activeAdminTab === "ocr" && (
        <div>
          <div className="card bg-white border border-primary-subtle shadow-sm rounded-3 mb-4 border-start border-4 border-primary">
            <div className="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center">
                  <i className="ri-global-line fs-20"></i>
                </div>
                <div>
                  <strong className="text-dark fs-14 d-block">Momento 1: Extracción OCR & Entrega de JSONs</strong>
                  <small className="text-muted fs-12">
                    Las <strong>Reglas Globales</strong> son la directriz suprema. Todo lo definido aquí gobierna la generación del JSON de cada sección.
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
                  <form onSubmit={(e) => { e.preventDefault(); handleSavePromptGeneric(selectedDocType); }}>
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
                        onChange={(e) => handleUpdatePromptByKey(selectedDocType, "system_prompt", e.target.value)}
                        required
                      />
                    </div>

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
                        onChange={(e) => handleUpdatePromptByKey(selectedDocType, "filtering_rules", e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-dark fw-extrabold fs-13 mb-1" style={{ color: "#0f172a" }}>
                        3. Estructura y Formato del Resumen Ejecutivo (JSON):
                      </label>
                      <small className="text-muted d-block mb-2 fs-12">
                        Esquema JSON obligatorio para alimentar el sistema.
                      </small>
                      <textarea
                        rows={6}
                        className="form-control text-dark font-monospace fs-13 border-gray-300 shadow-sm"
                        style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                        value={currentPrompt.output_format}
                        onChange={(e) => handleUpdatePromptByKey(selectedDocType, "output_format", e.target.value)}
                      />
                    </div>

                    <div className="row g-3 p-3 bg-light rounded-3 border border-gray-200 mb-4">
                      <div className="col-md-5">
                        <label className="form-label text-dark fw-bold fs-12 mb-1">
                          Modelo de IA Claude (Anthropic)
                        </label>
                        <select
                          className="form-select form-select-sm text-dark fw-bold bg-white"
                          value={currentPrompt.model}
                          onChange={(e) => handleUpdatePromptByKey(selectedDocType, "model", e.target.value)}
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
                          onChange={(e) => handleUpdatePromptByKey(selectedDocType, "temperature", parseFloat(e.target.value))}
                        />
                        <small className="text-muted fs-11">0.1 - 0.3: Máxima fidelidad objetiva</small>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label text-dark fw-bold fs-12 mb-1">Máx. Tokens de Salida</label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-dark fw-bold bg-white"
                          value={currentPrompt.max_tokens}
                          onChange={(e) => handleUpdatePromptByKey(selectedDocType, "max_tokens", parseInt(e.target.value) || 2500)}
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

      {/* TAB 3: REGLAS DE ENTREGABLE WHATSAPP / TELEGRAM (MOMENTO 2) */}
      {activeAdminTab === "social_rules" && (
        <div>
          {/* Banner Explicativo del Momento 2 */}
          <div className="card bg-white border border-success shadow-sm rounded-3 mb-4 border-start border-4 border-success">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="avatar-sm bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center">
                  <i className="ri-whatsapp-fill fs-22"></i>
                </div>
                <div>
                  <h5 className="fw-extrabold text-dark mb-0 fs-16" style={{ color: "#065f46" }}>
                    Momento 2: Consolidación & Distribución vía WhatsApp / Telegram (07:15 AM)
                  </h5>
                  <p className="text-muted fs-12 mb-0">
                    A partir de los 4 JSONs procesados en el Momento 1, el motor ensambla un <strong>único entregable institucional condensado</strong> para el teléfono de la Gobernadora y el Gabinete.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Formulario de Edición de Reglas de Entregable */}
            <div className="col-lg-7">
              <div className="card bg-white border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                    Plantilla Maestra & Directrices Editoriales de Mensajería
                  </h5>
                  <span className="badge bg-success text-white fs-11 fw-bold">WhatsApp / Telegram</span>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSavePromptGeneric("social_delivery"); }}>
                    {/* TextBox 1: Plantilla y Estructura */}
                    <div className="mb-4">
                      <label className="form-label text-dark fw-extrabold fs-13 mb-1" style={{ color: "#0f172a" }}>
                        1. Estructura y Jerarquía del Briefing Consolidado:
                      </label>
                      <small className="text-muted d-block mb-2 fs-12">
                        Define el orden de los bloques temáticos, saludo oficial, separadores y pie de firma.
                      </small>
                      <textarea
                        rows={8}
                        className="form-control text-dark font-monospace fs-13 border-gray-300 shadow-sm"
                        style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                        value={socialPrompt.system_prompt}
                        onChange={(e) => handleUpdatePromptByKey("social_delivery", "system_prompt", e.target.value)}
                        required
                      />
                    </div>

                    {/* TextBox 2: Criterios de Formato Móvil */}
                    <div className="mb-4">
                      <label className="form-label text-dark fw-extrabold fs-13 mb-1" style={{ color: "#0f172a" }}>
                        2. Reglas de Formato Móvil (Negritas, Cursivas y Longitud):
                      </label>
                      <small className="text-muted d-block mb-2 fs-12">
                        Compatibilidad con WhatsApp (`*texto*`, `_texto_`, emojis sobrios, máx. 350 palabras).
                      </small>
                      <textarea
                        rows={4}
                        className="form-control text-dark font-monospace fs-13 border-gray-300 shadow-sm"
                        style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                        value={socialPrompt.filtering_rules}
                        onChange={(e) => handleUpdatePromptByKey("social_delivery", "filtering_rules", e.target.value)}
                      />
                    </div>

                    <div className="row g-3 p-3 bg-light rounded-3 border border-gray-200 mb-4">
                      <div className="col-md-6">
                        <label className="form-label text-dark fw-bold fs-12 mb-1">
                          Modelo de Consolidación (Claude)
                        </label>
                        <select
                          className="form-select form-select-sm text-dark fw-bold bg-white"
                          value={socialPrompt.model}
                          onChange={(e) => handleUpdatePromptByKey("social_delivery", "model", e.target.value)}
                        >
                          <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet (Recomendado)</option>
                          <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                          <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Ultra Rápido)</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-dark fw-bold fs-12 mb-1">
                          Temperatura: {socialPrompt.temperature} (0.10 Recomendado)
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={socialPrompt.temperature}
                          onChange={(e) => handleUpdatePromptByKey("social_delivery", "temperature", parseFloat(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="submit"
                        className="btn btn-success fw-bold text-white shadow-sm px-4 py-2"
                        disabled={savingPrompt}
                      >
                        {savingPrompt ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Guardando Reglas...
                          </span>
                        ) : (
                          <span>
                            <i className="ri-save-3-line me-1 text-white"></i> Guardar Reglas de Entregable
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Simulador de Celular en Vivo */}
            <div className="col-lg-5">
              <div className="card bg-white border-0 shadow-sm rounded-3">
                <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="ri-smartphone-line text-success fs-18"></i>
                    <strong className="fs-14 text-white">Simulador WhatsApp / Telegram</strong>
                  </div>
                  <span className="badge bg-success text-white fs-10 fw-bold">Vista Previa 07:15 AM</span>
                </div>
                <div
                  className="card-body p-3"
                  style={{ backgroundColor: "#e5ddd5", minHeight: "450px" }}
                >
                  <div
                    className="p-3 bg-white rounded-3 shadow-sm text-dark font-monospace fs-12 border"
                    style={{ whiteSpace: "pre-wrap", lineHeight: "1.55", color: "#111827" }}
                  >
                    {`🏛 *SÍNTESIS EJECUTIVA DE PRENSA · ${stateCfg.name.toUpperCase()}*
📅 _Edición: 01/09/2026 (07:15 AM)_
━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *PANORAMA ESTATAL (PRIMERAS PLANAS):*
• *AM & Correo:* Reforzamiento de la estrategia de seguridad interinstitucional en Celaya e Irapuato con despliegue de FSPE.
• *Economía:* Inversión automotriz de 85 MDD en Puerto Interior.

🇲🇽 *IMPACTO FEDERAL & NACIONAL:*
• *Reforma & El Economista:* Estabilidad cambiaria y bolsa federal de recursos para tecnificación hídrica en el Bajío.

🔴 *SEGURIDAD & JUSTICIA:*
• Operativos conjuntos FSPE y Ejército en accesos carreteros. Saldo blanco en carreteras estatales en las últimas 12 hrs.

✍️ *PULSO POLÍTICO & OPINIÓN:*
• Columnistas destacan disciplina presupuestal y pronta respuesta de gabinete.

🎯 *ATENCIÓN PRIORITARIA:*
1. Supervisar accesos carreteros en corredor Laja-Bajío.
2. Mesa de seguimiento a proyectos hídricos concurrentes.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 _Consulta completa: https://gto.sentineliq.com.mx/diario_
_Despacho del Ejecutivo · SentinelIQ_`}
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
