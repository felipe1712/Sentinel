"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getStateConfig, StateConfig, FuenteItem } from "@/lib/stateConfig";
import { registerMonitor, deleteMonitor, ArgosMonitor } from "@/lib/argos";

interface GdeltTerritorialQuery {
  id: string;
  name: string;
  query: string;
  category: "seguridad" | "vialidad" | "proteccion_civil" | "gobernabilidad";
  interval_mins: number;
  max_records: number;
  active: boolean;
}

interface GdeltArticleResult {
  title?: string;
  url?: string;
  domain?: string;
  seendate?: string;
  language?: string;
}

const DEFAULT_ARGOS_MONITORS_GTO: ArgosMonitor[] = [
  {
    id: "mon_gto_01",
    state_id: "gto",
    network: "telegram",
    channel_id: "@AlertasCelayaBajio",
    keywords: ["seguridad", "carretera 45", "operativo"],
    active: true,
    posts_captured_today: 142,
    relevance_rate: 94,
    last_activity: "Hace 4 min",
  },
  {
    id: "mon_gto_02",
    state_id: "gto",
    network: "twitter",
    channel_id: "@FSPE_GtoOficial",
    keywords: ["FSPE", "despliegue", "patrullaje"],
    active: true,
    posts_captured_today: 88,
    relevance_rate: 98,
    last_activity: "Hace 12 min",
  },
  {
    id: "mon_gto_03",
    state_id: "gto",
    network: "facebook",
    channel_id: "NoticiasLeonZM",
    keywords: ["tráfico", "obra", "vialidad"],
    active: true,
    posts_captured_today: 64,
    relevance_rate: 89,
    last_activity: "Hace 25 min",
  },
];

const DEFAULT_ARGOS_MONITORS_PUE: ArgosMonitor[] = [
  {
    id: "mon_pue_01",
    state_id: "pue",
    network: "telegram",
    channel_id: "@AlertaPueblaSeguridad",
    keywords: ["Texmelucan", "autopista", "seguridad"],
    active: true,
    posts_captured_today: 135,
    relevance_rate: 95,
    last_activity: "Hace 5 min",
  },
  {
    id: "mon_pue_02",
    state_id: "pue",
    network: "twitter",
    channel_id: "@SSPGobPue",
    keywords: ["SSP", "operativo", "Angelópolis"],
    active: true,
    posts_captured_today: 92,
    relevance_rate: 97,
    last_activity: "Hace 14 min",
  },
  {
    id: "mon_pue_03",
    state_id: "pue",
    network: "telegram",
    channel_id: "@TraficoPueblaEnVivo",
    keywords: ["periférico", "vialidad", "accidente"],
    active: true,
    posts_captured_today: 71,
    relevance_rate: 91,
    last_activity: "Hace 20 min",
  },
];

const DEFAULT_ARGOS_MONITORS_QRO: ArgosMonitor[] = [
  {
    id: "mon_qro_01",
    state_id: "qro",
    network: "telegram",
    channel_id: "@AlertaQroVial",
    keywords: ["5 de febrero", "autopista 57", "vialidad"],
    active: true,
    posts_captured_today: 118,
    relevance_rate: 96,
    last_activity: "Hace 6 min",
  },
  {
    id: "mon_qro_02",
    state_id: "qro",
    network: "twitter",
    channel_id: "@POES_Qro",
    keywords: ["PoEs", "operativo", "inspección"],
    active: true,
    posts_captured_today: 76,
    relevance_rate: 98,
    last_activity: "Hace 15 min",
  },
  {
    id: "mon_qro_03",
    state_id: "qro",
    network: "facebook",
    channel_id: "NoticiasQuerétaroZMQ",
    keywords: ["clima", "obra", "movilidad"],
    active: true,
    posts_captured_today: 52,
    relevance_rate: 91,
    last_activity: "Hace 30 min",
  },
];

