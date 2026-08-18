"use client";

import React, { useState } from "react";
import api from "@/lib/api";

export default function TelegramDiscoveryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const resp = await api.post("/sources/telegram/search", { query });
      setResults(resp.data);
    } catch (e) {
      console.error("Error en descubrimiento:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Descubrimiento de Canales de Telegram</h4>
          <p className="text-muted fs-13 mb-0">
            Búsqueda e inclusión automatizada con scoring de relevancia por Claude API.
          </p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Noticias Jalisco / Alertas Zapopan / Tráfico ZMG"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Evaluando canales..." : "Buscar Canales"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="row g-4">
        {results.map((r, idx) => (
          <div key={idx} className="col-md-6">
            <div className="card shadow-sm border-start border-4 border-primary">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0 text-primary">{r.username}</h6>
                  <span className="badge bg-success-subtle text-success fw-bold">
                    Relevancia: {r.relevance_score}/100
                  </span>
                </div>
                <h5 className="fw-bold text-body">{r.title}</h5>
                <p className="text-muted fs-13 mb-2">Subsuscriptores: {r.subscribers?.toLocaleString()}</p>
                <button className="btn btn-outline-primary btn-sm w-100">
                  <i className="ri-add-line me-1"></i> Agregar a Fuentes Activas
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
