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
  const [coloniasList, setColoniasList] = useState<any[]>(FALLBACK_COLONIAS_GEOJSON.features);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    uwApi.getColoniasGeoJSON().then((geo) => {
      if (geo?.features?.length) {
        setColoniasList(geo.features);
      }
    });
  }, []);

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
            <small className="text-uppercase fw-bold" style={{ color: '#ea580c' }}>
              ANÁLISIS OPERATIVO DE COLONIA · {col.alcaldia} · CVE {col.cve_colonia}
            </small>
            <h4 className="mb-0 text-dark fw-bold">{col.nombre}</h4>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm bg-white text-dark border-secondary-subtle"
              value={activeId}
              onChange={(e) => navigate(`/colonia/${e.target.value}`)}
            >
              {coloniasList.map((f) => (
                <option key={f.properties.id} value={f.properties.id}>
                  {f.properties.nombre} — {f.properties.alcaldia}
                </option>
              ))}
            </select>
            <AlertaBadge nivel={col.nivel_riesgo || 'critico'} size="md" />
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          {/* Resumen Ejecutivo */}
          <div className="uw-card mb-3">
            <div className="uw-card-header">
              <h6 className="mb-0 text-dark fw-bold">
                📊 Síntesis Ejecutiva de Inteligencia
              </h6>
              <button
                type="button"
                className="btn btn-sm uw-btn-orange"
                onClick={handleGenerarResumen}
                disabled={generando}
              >
                {generando ? 'Actualizando...' : 'Actualizar Síntesis'}
              </button>
            </div>
            {resumen && (
              <div>
                <h6 className="fw-semibold" style={{ color: '#c2410c' }}>{resumen.titulo}</h6>
                <p className="small text-dark">{resumen.resumen}</p>
                <ul className="small text-secondary ps-3 mb-2">
                  {(resumen.puntos_clave || []).map((pt: string, i: number) => (
                    <li key={i} className="mb-1">
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="p-2 rounded small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <span className="fw-semibold" style={{ color: '#c2410c' }}>Contexto Macro:</span> Índice de Riesgo{' '}
                  {resumen.worldmonitor_data?.cii_mexico || 64.2} · Fuentes verificadas:{' '}
                  {resumen.fuentes_count || 12}
                </div>
              </div>
            )}
          </div>

          {/* Desglose por tipo de delito */}
          <div className="uw-card">
            <div className="uw-card-header">
              <h6 className="mb-0 text-dark fw-bold">Incidencia por Tipología</h6>
            </div>
            {(data.estadisticas_por_tipo || []).map((item: any) => (
              <div key={item.tipo} className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-uppercase text-dark fw-semibold">
                    {item.tipo.replace('_', ' ')}
                  </span>
                  <span style={{ color: '#ea580c' }}>{item.count} casos</span>
                </div>
                <div className="progress" style={{ height: 6, background: '#e2e8f0' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(100, item.count * 5)}%`,
                      backgroundColor: '#ea580c',
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
              <h6 className="mb-0 text-dark fw-bold">
                Historial Cronológico de la Colonia
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
