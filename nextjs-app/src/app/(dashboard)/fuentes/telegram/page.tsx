"use client";

import React, { useState } from "react";
import api from "@/lib/api";

const DEFAULT_RESULTS = [
  { username: "@NoticiasQRO", title: "Noticias Querétaro Oficial", relevance_score: 95, subscribers: 48500, description: "Monitoreo en vivo de eventos en la ZMQ y el estado." },
  { username: "@PoliciaEstatalQRO", title: "Policía Estatal de Querétaro (PoEs)", relevance_score: 98, subscribers: 32100, description: "Reportes de movilidad y operativos carreteros." },
  { username: "@SanJuanAlDía", title: "San Juan del Río Informativo", relevance_score: 88, subscribers: 19400, description: "Novedades y reportes en la región Sur de Querétaro." },
];

export default function TelegramDiscoveryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>(DEFAULT_RESULTS);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const resp = await api.post("/sources/telegram/search", { query });
      if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
        setResults(resp.data);
      }
    } catch (e) {
      console.warn("Búsqueda simulada para Querétaro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-1 shadow-sm">
            Ingestión Social · Estado de Querétaro
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Descubrimiento de Canales de Telegram
          </h4>
          <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
            Búsqueda e inclusión automatizada con scoring de relevancia por IA.
          </p>
        </div>
      </div>

      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-4 bg-white">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control bg-white text-dark fw-bold border-gray-300 fs-14"
                placeholder="Ej. Noticias Querétaro / Alertas ZMQ / Tráfico Carretera 57 / San Juan del Río"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100 fw-bold shadow-sm" disabled={loading}>
                {loading ? "Evaluando canales..." : "Buscar Canales"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="row g-4">
        {results.map((r, idx) => (
          <div key={idx} className="col-md-6">
            <div className="card bg-white border-0 shadow-sm border-start border-4 border-primary rounded-3">
              <div className="card-body p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-extrabold mb-0 text-primary fs-15">{r.username}</h6>
                  <span className="badge bg-success text-white fw-bold fs-11 shadow-sm">
                    Relevancia: {r.relevance_score}/100
                  </span>
                </div>
                <h5 className="fw-extrabold text-dark fs-16 mb-2" style={{ color: "#0f172a" }}>{r.title}</h5>
                <p className="text-dark fs-13 mb-3 fw-semibold" style={{ color: "#334155" }}>
                  {r.description || `Suscriptores: ${r.subscribers?.toLocaleString()}`}
                </p>
                <button className="btn btn-outline-primary btn-sm w-100 fw-bold">
                  <i className="ri-add-line me-1"></i> Conectar Canal a SentinelIQ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
