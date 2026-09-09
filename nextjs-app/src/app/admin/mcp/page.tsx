"use client";

import React, { useState } from "react";
import Link from "next/link";

interface McpTool {
  id: string;
  name: string;
  category: "proteccion_civil" | "seguridad" | "inteligencia" | "salud" | "infraestructura";
  description: string;
  active: boolean;
  lastRun: string;
  latencyMs: number;
}

export default function McpAdminPage() {
  const [tools, setTools] = useState<McpTool[]>([
    {
      id: "intel_earthquakes",
      name: "Sismos & Actividad Telúrica",
      category: "proteccion_civil",
      description: "Monitoreo sismológico SSN / USGS en México y estados vecinos.",
      active: true,
      lastRun: "Hace 5 min",
      latencyMs: 140,
    },
    {
      id: "intel_disaster_alerts",
      name: "Alertas GDACS & Desastres",
      category: "proteccion_civil",
      description: "Alertas globales y regionales de emergencias meteorológicas e inundaciones.",
      active: true,
      lastRun: "Hace 10 min",
      latencyMs: 310,
    },
    {
      id: "intel_unrest_events",
      name: "Disturbios & Inestabilidad Social",
      category: "seguridad",
      description: "Registro de protestas, manifestaciones y cierres carreteros regional.",
      active: true,
      lastRun: "Hace 12 min",
      latencyMs: 280,
    },
    {
      id: "intel_instability_index",
      name: "Índice de Inestabilidad Estatal",
      category: "inteligencia",
      description: "Cálculo sintético de riesgo político e inestabilidad para Querétaro.",
      active: true,
      lastRun: "Hace 2 min",
      latencyMs: 95,
    },
    {
      id: "intel_disease_outbreaks",
      name: "Brotes & Emergencias Epidemiológicas",
      category: "salud",
      description: "Monitoreo OMS/OPS de enfermedades relevantes para la región.",
      active: true,
      lastRun: "Hace 30 min",
      latencyMs: 420,
    },
    {
      id: "intel_keyword_spikes",
      name: "Detección de Spikes en Keywords",
      category: "inteligencia",
      description: "Picos anómalos de palabras clave en medios y redes locales.",
      active: true,
      lastRun: "Hace 8 min",
      latencyMs: 180,
    },
    {
      id: "intel_climate_anomalies",
      name: "Anomalías Climáticas & Embalses",
      category: "infraestructura",
      description: "Niveles de sequía y monitoreo pluvial en embalses de Querétaro.",
      active: true,
      lastRun: "Hace 15 min",
      latencyMs: 210,
    },
  ]);

  const [testResult, setTestResult] = useState<any>(null);
  const [testingTool, setTestingTool] = useState<string | null>(null);

  const toggleTool = (id: string) => {
    setTools(tools.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleTestTool = async (toolId: string) => {
    setTestingTool(toolId);
    setTestResult(null);
    setTimeout(() => {
      setTestResult({
        tool: toolId,
        status: "success",
        data: {
          region: "Estado de Querétaro y vecinos (Gto, Hgo, EdoMex, SLP)",
          records_evaluated: 48,
          summary: "Sin anomalías críticas detectadas en las últimas 6 horas.",
          mcp_server: "world-intel-mcp (local stdio/Qdrant)"
        }
      });
      setTestingTool(null);
    }, 800);
  };

  return (
    <div className="pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-1 shadow-sm">
            world-intel-mcp · Servidor Soberano Local
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Administración de Servidores & Tools MCP
          </h4>
          <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
            Control de herramientas de inteligencia global que alimentan los briefings y dossiers del Gobernador.
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success text-white fs-12 px-3 py-2 d-flex align-items-center shadow-sm">
            <i className="ri-checkbox-circle-fill me-1"></i> Qdrant Vector Store: Online
          </span>
        </div>
      </div>

      {/* Menú de Navegación de Administración */}
      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-2 bg-white">
          <ul className="nav nav-pills nav-custom">
            <li className="nav-item">
              <Link href="/admin" className="nav-link">
                <i className="ri-user-settings-line me-1"></i> Usuarios & Roles
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/keys" className="nav-link">
                <i className="ri-key-fill me-1"></i> Llaves API & Secretos
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/mcp" className="nav-link active fw-bold">
                <i className="ri-cpu-line me-1"></i> Gestión MCP & Tools
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Explicación de Arquitectura MCP */}
      <div className="card bg-white border-0 shadow-sm mb-4 border-start border-4 border-primary rounded-3">
        <div className="card-body p-4 bg-white">
          <h6 className="fw-extrabold text-primary text-uppercase fs-12 mb-1" style={{ color: "#1e40af" }}>
            ¿Qué es MCP y cómo se utiliza en SentinelIQ?
          </h6>
          <p className="fs-13 text-dark fw-semibold mb-0" style={{ color: "#0f172a" }}>
            El <strong>Model Context Protocol (MCP)</strong> es el estándar de comunicación soberana entre modelos de IA (Claude 3.5 Sonnet) y fuentes de datos. SentinelIQ ejecuta localmente el servidor <code>world-intel-mcp</code> en la infraestructura de Querétaro, permitiendo consultar sismos, inundaciones, disturbios e índices de inestabilidad sin fuga de información a terceros.
          </p>
        </div>
      </div>

      {/* Lista de Tools Configurada */}
      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="card-title mb-0 fw-extrabold text-dark fs-15" style={{ color: "#0f172a" }}>
            7 Herramientas MCP Habilitadas para Querétaro
          </h6>
          <span className="badge bg-primary text-white fs-11 fw-bold shadow-sm">Protección Civil · Seguridad · Salud</span>
        </div>
        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-dark border-bottom">
                <tr>
                  <th className="text-dark fw-bold py-3 ps-4">Herramienta MCP</th>
                  <th className="text-dark fw-bold">Categoría</th>
                  <th className="text-dark fw-bold">Última Invocación</th>
                  <th className="text-dark fw-bold">Latencia</th>
                  <th className="text-dark fw-bold">Estado</th>
                  <th className="text-dark fw-bold text-end pe-4">Prueba</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => (
                  <tr key={t.id} className="bg-white">
                    <td className="ps-4 py-3">
                      <h6 className="fw-extrabold mb-1 text-dark fs-14" style={{ color: "#0f172a" }}>{t.name}</h6>
                      <code className="fs-12 text-primary fw-bold">{t.id}</code>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase fs-11">
                        {t.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="fs-13 text-dark fw-semibold" style={{ color: "#334155" }}>{t.lastRun}</td>
                    <td className="fs-13 fw-bold text-dark">{t.latencyMs} ms</td>
                    <td>
                      <div className="form-check form-switch d-inline-block">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={t.active}
                          onChange={() => toggleTool(t.id)}
                        />
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-outline-primary btn-sm fw-bold"
                        onClick={() => handleTestTool(t.id)}
                        disabled={testingTool === t.id}
                      >
                        {testingTool === t.id ? "Ejecutando..." : "Probar Tool"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resultado de Prueba Manual */}
      {testResult && (
        <div className="card bg-white border-success shadow-sm rounded-3 overflow-hidden border-2">
          <div className="card-header bg-success text-white py-3 d-flex justify-content-between align-items-center">
            <h6 className="card-title mb-0 fw-extrabold text-white">
              Resultado de Ejecución MCP: <code>{testResult.tool}</code>
            </h6>
            <span className="badge bg-white text-success fw-bold fs-11">Status 200 OK</span>
          </div>
          <div className="card-body p-4 bg-white">
            <pre className="bg-light text-dark p-3 rounded-3 border border-gray-300 mb-0 fs-13 font-monospace fw-bold" style={{ color: "#0f172a" }}>
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
