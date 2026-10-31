import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { uwApi } from '../services/api';
import { AlertaBadge } from './AlertaBadge';
import { IncidenteCard } from './IncidenteCard';

interface ColoniaPanelProps {
  coloniaId: string | null;
  onClose?: () => void;
  height?: number | string;
}

export const ColoniaPanel: React.FC<ColoniaPanelProps> = ({ coloniaId, onClose, height = 575 }) => {
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
      <div
        className="uw-card d-flex flex-column justify-content-center align-items-center text-center p-4"
        style={{ height, maxHeight: height }}
      >
        <span className="material-symbols-outlined mb-2" style={{ fontSize: 44, color: '#ea580c' }}>
          radar
        </span>
        <h6 className="text-dark fw-bold mb-1">Selecciona una Colonia en el Mapa</h6>
        <p className="text-secondary small mb-0">
          Haz clic sobre cualquiera de los 1,543 polígonos reales en el mapa para consultar su
          Índice de Señales FGJ, presencia de grupos criminales e incidentes georreferenciados.
        </p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div
        className="uw-card d-flex justify-content-center align-items-center"
        style={{ height, maxHeight: height }}
      >
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  const col = data.colonia || {};
  const resumen = data.ultimo_resumen;
  const totalSenales = col.total_senales ?? col.incidentes_count ?? 0;

  return (
    <div
      className="uw-card d-flex flex-column"
      style={{ height, maxHeight: height, overflow: 'hidden' }}
    >
      <div className="uw-card-header flex-shrink-0 mb-2 pb-2">
        <div>
          <small className="text-uppercase fw-bold" style={{ color: '#ea580c', fontSize: '0.7rem' }}>
            {col.alcaldia} · CVE {col.cve_colonia} · Prioridad {col.prioridad || 'Media'}
          </small>
          <h5 className="mb-0 text-dark fw-bold">{col.nombre}</h5>
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

      {/* KPIs rápidos fijados arriba */}
      <div className="row g-2 mb-2 flex-shrink-0">
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="fw-bold fs-5" style={{ color: '#ea580c' }}>
              {totalSenales}
            </div>
            <small className="text-secondary" style={{ fontSize: '0.68rem' }}>
              Señales FGJ
            </small>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="fw-bold fs-5 text-dark">
              {col.familias_presentes ?? 4}/4
            </div>
            <small className="text-secondary" style={{ fontSize: '0.68rem' }}>
              Familias Delito
            </small>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="fw-bold fs-5 text-danger">
              {data.actores_activos?.length || 1}
            </div>
            <small className="text-secondary" style={{ fontSize: '0.68rem' }}>
              Grupos Activos
            </small>
          </div>
        </div>
      </div>

      {/* Contenido con scroll interno para que la altura empate exactamente con el mapa */}
      <div className="flex-grow-1 overflow-auto pe-1 d-flex flex-column gap-2">
        {/* Desglose del Índice de Señales por Colonia */}
        <div
          className="p-2 rounded-3"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.74rem' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-bold text-uppercase text-secondary" style={{ fontSize: '0.68rem' }}>
              Índice de Señales FGJ en Colonia
            </span>
            <span className="badge bg-warning-subtle text-dark border border-warning">
              Prioridad {col.prioridad || 'Media'}
            </span>
          </div>
          <div className="row g-1 text-center">
            <div className="col-3">
              <div className="p-1 rounded bg-white border">
                <div className="fw-bold text-primary">{col.narco_venta ?? 0}</div>
                <small className="text-secondary" style={{ fontSize: '0.63rem' }}>
                  Narcomenudeo
                </small>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1 rounded bg-white border">
                <div className="fw-bold text-danger">{col.extorsion_cobro ?? 0}</div>
                <small className="text-secondary" style={{ fontSize: '0.63rem' }}>
                  Extorsión
                </small>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1 rounded bg-white border">
                <div className="fw-bold" style={{ color: '#d97706' }}>{col.armas_violencia ?? 0}</div>
                <small className="text-secondary" style={{ fontSize: '0.63rem' }}>
                  Armas/Letal
                </small>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1 rounded bg-white border">
                <div className="fw-bold text-dark">{col.secuestro_despojo ?? 0}</div>
                <small className="text-secondary" style={{ fontSize: '0.63rem' }}>
                  Despojo/Sec.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Actores criminales con presencia */}
        {data.actores_activos?.length > 0 && (
          <div>
            <small className="text-uppercase fw-bold text-secondary d-block mb-1" style={{ fontSize: '0.68rem' }}>
              Presencia Criminal en {col.alcaldia}
            </small>
            <div className="d-flex flex-wrap gap-1">
              {data.actores_activos.map((act: any) => (
                <span
                  key={act.id || act.nombre}
                  className="badge"
                  style={{
                    background: '#fef2f2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    fontSize: '0.69rem',
                  }}
                >
                  ⚠️ {act.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resumen ejecutivo */}
        {resumen && (
          <div
            className="p-2 rounded-3"
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="fw-bold" style={{ color: '#ea580c', fontSize: '0.72rem' }}>
                📊 Síntesis Ejecutiva de Inteligencia
              </small>
              <AlertaBadge nivel={resumen.nivel_alerta || 'alerta'} />
            </div>
            <p className="small text-dark mb-1" style={{ fontSize: '0.76rem' }}>
              {resumen.resumen}
            </p>
          </div>
        )}

        {/* Historial reciente de la colonia */}
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-uppercase fw-bold text-secondary" style={{ fontSize: '0.7rem' }}>
            Carpetas e Incidentes Recientes
          </small>
          <Link
            to={`/colonia/${col.id}`}
            className="btn btn-sm uw-btn-orange py-0 px-2"
            style={{ fontSize: '0.72rem' }}
          >
            Radiografía Completa →
          </Link>
        </div>

        <div className="d-flex flex-column gap-2">
          {data.incidentes?.slice(0, 6).map((inc: any) => (
            <IncidenteCard key={inc.id} incidente={inc} />
          ))}
        </div>
      </div>
    </div>
  );
};
