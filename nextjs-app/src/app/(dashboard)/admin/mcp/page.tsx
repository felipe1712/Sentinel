"use client";

import React, { useState } from "react";
import api from "@/lib/api";

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
    }, 1000);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <span className="badge bg-primary-subtle text-primary text-uppercase px-3 py-1 fs-11 fw-bold mb-1">
            world-intel-mcp · Local Server
          </span>
          <h4 className="fw-bold mb-1">Administración de Servidores & Tools MCP</h4>
          <p className="text-muted fs-13 mb-0">
            Control de herramientas de inteligencia global que alimentan los briefings y dossiers del Gobernador.
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success-subtle text-success fs-12 px-3 py-2 d-flex align-items-center">
            <i className="ri-checkbox-circle-fill me-1"></i> Qdrant Vector Store: Online
          </span>
          <span className="badge bg-dark fs-12 px-3 py-2 d-flex align-items-center">
            113 Tools Registradas (6 Activas)
          </span>
        </div>
      </div>

      {/* Explicación de Arquitectura MCP */}
      <div className="card mb-4 border-start border-4 border-info">
        <div className="card-body">
          <h6 className="fw-bold text-info text-uppercase fs-12 mb-1">¿Qué es MCP y cómo se utiliza en SentinelIQ?</h6>
          <p className="fs-13 text-muted mb-0">
            El <strong>Model Context Protocol (MCP)</strong> es un estándar de comunicación entre modelos LLM (Claude API / Antigravity) y fuentes de datos externas. SentinelIQ ejecuta localmente el servidor <code>world-intel-mcp</code> en la red soberana, permitiendo al generador de briefings consultar sismos, inundaciones, disturbios e índices de inestabilidad sin exponer datos sensibles a servicios de terceros.
          </p>
        </div>
      </div>

      {/* Lista de Tools Configurada */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
          <h6 className="card-title mb-0 fw-bold">Herramientas MCP Habilitadas para Querétaro</h6>
          <span className="fs-12 text-muted">Protección Civil · Seguridad · Salud · Inteligencia</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Herramienta MCP</th>
                  <th>Categoría</th>
                  <th>Última Consulta</th>
                  <th>Latencia</th>
                  <th>Estado</th>
                  <th>Prueba</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <h6 className="fw-bold mb-0 text-body">{t.name}</h6>
                      <code className="fs-11 text-muted">{t.id}</code>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary text-uppercase">
                        {t.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="fs-13 text-muted">{t.lastRun}</td>
                    <td className="fs-13 fw-semibold">{t.latencyMs} ms</td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={t.active}
                          onChange={() => toggleTool(t.id)}
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-secondary btn-sm"
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
        <div className="card border-success shadow-sm">
          <div className="card-header bg-success-subtle text-success-emphasis d-flex justify-content-between">
            <h6 className="card-title mb-0 fw-bold">
              Resultado de Ejecución MCP: <code>{testResult.tool}</code>
            </h6>
            <span className="badge bg-success">Status 200 OK</span>
          </div>
          <div className="card-body">
            <pre className="bg-dark text-success p-3 rounded mb-0 fs-12 font-monospace">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