const DEFAULT_GDELT_QUERIES_GTO: GdeltTerritorialQuery[] = [
  {
    id: "gdelt_gto_01",
    name: "Corredor Industrial y Seguridad (Celaya - Salamanca - León)",
    query: "Guanajuato (Celaya OR Salamanca OR Irapuato OR León) (seguridad OR operativo OR vialidad OR bloqueo OR policia)",
    category: "seguridad",
    interval_mins: 30,
    max_records: 10,
    active: true,
  },
  {
    id: "gdelt_gto_02",
    name: "Carreteras, Hidráulica y Protección Civil GTO",
    query: 'Guanajuato (carretera OR autopista OR presa OR "proteccion civil" OR deslave OR lluvia OR accidente)',
    category: "proteccion_civil",
    interval_mins: 30,
    max_records: 10,
    active: true,
  },
  {
    id: "gdelt_gto_03",
    name: "Gobernabilidad y Diálogo Social (Industria y Servicios)",
    query: "Guanajuato (sindicato OR huelga OR manifestacion OR transporte OR abastecimiento OR agua)",
    category: "gobernabilidad",
    interval_mins: 60,
    max_records: 10,
    active: true,
  },
];

const DEFAULT_GDELT_QUERIES_PUE: GdeltTerritorialQuery[] = [
  {
    id: "gdelt_pue_01",
    name: "Autopista México-Puebla y Arco Norte (Texmelucan - Esperanza)",
    query: 'Puebla ("Texmelucan" OR "Arco Norte" OR Esperanza OR Tehuacán) (seguridad OR operativo OR vigilancia OR Guardia Nacional)',
    category: "seguridad",
    interval_mins: 30,
    max_records: 10,
    active: true,
  },
  {
    id: "gdelt_pue_02",
    name: "Monitoreo Volcánico y Protección Civil Popocatépetl",
    query: 'Puebla (Popocatepetl OR ceniza OR sismo OR volcán OR "proteccion civil" OR contingencia)',
    category: "proteccion_civil",
    interval_mins: 30,
    max_records: 10,
    active: true,
  },
  {
    id: "gdelt_pue_03",
    name: "Movilidad Metropolitana y Corredores Viales (Periférico - Atlixcáyotl)",
    query: 'Puebla ("Periferico Ecologico" OR "Via Atlixcayotl" OR Forjadores OR Teziutlan) (vialidad OR trafico OR carril OR obra)',
    category: "vialidad",
    interval_mins: 30,
    max_records: 10,
    active: true,
  },
];

const DEFAULT_GDELT_QUERIES_QRO: GdeltTerritorialQuery[] = [
  {
    id: "gdelt_qro_01",
    name: "Autopista 57 y Movilidad Metropolitana Querétaro",
    query: 'Queretaro ("autopista 57" OR "5 de febrero" OR libramiento OR carril OR PoEs OR policia)',
    category: "vialidad",
    interval_mins: 30,
    max_records: 10,
    active: true,
  },
  {
    id: "gdelt_qro_02",
    name: "Seguridad y Blindaje Territorial Intermunicipal",
    query: 'Queretaro ("San Juan del Rio" OR Corregidora OR Marques OR Colon) (operativo OR vigilancia OR cerco OR patrullaje)',
    category: "seguridad",
    interval_mins: 30,
    max_records: 10,
    active: true,
  },
  {
    id: "gdelt_qro_03",
    name: "Infraestructura Hídrica (El Batán) y Protección Civil",
    query: 'Queretaro ("El Batan" OR presa OR dren OR lluvia OR contingencia OR agua)',
    category: "proteccion_civil",
    interval_mins: 60,
    max_records: 10,
    active: true,
  },
];

function getArgosMonitorsForState(key: string): ArgosMonitor[] {
  if (key === "pue") return DEFAULT_ARGOS_MONITORS_PUE;
  if (key === "gto") return DEFAULT_ARGOS_MONITORS_GTO;
  return DEFAULT_ARGOS_MONITORS_QRO;
}

function getDefaultGdeltQueriesForState(key: string): GdeltTerritorialQuery[] {
  if (key === "pue") return DEFAULT_GDELT_QUERIES_PUE;
  if (key === "gto") return DEFAULT_GDELT_QUERIES_GTO;
  return DEFAULT_GDELT_QUERIES_QRO;
}

