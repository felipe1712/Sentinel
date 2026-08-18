"use client";

import React, { useState } from "react";
import Link from "next/link";

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
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: "k1",
      name: "Claude API Key (Anthropic)",
      service: "Claude 3.5 Sonnet",
      maskedKey: "sk-ant-api03-••••••••••••••••••••••••-98fA",
      status: "active",
      lastUsed: "Hace 3 min (Briefing 05:30)",
      description: "Motor de IA soberana para la generación de Briefings Matutinos y Dossiers Ejecutivos.",
    },
    {
      id: "k2",
      name: "Telegram API Session Token",
      service: "Telethon Ingestor",
      maskedKey: "session_qro_live_••••••••••••••••",
      status: "active",
      lastUsed: "En vivo (Canales Querétaro)",
      description: "Sesión de ingestión en tiempo real para 14 canales de noticias y reporte social.",
    },
    {
      id: "k3",
      name: "Service Internal Secret",
      service: "Axum Rust <-> Python Workers",
      maskedKey: "sentineliq_internal_service_token_••••",
      status: "active",
      lastUsed: "Hace 1 min",
      description: "Token de autenticación privada entre la API de Rust y los Workers de Python.",
    },
    {
      id: "k4",
      name: "Conector Federal CENAPRED / CONAGUA",
      service: "Conectores Federales",
      maskedKey: "fed_qro_auth_••••••••••••••••",
      status: "active",
      lastUsed: "Hace 15 min",
      description: "Invocación de sismos, alertas de desastres y monitoreo pluvial.",
    },
    {
      id: "k5",
      name: "SpiderFoot OSINT API Token",
      service: "SpiderFoot Engine",
      maskedKey: "sf_internal_token_••••••••",
      status: "active",
      lastUsed: "Hace 1 hora",
      description: "Motor de ciberinteligencia y auditoría de huella digital.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) return;

    const newKey: ApiKeyItem = {
      id: `k_${Date.now()}`,
      name: newKeyName,
      service: "Servicio Personalizado",
      maskedKey: `${newKeyValue.substring(0, 8)}••••••••••••`,
      status: "active",
      lastUsed: "Reciente",
      description: "Llave API agregada manualmente por el Administrador.",
    };

    setKeys([...keys, newKey]);
    setNewKeyName("");
    setNewKeyValue("");
    setShowModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary text-uppercase px-3 py-1 fs-11 fw-bold mb-1">
            Seguridad & Credenciales · Estado de Querétaro
          </span>
          <h4 className="fw-bold mb-1">Administración de Llaves API & Secretos</h4>
          <p className="text-muted fs-13 mb-0">
            Control centralizado de credenciales, API Keys de IA (Claude), tokens de servicio e integraciones.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <i className="ri-key-2-line me-1"></i> Registrar Nueva Llave API
          </button>
        </div>
      </div>

      {/* Menú de Navegación de Administración */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-2">
          <ul className="nav nav-pills nav-custom">
            <li className="nav-item">
              <Link href="/admin" className="nav-link">
                <i className="ri-user-settings-line me-1"></i> Usuarios & Roles
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/keys" className="nav-link active">
                <i className="ri-key-fill me-1"></i> Llaves API & Secretos
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/mcp" className="nav-link">
                <i className="ri-cpu-line me-1"></i> Gestión MCP & Tools
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Tabla de Llaves API */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
          <h6 className="card-title mb-0 fw-bold">Credenciales Integradas en SentinelIQ</h6>
          <span className="badge bg-success-subtle text-success fs-12">
            <i className="ri-shield-check-line me-1"></i> Entorno Soberano Seguro
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Llave / Servicio</th>
                  <th>Servicio Target</th>
                  <th>Token / Key Enmascarada</th>
                  <th>Última Invocación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td>
                      <h6 className="fw-bold mb-0 text-body">{k.name}</h6>
                      <small className="text-muted fs-12">{k.description}</small>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-semibold">
                        {k.service}
                      </span>
                    </td>
                    <td>
                      <code className="fs-12 p-2 bg-dark-subtle rounded">{k.maskedKey}</code>
                    </td>
                    <td className="fs-13 text-muted">{k.lastUsed}</td>
                    <td>
                      <span
                        className={`badge ${
                          k.status === "active"
                            ? "bg-success-subtle text-success"
                            : "bg-warning-subtle text-warning"
                        }`}
                      >
                        {k.status === "active" ? "Activa" : "Advertencia"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline-secondary btn-sm me-1" title="Probar conexión">
                        <i className="ri-refresh-line"></i>
                      </button>
                      <button className="btn btn-outline-danger btn-sm" title="Revocar llave">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para Agregar Nueva Llave */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-header-title text-white fw-bold mb-0">Registrar Nueva Llave API</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddKey}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Nombre del Servicio / Llave</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej. Claude API Backup Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Valor de la Llave API (Secret Key)</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="sk-ant-api03-..."
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      required
                    />
                  </div>
                  <p className="fs-12 text-muted mb-0">
                    Las llaves registradas se cifran usando AES-256 en la base de datos soberana de Querétaro.
                  </p>
                </div>
                <div className="modal-footer bg-body-tertiary">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold">
                    Guardar Credencial
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
