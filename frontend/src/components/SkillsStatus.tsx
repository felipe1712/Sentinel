import React, { useEffect, useState } from 'react';
import { uwApi } from '../services/api';

const CLEAN_SERVICE_MAP: Record<string, { name: string; desc: string }> = {
  headlessx: {
    name: 'Motor de Monitoreo Web Profunda',
    desc: 'Rastreo seguro de foros clandestinos y portales de difícil acceso',
  },
  'claude-osint': {
    name: 'Clasificador de Inteligencia Urbana',
    desc: 'Control de niveles de confidencialidad y perfilamiento territorial de grupos',
  },
  lightpanda: {
    name: 'Recolector Automatizado de Medios',
    desc: 'Procesamiento masivo de notas periodísticas y boletines oficiales CDMX',
  },
  'worldmonitor-mcp': {
    name: 'Monitor de Contexto Estratégico',
    desc: 'Correlación de eventos locales con indicadores regionales de seguridad',
  },
  pixelrag: {
    name: 'Detector de Cambios Visuales',
    desc: 'Alerta automática ante alteraciones visuales relevantes en objetivos monitoreados',
  },
};

export const SkillsStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    uwApi.getSkillsStatus().then(setStatus);
  }, []);

  if (!status) return null;

  return (
    <div className="uw-card">
      <div className="uw-card-header">
        <div>
          <h6 className="mb-0 text-dark fw-bold">
            Estado de Servicios Operativos del Sistema
          </h6>
          <small className="text-secondary">
            Motores activos de recolección, clasificación de inteligencia y monitoreo visual
          </small>
        </div>
        <span className="badge bg-success">5 / 5 SERVICIOS ACTIVOS</span>
      </div>

      <div className="row g-3">
        {status.skills?.map((sk: any) => {
          const clean = CLEAN_SERVICE_MAP[sk.id] || {
            name: String(sk.name || '').replace(/\s*\([^)]*\)/g, ''),
            desc: sk.rule,
          };
          return (
            <div key={sk.id} className="col-12 col-md-6 col-xl-4">
              <div
                className="p-3 rounded-3 h-100"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #bbf7d0',
                }}
              >
                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                    {clean.name}
                  </span>
                  <span className="badge bg-success-subtle text-success border border-success flex-shrink-0">
                    ● ACTIVO
                  </span>
                </div>
                <p className="small text-secondary mb-0">{clean.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