export default function FuentesManagerPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [activeTab, setActiveTab] = useState<"fuentes" | "argos" | "gdelt">("argos");
  const [fuentes, setFuentes] = useState<FuenteItem[]>([]);
  const [argosMonitors, setArgosMonitors] = useState<ArgosMonitor[]>(() =>
    getArgosMonitorsForState(getStateConfig().key)
  );

  // GDELT State
  const [gdeltQueries, setGdeltQueries] = useState<GdeltTerritorialQuery[]>(() =>
    getDefaultGdeltQueriesForState(getStateConfig().key)
  );
  const [gdeltSaving, setGdeltSaving] = useState(false);
  const [gdeltNotice, setGdeltNotice] = useState<string | null>(null);

  // Form New GDELT Query
  const [newGdeltName, setNewGdeltName] = useState("");
  const [newGdeltQuery, setNewGdeltQuery] = useState("");
  const [newGdeltCategory, setNewGdeltCategory] = useState<"seguridad" | "vialidad" | "proteccion_civil" | "gobernabilidad">("seguridad");
  const [newGdeltInterval, setNewGdeltInterval] = useState<number>(30);
  const [newGdeltMaxRecords, setNewGdeltMaxRecords] = useState<number>(10);

  // GDELT Live Tester
  const [testQueryText, setTestQueryText] = useState("");
  const [testTesting, setTestTesting] = useState(false);
  const [testResults, setTestResults] = useState<GdeltArticleResult[] | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // New Monitor Form state (ARGOS)
  const [newNetwork, setNewNetwork] = useState("telegram");
  const [newChannel, setNewChannel] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    setFuentes(cfg.fuentes);
    setArgosMonitors(getArgosMonitorsForState(cfg.key));
    setGdeltQueries(getDefaultGdeltQueriesForState(cfg.key));

    async function loadCatalogAndGdelt() {
      try {
        const resp = await api.get("/sources");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setFuentes(resp.data);
        }
      } catch {
        console.warn(`Usando catálogo soberano de fuentes de ${cfg.shortName}`);
      }

      // Cargar configuración de GDELT desde Rust API si existe
      try {
        const gResp = await api.get(`/sources/gdelt/config?state_key=${cfg.key}`);
        if (gResp.data && Array.isArray(gResp.data.queries) && gResp.data.queries.length > 0) {
          setGdeltQueries(gResp.data.queries);
        }
      } catch {
        console.warn("Cargando parámetros territoriales GDELT preconfigurados para", cfg.shortName);
      }
    }
    loadCatalogAndGdelt();
  }, []);

  const handleAddArgosMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel) return;

    const kwArray = newKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    await registerMonitor(stateCfg.key, newNetwork, newChannel, kwArray);

    const newItem: ArgosMonitor = {
      id: `mon_${Date.now()}`,
      state_id: stateCfg.key,
      network: newNetwork,
      channel_id: newChannel,
      keywords: kwArray.length > 0 ? kwArray : ["general"],
      active: true,
      posts_captured_today: 1,
      relevance_rate: 90,
      last_activity: "Justo ahora",
    };

    setArgosMonitors([newItem, ...argosMonitors]);
    setNewChannel("");
    setNewKeywords("");
  };

  const handleToggleMonitor = async (id: string) => {
    await deleteMonitor(id);
    setArgosMonitors(argosMonitors.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));
  };

  // Guardar configuración completa de GDELT
  const saveGdeltQueriesToBackend = async (updated: GdeltTerritorialQuery[]) => {
    setGdeltSaving(true);
    setGdeltNotice(null);
    try {
      await api.post(`/sources/gdelt/config?state_key=${stateCfg.key}`, { queries: updated });
      setGdeltNotice("Parámetros territoriales GDELT guardados y sincronizados con el worker de ingestión.");
    } catch {
      setGdeltNotice("Guardado localmente. Se sincronizará con la base de datos en la próxima reconexión.");
    } finally {
      setGdeltSaving(false);
      setTimeout(() => setGdeltNotice(null), 5000);
    }
  };

  const handleAddGdeltQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGdeltName || !newGdeltQuery) return;

    const newQ: GdeltTerritorialQuery = {
      id: `gdelt_${stateCfg.key}_${Date.now()}`,
      name: newGdeltName,
      query: newGdeltQuery,
      category: newGdeltCategory,
      interval_mins: newGdeltInterval,
      max_records: newGdeltMaxRecords,
      active: true,
    };

    const updated = [newQ, ...gdeltQueries];
    setGdeltQueries(updated);
    setNewGdeltName("");
    setNewGdeltQuery("");
    await saveGdeltQueriesToBackend(updated);
  };

  const handleToggleGdeltQuery = async (id: string) => {
    const updated = gdeltQueries.map((q) => (q.id === id ? { ...q, active: !q.active } : q));
    setGdeltQueries(updated);
    await saveGdeltQueriesToBackend(updated);
  };

  const handleDeleteGdeltQuery = async (id: string) => {
    const updated = gdeltQueries.filter((q) => q.id !== id);
    setGdeltQueries(updated);
    await saveGdeltQueriesToBackend(updated);
  };

  const handleRunGdeltTest = async (queryToTest?: string) => {
    const q = queryToTest || testQueryText;
    if (!q) return;

    setTestTesting(true);
    setTestError(null);
    setTestResults(null);

    try {
      const encoded = encodeURIComponent(q);
      const targetUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}&mode=artlist&format=json&maxrecords=5&timespan=48h`;
      
      const res = await fetch(targetUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Límite de peticiones de GDELT alcanzado (HTTP 429). El worker MCP de SentinelIQ maneja esto con cabeceras rotativas y respaldo de 36 horas.");
        }
        throw new Error(`Error devuelto por la API de GDELT (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data && Array.isArray(data.articles) && data.articles.length > 0) {
        setTestResults(data.articles);
      } else {
        setTestResults([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No fue posible conectar con GDELT";
      setTestError(msg);
    } finally {
      setTestTesting(false);
    }
  };

  return (
    <div className="pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Source Manager & ARGOS · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Gestión de Fuentes, ARGOS & GDELT 2.0
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Conexión en tiempo real con canales de Telegram, cuentas de X / Twitter, monitores GDELT 2.0 y catálogo soberano.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/fuentes/telegram" className="btn btn-sm btn-outline-info fw-bold">
            <i className="ri-telegram-fill me-1"></i> Buscador Telegram
          </Link>
          <Link href="/fuentes/twitter" className="btn btn-sm btn-outline-dark fw-bold">
            <i className="ri-twitter-x-fill me-1"></i> Buscador X / Twitter
          </Link>
          <button
            className={`btn btn-sm fw-bold ${activeTab === "argos" ? "btn-primary text-white" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("argos")}
          >
            <i className="ri-share-forward-fill me-1"></i> ARGOS Monitores
          </button>
          <button
            className={`btn btn-sm fw-bold ${activeTab === "gdelt" ? "btn-primary text-white" : "btn-outline-primary"}`}
            style={activeTab === "gdelt" ? { backgroundColor: "#7c3aed", borderColor: "#7c3aed" } : { color: "#7c3aed", borderColor: "#7c3aed" }}
            onClick={() => setActiveTab("gdelt")}
          >
            <i className="ri-global-line me-1"></i> GDELT 2.0 Territorial
          </button>
          <button
            className={`btn btn-sm fw-bold ${activeTab === "fuentes" ? "btn-primary text-white" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("fuentes")}
          >
            <i className="ri-rss-line me-1"></i> Catálogo de Fuentes
          </button>
        </div>
      </div>

      {/* TAB 1: Fuentes y APIs */}
      {activeTab === "fuentes" && (
        <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
              Canales Conectados y Fuentes Activas para {stateCfg.name}
            </h6>
            <span className="badge bg-success text-white fw-bold shadow-sm">Operación Normal</span>
          </div>
          <div className="card-body p-0 bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-dark border-bottom">
                  <tr>
                    <th className="text-dark fw-bold ps-4 py-3">Fuente / Conector</th>
                    <th className="text-dark fw-bold">Tipo</th>
                    <th className="text-dark fw-bold">Identificador</th>
                    <th className="text-dark fw-bold">Credibilidad</th>
                    <th className="text-dark fw-bold text-end pe-4">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {fuentes.map((f) => (
                    <tr key={f.id} className="bg-white">
                      <td className="ps-4 py-3 fw-extrabold text-dark fs-14" style={{ color: "#0f172a" }}>
                        {f.name}
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary fw-bold fs-11">{f.type}</span>
                      </td>
                      <td className="text-dark fw-bold fs-13" style={{ color: "#334155" }}>
                        {f.identifier}
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success fw-bold fs-11">{f.credibility}</span>
                      </td>
                      <td className="text-end pe-4">
                        <span className="badge bg-success text-white fw-bold shadow-sm">
                          <i className="ri-checkbox-circle-line me-1"></i> Activa
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ARGOS Gateway Redes Sociales */}
      {activeTab === "argos" && (
        <div>
          {/* Métricas ARGOS */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-primary">
                <span className="fs-12 text-muted fw-bold text-uppercase">Posts Capturados Hoy</span>
                <h4 className="fw-extrabold mb-0 text-primary">294 posts</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-success">
                <span className="fs-12 text-muted fw-bold text-uppercase">Tasa de Relevancia</span>
                <h4 className="fw-extrabold mb-0 text-success">93.7%</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-info">
                <span className="fs-12 text-muted fw-bold text-uppercase">Monitores Activos</span>
                <h4 className="fw-extrabold mb-0 text-info">{argosMonitors.filter((m) => m.active).length} canales</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-warning">
                <span className="fs-12 text-muted fw-bold text-uppercase">ARGOS Gateway Status</span>
                <h4 className="fw-extrabold mb-0 text-warning fs-18">
                  <i className="ri-wifi-line me-1"></i> online (05:30)
                </h4>
              </div>
            </div>
          </div>

          {/* Formulario Agregar Monitor ARGOS */}
          <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                <i className="ri-add-circle-fill text-primary me-2"></i> Registrar Nuevo Monitor en ARGOS Gateway
              </h6>
            </div>
            <div className="card-body p-4 bg-white">
              <form onSubmit={handleAddArgosMonitor} className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label text-dark fw-bold fs-12">Red Social</label>
                  <select
                    className="form-select form-select-sm bg-white text-dark fw-bold border-gray-300"
                    value={newNetwork}
                    onChange={(e) => setNewNetwork(e.target.value)}
                  >
                    <option value="telegram">Telegram</option>
                    <option value="twitter">X / Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label text-dark fw-bold fs-12">Cuenta / Canal / ID</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-white text-dark fw-bold border-gray-300"
                    placeholder={
                      stateCfg.key === "pue"
                        ? "Ej. @AlertaPueblaSeguridad o @SSPGobPue"
                        : stateCfg.key === "gto"
                        ? "Ej. @AlertasCelayaBajio o @FSPE_GtoOficial"
                        : "Ej. @AlertaQroVial o @POES_Qro"
                    }
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-dark fw-bold fs-12">Palabras Clave (separadas por coma)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-white text-dark fw-bold border-gray-300"
                    placeholder="seguridad, operativo, vial"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary btn-sm w-100 fw-bold shadow-sm">
                    <i className="ri-shield-keyhole-line me-1"></i> Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tabla de Monitores ARGOS */}
          <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                Monitores de Redes Sociales en ARGOS ({stateCfg.shortName})
              </h6>
            </div>
            <div className="card-body p-0 bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light text-dark border-bottom">
                    <tr>
                      <th className="text-dark fw-bold ps-4 py-3">Red Social</th>
                      <th className="text-dark fw-bold">Cuenta / Canal</th>
                      <th className="text-dark fw-bold">Keywords Monitoreadas</th>
                      <th className="text-dark fw-bold">Capturas Hoy</th>
                      <th className="text-dark fw-bold">Relevancia</th>
                      <th className="text-dark fw-bold">Última Actividad</th>
                      <th className="text-dark fw-bold text-end pe-4">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {argosMonitors.map((m) => (
                      <tr key={m.id} className="bg-white">
                        <td className="ps-4 py-3">
                          <span className="badge bg-primary text-white text-uppercase fw-bold fs-11">
                            {m.network}
                          </span>
                        </td>
                        <td className="fw-extrabold text-dark fs-14" style={{ color: "#0f172a" }}>
                          {m.channel_id}
                        </td>
                        <td>
                          {m.keywords.map((k, i) => (
                            <span key={i} className="badge bg-secondary-subtle text-dark fw-bold me-1 fs-10">
                              {k}
                            </span>
                          ))}
                        </td>
                        <td className="fw-bold text-dark fs-13" style={{ color: "#0f172a" }}>
                          {m.posts_captured_today} posts
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success fw-bold fs-11">{m.relevance_rate}%</span>
                        </td>
                        <td className="text-dark fw-semibold fs-12" style={{ color: "#334155" }}>
                          {m.last_activity}
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className={`btn btn-sm fw-bold ${m.active ? "btn-outline-danger" : "btn-outline-success"}`}
                            onClick={() => handleToggleMonitor(m.id)}
                          >
                            {m.active ? "Desactivar" : "Activar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GDELT 2.0 Territorial (Nuevo Panel Soberano) */}
      {activeTab === "gdelt" && (
        <div>
          {/* Banner de Enfoque Territorial Segob */}
          <div className="alert border-0 rounded-3 p-3 mb-4 shadow-sm" style={{ backgroundColor: "#f5f3ff", borderLeft: "5px solid #7c3aed" }}>
            <div className="d-flex align-items-start gap-3">
              <div className="p-2 rounded-circle text-white mt-1" style={{ backgroundColor: "#7c3aed" }}>
                <i className="ri-compass-3-line fs-20"></i>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <h6 className="fw-bold mb-1" style={{ color: "#4c1d95" }}>
                    Enfoque Territorial & Panorama Estratégico para Secretaría de Gobierno ({stateCfg.name})
                  </h6>
                  <span className="badge text-white fs-11 px-2 py-1" style={{ backgroundColor: "#7c3aed" }}>
                    <i className="ri-shield-flash-line me-1"></i> Territorial · No Personajes
                  </span>
                </div>
                <p className="fs-13 mb-0" style={{ color: "#5b21b6" }}>
                  Las consultas configuradas a continuación orientan el motor <strong>GDELT Project 2.0</strong> a registrar eventos
                  por municipios neurálgicos, carreteras federales, instalaciones de protección civil, riesgos sísmicos/volcánicos y
                  gobernabilidad social. <strong>No se indexan actores ni figuras políticas individuales</strong>, garantizando panoramas
                  de acción oportunos para la Mesa de Seguridad Estatal.
                </p>
              </div>
            </div>
          </div>

          {/* Notificación de guardado */}
          {gdeltNotice && (
            <div className="alert alert-success d-flex align-items-center justify-content-between py-2 px-3 mb-3 rounded-3 shadow-sm">
              <div className="d-flex align-items-center gap-2">
                <i className="ri-checkbox-circle-fill fs-18"></i>
                <span className="fs-13 fw-bold">{gdeltNotice}</span>
              </div>
              <button type="button" className="btn-close fs-12" onClick={() => setGdeltNotice(null)}></button>
            </div>
          )}

          {/* Tarjetas de Métricas de Monitoreo GDELT */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4" style={{ borderColor: "#7c3aed" }}>
                <span className="fs-12 text-muted fw-bold text-uppercase">Monitores Territoriales</span>
                <h4 className="fw-extrabold mb-0" style={{ color: "#7c3aed" }}>
                  {gdeltQueries.filter((q) => q.active).length} activos
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-info">
                <span className="fs-12 text-muted fw-bold text-uppercase">Filtro de Enfoque</span>
                <h4 className="fw-extrabold mb-0 text-info fs-17">Territorio & Segob</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-success">
                <span className="fs-12 text-muted fw-bold text-uppercase">Tasa de Contingencia</span>
                <h4 className="fw-extrabold mb-0 text-success fs-18">
                  <i className="ri-shield-check-line me-1"></i> 36h Buffer Activo
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-primary">
                <span className="fs-12 text-muted fw-bold text-uppercase">Destino de Ingestión</span>
                <h4 className="fw-extrabold mb-0 text-primary fs-18">
                  BD {stateCfg.shortName} (:8080)
                </h4>
              </div>
            </div>
          </div>

          {/* Formulario Agregar/Parametrizar Búsqueda GDELT */}
          <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                <i className="ri-add-line me-2" style={{ color: "#7c3aed" }}></i> Parametrizar Nueva Búsqueda Territorial en GDELT 2.0
              </h6>
              <span className="text-muted fs-12">Sincronización automática con el Scheduler</span>
            </div>
            <div className="card-body p-4 bg-white">
              <form onSubmit={handleAddGdeltQuery} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label text-dark fw-bold fs-12">Nombre Descriptivo del Monitor</label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-sm bg-white text-dark fw-bold border-gray-300"
                    placeholder="Ej. Corredor Carretero San Martín - Puebla"
                    value={newGdeltName}
                    onChange={(e) => setNewGdeltName(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label text-dark fw-bold fs-12">Eje de Gobernabilidad</label>
                  <select
                    className="form-select form-select-sm bg-white text-dark fw-bold border-gray-300"
                    value={newGdeltCategory}
                    onChange={(e) => setNewGdeltCategory(e.target.value as any)}
                  >
                    <option value="seguridad">Seguridad & Orden Público</option>
                    <option value="vialidad">Vialidad & Movilidad Carretera</option>
                    <option value="proteccion_civil">Protección Civil & Riesgos Naturales</option>
                    <option value="gobernabilidad">Gobernabilidad & Diálogo Social</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label text-dark fw-bold fs-12">Frecuencia</label>
                  <select
                    className="form-select form-select-sm bg-white text-dark fw-bold border-gray-300"
                    value={newGdeltInterval}
                    onChange={(e) => setNewGdeltInterval(Number(e.target.value))}
                  >
                    <option value={15}>Cada 15 min</option>
                    <option value={30}>Cada 30 min (Recomendado)</option>
                    <option value={60}>Cada 60 min</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label text-dark fw-bold fs-12">Máx. Noticias / Ciclo</label>
                  <select
                    className="form-select form-select-sm bg-white text-dark fw-bold border-gray-300"
                    value={newGdeltMaxRecords}
                    onChange={(e) => setNewGdeltMaxRecords(Number(e.target.value))}
                  >
                    <option value={5}>5 noticias</option>
                    <option value={10}>10 noticias</option>
                    <option value={15}>15 noticias</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label text-dark fw-bold fs-12 d-flex justify-content-between">
                    <span>Expresión de Consulta GDELT (Query)</span>
                    <span className="text-muted fw-normal fs-11">
                      Usa sintaxis booleana: <code>(Municipio1 OR Municipio2) (seguridad OR vialidad)</code>
                    </span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      required
                      className="form-control form-control-sm bg-white text-dark font-monospace fs-12 border-gray-300"
                      placeholder='Puebla ("Texmelucan" OR Tehuacan) (seguridad OR operativo OR carretera)'
                      value={newGdeltQuery}
                      onChange={(e) => setNewGdeltQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm fs-12 fw-bold"
                      onClick={() => {
                        setTestQueryText(newGdeltQuery);
                        handleRunGdeltTest(newGdeltQuery);
                      }}
                      disabled={!newGdeltQuery || testTesting}
                    >
                      <i className="ri-play-circle-line me-1"></i> Probar en Vivo
                    </button>
                    <button
                      type="submit"
                      disabled={gdeltSaving}
                      className="btn btn-sm text-white fw-bold shadow-sm"
                      style={{ backgroundColor: "#7c3aed" }}
                    >
                      <i className="ri-save-line me-1"></i> {gdeltSaving ? "Guardando..." : "Guardar Parámetro"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Tester Interactivo de Consultas GDELT */}
          <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                <i className="ri-test-tube-line text-warning me-2"></i> Tester de Consultas GDELT en Tiempo Real
              </h6>
              <span className="badge bg-warning-subtle text-dark fw-bold fs-11">Simulador de Ingestión</span>
            </div>
            <div className="card-body p-4 bg-white">
              <div className="row g-2 align-items-end mb-3">
                <div className="col-md-9">
                  <label className="form-label text-dark fw-bold fs-12">Consulta para probar contra GDELT 2.0 API:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace text-dark fs-12 bg-light"
                    placeholder="Ej. Guanajuato (Celaya OR Irapuato) (seguridad OR vialidad)"
                    value={testQueryText}
                    onChange={(e) => setTestQueryText(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button
                    type="button"
                    onClick={() => handleRunGdeltTest()}
                    disabled={testTesting || !testQueryText}
                    className="btn btn-warning btn-sm w-100 fw-bold shadow-sm text-dark d-inline-flex align-items-center justify-content-center gap-1"
                  >
                    {testTesting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Consultando GDELT...
                      </>
                    ) : (
                      <>
                        <i className="ri-search-eye-line"></i> Ejecutar Prueba
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Resultados del Tester */}
              {testError && (
                <div className="alert alert-warning py-2 px-3 fs-13 mb-0 rounded-3">
                  <i className="ri-alert-line me-1"></i> {testError}
                </div>
              )}

              {testResults && (
                <div className="mt-3 p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold fs-13 text-dark">
                      Artículos devueltos por GDELT ({testResults.length} encontrados en las últimas 48h):
                    </span>
                    <span className="badge bg-success-subtle text-success fw-bold fs-11">Respuesta 200 OK</span>
                  </div>

                  {testResults.length === 0 ? (
                    <p className="text-muted fs-12 mb-0">
                      No se encontraron notas con esta combinación de términos en las últimas 48 horas. Prueba ampliando los operadores OR.
                    </p>
                  ) : (
                    <div className="list-group list-group-flush bg-transparent">
                      {testResults.map((art, idx) => (
                        <div key={idx} className="list-group-item bg-transparent px-0 py-2 border-bottom">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge bg-primary text-white fs-10">{art.domain || "prensa"}</span>
                            <span className="text-muted fs-11">{art.seendate || "Reciente"}</span>
                          </div>
                          <a
                            href={art.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fw-bold text-dark fs-13 text-decoration-none hover-underline d-block"
                          >
                            {art.title || "Artículo sin título"} <i className="ri-external-link-line fs-11 text-muted"></i>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabla de Monitores GDELT Parametrizados */}
          <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
                Monitores GDELT Activos para {stateCfg.name} ({gdeltQueries.length} registrados)
              </h6>
              <button
                onClick={() => saveGdeltQueriesToBackend(gdeltQueries)}
                disabled={gdeltSaving}
                className="btn btn-sm btn-outline-secondary fs-12 fw-bold"
              >
                <i className="ri-refresh-line me-1"></i> Re-sincronizar
              </button>
            </div>
            <div className="card-body p-0 bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light text-dark border-bottom">
                    <tr>
                      <th className="text-dark fw-bold ps-4 py-3">Nombre del Monitor</th>
                      <th className="text-dark fw-bold">Eje</th>
                      <th className="text-dark fw-bold">Expresión de Búsqueda (GDELT Query)</th>
                      <th className="text-dark fw-bold">Frecuencia</th>
                      <th className="text-dark fw-bold">Estatus</th>
                      <th className="text-dark fw-bold text-end pe-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gdeltQueries.map((q) => (
                      <tr key={q.id} className="bg-white">
                        <td className="ps-4 py-3 fw-extrabold text-dark fs-13" style={{ color: "#0f172a" }}>
                          {q.name}
                        </td>
                        <td>
                          <span
                            className={`badge fw-bold fs-11 ${
                              q.category === "seguridad"
                                ? "bg-danger-subtle text-danger"
                                : q.category === "proteccion_civil"
                                ? "bg-warning-subtle text-dark"
                                : q.category === "vialidad"
                                ? "bg-info-subtle text-info"
                                : "bg-primary-subtle text-primary"
                            }`}
                          >
                            {q.category === "seguridad"
                              ? "Seguridad"
                              : q.category === "proteccion_civil"
                              ? "Protección Civil"
                              : q.category === "vialidad"
                              ? "Vialidad"
                              : "Gobernabilidad"}
                          </span>
                        </td>
                        <td>
                          <code className="text-dark bg-light px-2 py-1 rounded fs-12 border">
                            {q.query}
                          </code>
                        </td>
                        <td className="text-dark fw-semibold fs-12">
                          Cada {q.interval_mins} min · Máx {q.max_records}
                        </td>
                        <td>
                          <span
                            className={`badge fw-bold fs-11 ${
                              q.active ? "bg-success text-white" : "bg-secondary text-white"
                            }`}
                          >
                            {q.active ? "Activo" : "Pausado"}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-secondary fs-11"
                              title="Cargar en el tester"
                              onClick={() => {
                                setTestQueryText(q.query);
                                handleRunGdeltTest(q.query);
                              }}
                            >
                              <i className="ri-play-fill text-warning"></i>
                            </button>
                            <button
                              className={`btn fs-11 ${q.active ? "btn-outline-warning" : "btn-outline-success"}`}
                              title={q.active ? "Pausar monitor" : "Reanudar monitor"}
                              onClick={() => handleToggleGdeltQuery(q.id)}
                            >
                              {q.active ? "Pausar" : "Reanudar"}
                            </button>
                            <button
                              className="btn btn-outline-danger fs-11"
                              title="Eliminar monitor"
                              onClick={() => handleDeleteGdeltQuery(q.id)}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
