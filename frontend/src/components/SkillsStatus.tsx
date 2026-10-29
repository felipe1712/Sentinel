import React, { useEffect, useState } from 'react';
import { uwApi } from '../services/api';

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
          <h6 className="mb-0 text-light fw-bold">
            Estado de Skills Obligatorios de Antigravity (Entorno Dev)
          </h6>
          <small className="text-secondary">
            Metodología activa en motores de scraping, clasificación OSINT y monitoreo visual
          </small>
        </div>
        <span className="badge bg-success">5 / 5 SKILLS VERDES</span>
      </div>

      <div className="row g-3">
        {status.skills?.map((sk: any) => (
          <div key={sk.id} className="col-md-6 col-xl-4">
            <div
              className="p-3 rounded-3 h-100"
              style={{
                background: '#11141c',
                border: '1px solid rgba(34, 197, 94, 0.35)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-light" style={{ fontSize: '0.88rem' }}>
                  {sk.name}
                </span>
                <span className="badge bg-success bg-opacity-25 text-success border border-success">
                  ● ACTIVO
                </span>
              </div>
              <p className="small text-secondary mb-2">{sk.rule}</p>
              {sk.endpoint && (
                <div className="small text-warning font-monospace" style={{ fontSize: '0.73rem' }}>
                  Endpoint: {sk.endpoint}
                </div>
              )}
              {sk.modules && (
                <div className="d-flex flex-wrap gap-1 mt-2">
                  {sk.modules.map((m: string) => (
                    <span key={m} className="badge bg-dark border border-secondary text-light" style={{ fontSize: '0.66rem' }}>
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
