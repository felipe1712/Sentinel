import React from 'react';

interface IncidenteCardProps {
  incidente: any;
  onSelectColonia?: (coloniaId: string) => void;
}

const CONF_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  publico:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  sensible:  { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  reservado: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};

export const IncidenteCard: React.FC<IncidenteCardProps> = ({ incidente, onSelectColonia }) => {
  const conf = CONF_COLORS[incidente.nivel_conf || 'publico'] || CONF_COLORS.publico;

  return (
    <div
      className="p-3 mb-2 rounded-3"
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        transition: 'border-color 0.15s ease',
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span
            className="badge text-uppercase"
            style={{ background: '#ea580c', color: '#ffffff', fontWeight: 700 }}
          >
            {(incidente.tipo_incidente || 'incidente').replace('_', ' ')}
          </span>
          <span
            className="badge"
            style={{
              background: conf.bg,
              color: conf.color,
              border: `1px solid ${conf.border}`,
              fontSize: '0.68rem',
            }}
          >
            {(incidente.nivel_conf || 'publico').toUpperCase()}
          </span>
          <span className="badge bg-white border text-dark">
            Sev {incidente.severidad || 5}/10
          </span>
        </div>
        <small className="fw-semibold" style={{ color: '#c2410c' }}>
          📅 {incidente.fecha_incidente}
        </small>
      </div>

      <h6 className="mb-1 text-dark fw-semibold" style={{ fontSize: '0.9rem' }}>
        {incidente.titulo || incidente.subtipo || 'Incidente georreferenciado'}
      </h6>
      <p className="mb-2 small text-secondary">
        {incidente.descripcion}
      </p>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-1 border-top">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
            style={{ color: '#ea580c', fontSize: '0.78rem' }}
            onClick={() => incidente.colonia_id && onSelectColonia?.(incidente.colonia_id)}
          >
            📍 {incidente.colonia_nombre || incidente.ubicacion_texto || 'Colonia CDMX'} · {incidente.alcaldia}
          </button>
          {incidente.actores?.map((actor: string, idx: number) => (
            <span
              key={idx}
              className="badge rounded-pill"
              style={{
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                fontSize: '0.68rem',
              }}
            >
              {actor}
            </span>
          ))}
        </div>
        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
          Fuente: {incidente.fuente_nombre || incidente.fuente_tipo}
        </small>
      </div>
    </div>
  );
};
