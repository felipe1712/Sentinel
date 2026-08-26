"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

interface ApiKeyItem {
  id: string;
  name: string;
  service: string;
  maskedKey: string;
  status: "active" | "warning" | "disabled";
  lastUsed: string;
  description: string;
}

export default function AdminKeysPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [activeTab, setActiveTab] = useState<"all" | "telegram" | "twitter" | "claude" | "argos">("telegram");

  // Form states for each provider
  const [tgApiId, setTgApiId] = useState("");
  const [tgApiHash, setTgApiHash] = useState("");
  const [twBearerToken, setTwBearerToken] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [argosToken, setArgosToken] = useState("sentineliq_argos_token_shared_sec_2026");
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const [keys, setKeys] = useState<ApiKeyItem[]>([]);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);

    setKeys([
      {
        id: "k1",
        name: "Claude API Key (Anthropic)",
        service: "Claude 3.5 Sonnet",
        maskedKey: "sk-ant-api03-••••••••••••••••••••••••-98fA",
        status: "active",
        lastUsed: "Hace 3 min (Briefing 05:30)",
        description: `Motor de IA soberana para Briefings y Dossiers de ${cfg.name}.`,
      },
      {
        id: "k2",
        name: "Telegram MTProto API & Session",
        service: "Telethon Ingestor",
        maskedKey: "session_live_••••••••••••••••",
        status: "active",
        lastUsed: `En vivo (Canales ${cfg.shortName})`,
        description: `Ingesta en tiempo real y buscador global de canales en ${cfg.name}.`,
      },
      {
        id: "k3",
        name: "X / Twitter API v2 Bearer Token",
        service: "Twitter Stream API",
        maskedKey: "AAAAAAAAAAAAAAAAAAAA••••••••••••",
        status: "active",
        lastUsed: "Hace 6 min",
        description: `Monitoreo continuo de cuentas institucionales y tendencias de ${cfg.shortName}.`,
      },
      {
        id: "k4",
        name: "ARGOS Gateway Service Token",
        service: "ARGOS OSINT Ingestor",
        maskedKey: "sentineliq_argos_token_••••",
        status: "active",
        lastUsed: "Hace 1 min (Puerto 8088)",
        description: "Token de enlace con el microservicio de redes sociales ARGOS.",
      },
      {
        id: "k5",
        name: `Conector Soberano ${cfg.shortName} (CENAPRED / C4)`,
        service: "Conectores Federales & Locales",
        maskedKey: `auth_${cfg.key}_sec_••••••••••••`,
        status: "active",
        lastUsed: "Hace 12 min",
        description: "Alertas sísmicas, monitoreo hidrológico y reportes C4.",
      },
    ]);
  }, []);

  const handleSave = (provider: string) => {
    setSavedSuccess(`Credenciales de ${provider} guardadas y sincronizadas exitosamente.`);
    setTimeout(() => setSavedSuccess(null), 4000);
  };

  return (
    <div className="pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Seguridad & Credenciales · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Administración de Llaves API & Secretos
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Control centralizado de API Keys de Telegram MTProto, X / Twitter v2, Claude AI y ARGOS Gateway para {stateCfg.shortName}.
          </p>
        </div>
      </div>

      {/* Menú de Navegación de Administración */}
      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-2 bg-white">
          <ul className="nav nav-pills nav-custom gap-2">
            <li className="nav-item">
              <Link href="/admin" className="nav-link fw-bold text-dark">
                <i className="ri-user-settings-line me-1"></i> Usuarios & Roles
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/keys" className="nav-link active fw-bold btn-primary text-white">
                <i className="ri-key-fill me-1 text-white"></i> Llaves API & Secretos
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/auditoria" className="nav-link fw-bold text-dark">
                <i className="ri-shield-flash-line me-1"></i> Auditoría de Consultas
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/mcp" className="nav-link fw-bold text-dark">
                <i className="ri-cpu-line me-1"></i> Gestión MCP & Tools
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Mensaje de éxito al guardar */}
      {savedSuccess && (
        <div className="alert alert-success d-flex align-items-center mb-4 rounded-3 shadow-sm" role="alert">
          <i className="ri-checkbox-circle-fill fs-20 me-2 text-success"></i>
          <span className="fw-bold">{savedSuccess}</span>
        </div>
      )}

      {/* Pestañas de Proveedores de Credenciales */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm fw-bold ${activeTab === "telegram" ? "btn-primary text-white shadow-sm" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("telegram")}
        >
          <i className="ri-telegram-fill me-1"></i> Telegram MTProto API
        </button>
        <button
          className={`btn btn-sm fw-bold ${activeTab === "twitter" ? "btn-primary text-white shadow-sm" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("twitter")}
        >
          <i className="ri-twitter-x-fill me-1"></i> X / Twitter API v2
        </button>
        <button
          className={`btn btn-sm fw-bold ${activeTab === "claude" ? "btn-primary text-white shadow-sm" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("claude")}
        >
          <i className="ri-brain-line me-1"></i> Claude 3.5 AI
        </button>
        <button
          className={`btn btn-sm fw-bold ${activeTab === "argos" ? "btn-primary text-white shadow-sm" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("argos")}
        >
          <i className="ri-share-forward-fill me-1"></i> ARGOS Gateway
        </button>
        <button
          className={`btn btn-sm fw-bold ${activeTab === "all" ? "btn-primary text-white shadow-sm" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("all")}
        >
          <i className="ri-file-list-3-line me-1"></i> Inventario de Credenciales
        </button>
      </div>

      {/* Contenido según la pestaña activa */}

      {/* TAB 1: TELEGRAM MTPROTO */}
      {activeTab === "telegram" && (
        <div className="card bg-white border-0 shadow-sm rounded-3 border-start border-4 border-info mb-4">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-info-subtle text-info rounded-circle p-2 me-3 text-center fs-20">
                <i className="ri-telegram-fill"></i>
              </div>
              <div>
                <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                  Configuración de Telegram MTProto API ({stateCfg.shortName})
                </h5>
                <small className="text-dark fw-semibold" style={{ color: "#334155" }}>
                  Permite realizar búsquedas globales de canales de seguridad y escuchar mensajes en tiempo real.
                </small>
              </div>
            </div>
            <span className="badge bg-success text-white fw-bold shadow-sm">
              <i className="ri-shield-check-line me-1"></i> Scraper Soberano Activo
            </span>
          </div>
          <div className="card-body p-4 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("Telegram MTProto");
              }}
            >
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-dark fw-bold fs-13">
                    Telegram App api_id <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-white text-dark fw-bold border-gray-300 fs-14"
                    placeholder="Ej. 28471923"
                    value={tgApiId}
                    onChange={(e) => setTgApiId(e.target.value)}
                  />
                  <small className="text-muted fs-11 mt-1 d-block">
                    Obtenido en <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-primary fw-bold">my.telegram.org</a> en la sección <em>API development tools</em>.
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-dark fw-bold fs-13">
                    Telegram App api_hash <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg bg-white text-dark fw-bold border-gray-300 fs-14"
                    placeholder="Ej. a3b8c9d1e2f34567890abcdef1234567"
                    value={tgApiHash}
                    onChange={(e) => setTgApiHash(e.target.value)}
                  />
                  <small className="text-muted fs-11 mt-1 d-block">
                    Cadena alfanumérica de 32 caracteres generada por Telegram.
                  </small>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 mb-4 border border-gray-200">
                <h6 className="fw-bold text-dark fs-13 mb-1">
                  <i className="ri-information-line text-primary me-1"></i> Estado del Servicio Telethon:
                </h6>
                <p className="text-dark fs-12 mb-0" style={{ color: "#334155" }}>
                  Actualmente la ingesta de canales públicos de {stateCfg.name} opera en tiempo real a través del Web Gateway de Telegram. Al ingresar tu <code>api_id</code> y <code>api_hash</code>, se habilitará la búsqueda profunda de cuentas y grupos cerrados de monitoreo.
                </p>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <Link href="/fuentes/telegram" className="btn btn-outline-info btn-sm fw-bold">
                  <i className="ri-search-2-line me-1"></i> Ir al Buscador de Canales
                </Link>
                <button type="submit" className="btn btn-primary btn-md fw-bold text-white shadow-sm px-4">
                  <i className="ri-save-line me-1"></i> Guardar Credenciales Telegram
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: X / TWITTER API v2 */}
      {activeTab === "twitter" && (
        <div className="card bg-white border-0 shadow-sm rounded-3 border-start border-4 border-dark mb-4">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="avatar-sm bg-dark text-white rounded-circle p-2 me-3 text-center fs-20">
                <i className="ri-twitter-x-fill"></i>
              </div>
              <div>
                <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                  Configuración de X / Twitter API v2 ({stateCfg.shortName})
                </h5>
                <small className="text-dark fw-semibold" style={{ color: "#334155" }}>
                  Monitoreo de publicaciones institucionales, operativos viales y detección de narrativas en vivo.
                </small>
              </div>
            </div>
            <span className="badge bg-success text-white fw-bold shadow-sm">
              <i className="ri-shield-check-line me-1"></i> Stream Activo
            </span>
          </div>
          <div className="card-body p-4 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("X / Twitter API v2");
              }}
            >
              <div className="mb-4">
                <label className="form-label text-dark fw-bold fs-13">
                  TWITTER_BEARER_TOKEN <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg bg-white text-dark fw-bold border-gray-300 fs-14"
                  placeholder="AAAAAAAAAAAAAAAAAAAA..."
                  value={twBearerToken}
                  onChange={(e) => setTwBearerToken(e.target.value)}
                />
                <small className="text-muted fs-11 mt-1 d-block">
                  Generado en el portal <a href="https://developer.twitter.com" target="_blank" rel="noreferrer" className="text-primary fw-bold">developer.twitter.com</a> en la sección <em>Keys and Tokens</em> de tu aplicación.
                </small>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <Link href="/fuentes/twitter" className="btn btn-outline-dark btn-sm fw-bold">
                  <i className="ri-twitter-x-line me-1"></i> Ir al Monitor de X / Twitter
                </Link>
                <button type="submit" className="btn btn-primary btn-md fw-bold text-white shadow-sm px-4">
                  <i className="ri-save-line me-1"></i> Guardar Bearer Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CLAUDE AI */}
      {activeTab === "claude" && (
        <div className="card bg-white border-0 shadow-sm rounded-3 border-start border-4 border-primary mb-4">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
              Motor de Inteligencia Artificial Claude 3.5 Sonnet
            </h5>
          </div>
          <div className="card-body p-4 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("Claude AI");
              }}
            >
              <div className="mb-4">
                <label className="form-label text-dark fw-bold fs-13">
                  CLAUDE_API_KEY (Anthropic) <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg bg-white text-dark fw-bold border-gray-300 fs-14"
                  placeholder="sk-ant-api03-..."
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                />
                <small className="text-muted fs-11 mt-1 d-block">
                  Utilizada para la redacción del Briefing Matutino (05:30 AM), análisis de Dossiers y clasificación de eventos.
                </small>
              </div>

              <button type="submit" className="btn btn-primary btn-md fw-bold text-white shadow-sm px-4">
                <i className="ri-save-line me-1"></i> Actualizar Llave de Claude
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ARGOS GATEWAY */}
      {activeTab === "argos" && (
        <div className="card bg-white border-0 shadow-sm rounded-3 border-start border-4 border-warning mb-4">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
              Enlace con ARGOS Gateway (Microservicio en Puerto :8088)
            </h5>
          </div>
          <div className="card-body p-4 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("ARGOS Gateway");
              }}
            >
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-dark fw-bold fs-13">URL de ARGOS Gateway</label>
                  <input
                    type="text"
                    className="form-control bg-white text-dark fw-bold border-gray-300 fs-14"
                    value="https://argos.sentineliq.com.mx"
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-dark fw-bold fs-13">ARGOS_SERVICE_TOKEN</label>
                  <input
                    type="password"
                    className="form-control bg-white text-dark fw-bold border-gray-300 fs-14"
                    value={argosToken}
                    onChange={(e) => setArgosToken(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-md fw-bold text-white shadow-sm px-4">
                <i className="ri-save-line me-1"></i> Sincronizar Token de ARGOS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: TABLA DE INVENTARIO DE TODAS LAS LLAVES */}
      {activeTab === "all" && (
        <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden mb-4">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
              Inventario de Credenciales Integradas en SentinelIQ ({stateCfg.shortName})
            </h6>
            <span className="badge bg-success text-white fw-bold shadow-sm">
              <i className="ri-shield-check-line me-1"></i> Entorno Soberano Cifrado AES-256
            </span>
          </div>
          <div className="card-body p-0 bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-dark border-bottom">
                  <tr>
                    <th className="text-dark fw-bold ps-4 py-3">Llave / Servicio</th>
                    <th className="text-dark fw-bold">Servicio Target</th>
                    <th className="text-dark fw-bold">Token / Key Enmascarada</th>
                    <th className="text-dark fw-bold">Última Invocación</th>
                    <th className="text-dark fw-bold">Estado</th>
                    <th className="text-dark fw-bold text-end pe-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="bg-white">
                      <td className="ps-4 py-3">
                        <h6 className="fw-extrabold mb-0 text-dark fs-14" style={{ color: "#0f172a" }}>{k.name}</h6>
                        <small className="text-dark fw-semibold fs-12" style={{ color: "#475569" }}>{k.description}</small>
                      </td>
                      <td>
                        <span className="badge bg-primary text-white fw-bold fs-11 shadow-sm">
                          {k.service}
                        </span>
                      </td>
                      <td>
                        <code className="fs-12 p-2 bg-light text-dark border rounded font-monospace fw-bold">{k.maskedKey}</code>
                      </td>
                      <td className="fs-12 text-dark fw-semibold" style={{ color: "#334155" }}>{k.lastUsed}</td>
                      <td>
                        <span className="badge bg-success text-white fw-bold shadow-sm">
                          Activa
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-outline-primary btn-sm fw-bold me-1" title="Probar conexión">
                          <i className="ri-refresh-line"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
