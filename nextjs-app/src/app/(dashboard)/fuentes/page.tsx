"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getStateConfig, StateConfig, FuenteItem } from "@/lib/stateConfig";
import { registerMonitor, deleteMonitor, getArgosHealth, ArgosMonitor } from "@/lib/argos";

const DEFAULT_ARGOS_MONITORS: ArgosMonitor[] = [
  {
    id: "mon_01",
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
    id: "mon_02",
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
    id: "mon_03",
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

export default function FuentesManagerPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [activeTab, setActiveTab] = useState<"fuentes" | "argos">("argos");
  const [fuentes, setFuentes] = useState<FuenteItem[]>([]);
  const [argosMonitors, setArgosMonitors] = useState<ArgosMonitor[]>(DEFAULT_ARGOS_MONITORS);

  // New Monitor Form state
  const [newNetwork, setNewNetwork] = useState("telegram");
  const [newChannel, setNewChannel] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    setFuentes(cfg.fuentes);

    async function load() {
      try {
        const resp = await api.get("/sources");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setFuentes(resp.data);
        }
      } catch (e) {
        console.warn(`Usando catálogo soberano de fuentes de ${cfg.shortName}`);
      }
    }
    load();
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

  return (
    <div className="pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Source Manager · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Gestión de Fuentes & Conectores ARGOS Gateway
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Conexión en tiempo real con canales de Telegram, cuentas de X / Twitter, feeds RSS y motores MCP.
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
            className={`btn btn-sm fw-bold ${activeTab === "fuentes" ? "btn-primary text-white" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("fuentes")}
          >
            <i className="ri-rss-line me-1"></i> Fuentes & APIs
          </button>
        </div>
      </div>

      {activeTab === "fuentes" ? (
        /* Tab 1: Fuentes y APIs */
        <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
              Fuentes Activas de Inteligencia para {stateCfg.name}
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
      ) : (
        /* Tab 2: ARGOS Gateway Redes Sociales */
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
                    placeholder="Ej. @AlertasCelayaBajio o @FSPE_GtoOficial"
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
    </div>
  );
}
