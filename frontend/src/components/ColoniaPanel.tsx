import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { uwApi } from '../services/api';
import { AlertaBadge } from './AlertaBadge';
import { IncidenteCard } from './IncidenteCard';

interface ColoniaPanelProps {
  coloniaId: string | null;
  onClose?: () => void;
}

export const ColoniaPanel: React.FC<ColoniaPanelProps> = ({ coloniaId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coloniaId) return;
    setLoading(true);
    uwApi.getColoniaDetalle(coloniaId).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [coloniaId]);

  if (!coloniaId) {
    return (
      <div className="uw-card h-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
        <span className="material-symbols-outlined mb-2" style={{ fontSize: 44, color: '#FF6B35' }}>
          radar
        </span>
        <h6 className="text-light fw-bold mb-1">Selecciona una Colonia en el Mapa</h6>
        <p className="text-secondary small mb-0">
          Haz clic sobre cualquier polígono de colonia en el mapa para consultar su radiografía
          operativa, historial 2016–2026, actores criminales activos y síntesis ejecutiva.
        </p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="uw-card h-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  const col = data.colonia || {};
  const resumen = data.ultimo_resumen;

  return (
    <div className="uw-card h-100 d-flex flex-column">
      <div className="uw-card-header">
        <div>
          <small className="text-uppercase fw-bold" style={{ color: '#FF6B35', fontSize: '0.7rem' }}>
            {col.alcaldia} · CVE {col.cve_colonia}
          </small>
          <h5 className="mb-0 text-light fw-bold">{col.nombre}</h5>
        </div>
        <div className="d-flex align-items-center gap-2">
          <AlertaBadge nivel={col.nivel_riesgo || 'alto'} />
          {onClose && (
            <button type="button" className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* KPIs rápidos de la colonia */}
      <div className="row g-2 mb-3">
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#1b202c' }}>
            <div className="fw-bold fs-5" style={{ color: '#FF6B35' }}>
              {col.incidentes_count ?? data.incidentes?.length ?? 0}
            </div>
            <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
              Incidentes
            </small>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#1b202c' }}>
            <div className="fw-bold fs-5 text-light">
              {(col.poblacion || 32000).toLocaleString()}
            </div>
            <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
              Población INEGI
            </small>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#1b202c' }}>
            <div className="fw-bold fs-5 text-danger">
              {data.actores_activos?.length || 1}
            </div>
            <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
              Grupos Activos
            </small>
          </div>
        </div>
      </div>

      {/* Actores criminales con presencia */}
      {data.actores_activos?.length > 0 && (
        <div className="mb-3">
          <small className="text-uppercase fw-bold text-secondary d-block mb-1" style={{ fontSize: '0.7rem' }}>
            Presencia Criminal Documentada
          </small>
          <div className="d-flex flex-wrap gap-1">
            {data.actores_activos.map((act: any) => (
              <span
                key={act.id}
                className="badge"
                style={{
                  background: 'rgba(239, 68, 68, 0.18)',
                  color: '#fca5a5',
                  border: '1px solid #ef4444',
                }}
              >
                ⚠️ {act.nombre} (Amenaza {act.nivel_amenaza}/10)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resumen ejecutivo Claude + WorldMonitor */}
      {resumen && (
        <div
          className="p-3 rounded-3 mb-3"
          style={{
            background: 'rgba(255, 107, 53, 0.08)',
            border: '1px solid rgba(255, 107, 53, 0.35)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="fw-bold" style={{ color: '#FF6B35' }}>
              🤖 Síntesis Ejecutiva Claude + WorldMonitor MCP
            </small>
            <AlertaBadge nivel={resumen.nivel_alerta || 'alerta'} />
          </div>
          <p className="small text-light mb-2" style={{ fontSize: '0.8rem' }}>
            {resumen.resumen}
          </p>
          <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
            Audit R7: {resumen.tokens_usados} tokens · {resumen.fuentes_count} fuentes · CII:{' '}
            {resumen.worldmonitor_data?.cii_mexico || 64.2}
          </small>
        </div>
      )}

      {/* Historial reciente de la colonia */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.72rem' }}>
          Historial de Incidentes (fecha_incidente)
        </small>
        <Link
          to={`/colonia/${col.id}`}
          className="btn btn-sm uw-btn-orange py-0 px-2"
          style={{ fontSize: '0.74rem' }}
        >
          Radiografía Completa →
        </Link>
      </div>

      <div className="overflow-auto pe-1" style={{ maxHeight: 310 }}>
        {data.incidentes?.slice(0, 6).map((inc: any) => (
          <IncidenteCard key={inc.id} incidente={inc} />
        ))}
      </div>
    </div>
  );
};
