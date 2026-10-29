import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uwApi } from '../services/api';
import { FALLBACK_COLONIAS_GEOJSON } from '../data/fallbackData';
import { AlertaBadge } from '../components/AlertaBadge';
import { IncidenteCard } from '../components/IncidenteCard';

export const Colonia: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activeId = id || '11111111-0001-4000-a000-000000000001';
  const [data, setData] = useState<any>(null);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    uwApi.getColoniaDetalle(activeId).then(setData);
  }, [activeId]);

  const handleGenerarResumen = async () => {
    setGenerando(true);
    try {
      const r = await fetch('/api/resumenes/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'colonia', colonia_id: activeId }),
      });
      if (r.ok) {
        const res = await r.json();
        setData((prev: any) => ({ ...prev, ultimo_resumen: res.resumen }));
      }
    } catch {
      // fallback ok
    } finally {
      setGenerando(false);
    }
  };

  if (!data) return null;
  const col = data.colonia || {};
  const resumen = data.ultimo_resumen;

  return (
    <div>
      <div className="uw-card mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <small className="text-uppercase fw-bold" style={{ color: '#FF6B35' }}>
              DRILL-DOWN OPERATIVO DE COLONIA · {col.alcaldia} (CVE {col.cve_colonia})
            </small>
            <h4 className="mb-0 text-light fw-bold">{col.nombre}</h4>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm bg-dark text-light border-secondary"
              value={activeId}
              onChange={(e) => navigate(`/colonia/${e.target.value}`)}
            >
              {FALLBACK_COLONIAS_GEOJSON.features.map((f) => (
                <option key={f.properties.id} value={f.properties.id}>
                  {f.properties.nombre} ({f.properties.alcaldia})
                </option>
              ))}
            </select>
            <AlertaBadge nivel={col.nivel_riesgo || 'critico'} size="md" />
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          {/* Resumen Ejecutivo Claude + WorldMonitor MCP */}
          <div className="uw-card mb-3">
            <div className="uw-card-header">
              <h6 className="mb-0 text-light fw-bold">
                🤖 Análisis Ejecutivo (Claude + WorldMonitor MCP)
              </h6>
              <button
                type="button"
                className="btn btn-sm uw-btn-orange"
                onClick={handleGenerarResumen}
                disabled={generando}
              >
                {generando ? 'Consultando WorldMonitor...' : 'Actualizar Síntesis'}
              </button>
            </div>
            {resumen && (
              <div>
                <h6 className="text-warning fw-semibold">{resumen.titulo}</h6>
                <p className="small text-light">{resumen.resumen}</p>
                <ul className="small text-secondary ps-3 mb-2">
                  {(resumen.puntos_clave || []).map((pt: string, i: number) => (
                    <li key={i} className="mb-1">
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="p-2 rounded small" style={{ background: '#11141c', border: '1px solid #262c3d' }}>
                  <span className="text-warning fw-semibold">WorldMonitor MCP:</span> CII México{' '}
                  {resumen.worldmonitor_data?.cii_mexico || 64.2} · Tools:{' '}
                  {(resumen.worldmonitor_data?.tools_invoked || []).join(', ')} · Audit R7:{' '}
                  {resumen.tokens_usados} tokens
                </div>
              </div>
            )}
          </div>

          {/* Desglose por tipo de delito */}
          <div className="uw-card">
            <div className="uw-card-header">
              <h6 className="mb-0 text-light fw-bold">Incidencia por Tipología (2016–2026)</h6>
            </div>
            {(data.estadisticas_por_tipo || []).map((item: any) => (
              <div key={item.tipo} className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-uppercase text-light fw-semibold">
                    {item.tipo.replace('_', ' ')}
                  </span>
                  <span style={{ color: '#FF6B35' }}>{item.count} casos</span>
                </div>
                <div className="progress" style={{ height: 6, background: '#1e2433' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(100, item.count * 5)}%`,
                      backgroundColor: '#FF6B35',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-7">
          <div className="uw-card">
            <div className="uw-card-header">
              <h6 className="mb-0 text-light fw-bold">
                Historial Cronológico de la Colonia (Ordenado por <code>fecha_incidente</code>)
              </h6>
            </div>
            {(data.incidentes || []).map((inc: any) => (
              <IncidenteCard key={inc.id} incidente={inc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
