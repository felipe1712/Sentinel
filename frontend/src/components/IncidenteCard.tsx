import React from 'react';

interface IncidenteCardProps {
  incidente: any;
  onSelectColonia?: (coloniaId: string) => void;
}

const CONF_COLORS: Record<string, { bg: string; color: string }> = {
  publico:   { bg: 'rgba(59, 130, 246, 0.16)', color: '#60A5FA' },
  sensible:  { bg: 'rgba(245, 158, 11, 0.18)', color: '#FBBF24' },
  reservado: { bg: 'rgba(239, 68, 68, 0.2)',   color: '#F87171' },
};

export const IncidenteCard: React.FC<IncidenteCardProps> = ({ incidente, onSelectColonia }) => {
  const conf = CONF_COLORS[incidente.nivel_conf || 'publico'] || CONF_COLORS.publico;

  return (
    <div
      className="p-3 mb-2 rounded-3"
      style={{
        background: '#161a24',
        border: '1px solid #262c3d',
        transition: 'border-color 0.15s ease',
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span
            className="badge text-uppercase"
            style={{ background: '#FF6B35', color: '#0d0d0d', fontWeight: 700 }}
          >
            {(incidente.tipo_incidente || 'incidente').replace('_', ' ')}
          </span>
          <span
            className="badge"
            style={{
              background: conf.bg,
              color: conf.color,
              border: `1px solid ${conf.color}44`,
              fontSize: '0.68rem',
            }}
          >
            R4: {(incidente.nivel_conf || 'publico').toUpperCase()}
          </span>
          <span className="badge bg-dark border border-secondary text-light">
            Sev {incidente.severidad || 5}/10
          </span>
        </div>
        <small className="text-warning fw-semibold" title="Regla R3: fecha_incidente">
          📅 {incidente.fecha_incidente}
        </small>
      </div>

      <h6 className="mb-1 text-light fw-semibold" style={{ fontSize: '0.9rem' }}>
        {incidente.titulo || incidente.subtipo || 'Incidente georreferenciado'}
      </h6>
      <p className="mb-2 small" style={{ color: '#94a3b8' }}>
        {incidente.descripcion}
      </p>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-1 border-top border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none"
            style={{ color: '#FF6B35', fontSize: '0.78rem' }}
            onClick={() => incidente.colonia_id && onSelectColonia?.(incidente.colonia_id)}
          >
            📍 {incidente.colonia_nombre || incidente.ubicacion_texto || 'Colonia CDMX'} · {incidente.alcaldia}
          </button>
          {incidente.actores?.map((actor: string, idx: number) => (
            <span
              key={idx}
              className="badge rounded-pill"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
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
