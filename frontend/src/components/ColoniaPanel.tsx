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
          Haz clic sobre cualquiera de los 1,543 polígonos reales en el mapa para consultar su
          Índice de Señales FGJ, presencia de grupos criminales e incidentes georreferenciados.
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
  const totalSenales = col.total_senales ?? col.incidentes_count ?? 0;

  return (
    <div className="uw-card h-100 d-flex flex-column">
      <div className="uw-card-header">
        <div>
          <small className="text-uppercase fw-bold" style={{ color: '#FF6B35', fontSize: '0.7rem' }}>
            {col.alcaldia} · CVE {col.cve_colonia} · Prioridad {col.prioridad || 'Media'}
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
      <div className="row g-2 mb-2">
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#1b202c' }}>
            <div className="fw-bold fs-5" style={{ color: '#FF6B35' }}>
              {totalSenales}
            </div>
            <small className="text-secondary" style={{ fontSize: '0.68rem' }}>
              Señales FGJ
            </small>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#1b202c' }}>
            <div className="fw-bold fs-5 text-light">
              {col.familias_presentes ?? 4}/4
            </div>
            <small className="text-secondary" style={{ fontSize: '0.68rem' }}>
              Familias Delito
            </small>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#1b202c' }}>
            <div className="fw-bold fs-5 text-danger">
              {data.actores_activos?.length || 1}
            </div>
            <small className="text-secondary" style={{ fontSize: '0.68rem' }}>
              Grupos Activos
            </small>
          </div>
        </div>
      </div>

      {/* Desglose del Índice de Señales por Colonia (indice_senales_colonia.csv) */}
      <div
        className="p-2 rounded-3 mb-2"
        style={{ background: '#121620', border: '1px solid #262c3d', fontSize: '0.74rem' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="fw-bold text-uppercase text-secondary" style={{ fontSize: '0.68rem' }}>
            Índice de Señales FGJ en Colonia
          </span>
          <span className="badge bg-dark border border-secondary text-warning">
            Prioridad {col.prioridad || 'Media'}
          </span>
        </div>
        <div className="row g-1 text-center">
          <div className="col-3">
            <div className="p-1 rounded" style={{ background: '#191f2e' }}>
              <div className="fw-bold text-info">{col.narco_venta ?? 0}</div>
              <small className="text-secondary" style={{ fontSize: '0.63rem' }}>
                Narcomenudeo
              </small>
            </div>
          </div>
          <div className="col-3">
            <div className="p-1 rounded" style={{ background: '#191f2e' }}>
              <div className="fw-bold text-danger">{col.extorsion_cobro ?? 0}</div>
              <small className="text-secondary" style={{ fontSize: '0.63rem' }}>
                Extorsión
              </small>
            </div>
          </div>
          <div className="col-3">
            <div className="p-1 rounded" style={{ background: '#191f2e' }}>
              <div className="fw-bold text-warning">{col.armas_violencia ?? 0}</div>
              <small className="text-secondary" style={{ fontSize: '0.63rem' }}>
                Armas/Letal
              </small>
            </div>
          </div>
          <div className="col-3">
            <div className="p-1 rounded" style={{ background: '#191f2e' }}>
              <div className="fw-bold text-light">{col.secuestro_despojo ?? 0}</div>
              <small className="text-secondary" style={{ fontSize: '0.63rem' }}>
                Despojo/Sec.
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Actores criminales con presencia (presencia_grupos_alcaldia.csv) */}
      {data.actores_activos?.length > 0 && (
        <div className="mb-2">
          <small className="text-uppercase fw-bold text-secondary d-block mb-1" style={{ fontSize: '0.68rem' }}>
            Presencia Criminal en {col.alcaldia} (FGJ + Medios)
          </small>
          <div className="d-flex flex-wrap gap-1">
            {data.actores_activos.map((act: any) => (
              <span
                key={act.id || act.nombre}
                className="badge"
                style={{
                  background: 'rgba(239, 68, 68, 0.18)',
                  color: '#fca5a5',
                  border: '1px solid #ef4444',
                  fontSize: '0.69rem',
                }}
              >
                ⚠️ {act.nombre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resumen ejecutivo Claude + WorldMonitor */}
      {resumen && (
        <div
          className="p-2 rounded-3 mb-2"
          style={{
            background: 'rgba(255, 107, 53, 0.08)',
            border: '1px solid rgba(255, 107, 53, 0.35)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="fw-bold" style={{ color: '#FF6B35', fontSize: '0.72rem' }}>
              🤖 Síntesis Ejecutiva FGJ + WorldMonitor MCP
            </small>
            <AlertaBadge nivel={resumen.nivel_alerta || 'alerta'} />
          </div>
          <p className="small text-light mb-1" style={{ fontSize: '0.76rem' }}>
            {resumen.resumen}
          </p>
        </div>
      )}

      {/* Historial reciente de la colonia */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem' }}>
          Carpetas e Incidentes (fecha_incidente)
        </small>
        <Link
          to={`/colonia/${col.id}`}
          className="btn btn-sm uw-btn-orange py-0 px-2"
          style={{ fontSize: '0.72rem' }}
        >
          Radiografía Completa →
        </Link>
      </div>

      <div className="overflow-auto pe-1" style={{ maxHeight: 230 }}>
        {data.incidentes?.slice(0, 6).map((inc: any) => (
          <IncidenteCard key={inc.id} incidente={inc} />
        ))}
      </div>
    </div>
  );
};
