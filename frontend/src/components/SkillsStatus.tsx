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
          <h6 className="mb-0 text-dark fw-bold">
            Estado de Motores Operativos del Sistema
          </h6>
          <small className="text-secondary">
            Servicios activos de recolección, clasificación de inteligencia y monitoreo visual
          </small>
        </div>
        <span className="badge bg-success">5 / 5 SERVICIOS ACTIVOS</span>
      </div>

      <div className="row g-3">
        {status.skills?.map((sk: any) => (
          <div key={sk.id} className="col-md-6 col-xl-4">
            <div
              className="p-3 rounded-3 h-100"
              style={{
                background: '#f8fafc',
                border: '1px solid #bbf7d0',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                  {sk.name}
                </span>
                <span className="badge bg-success-subtle text-success border border-success">
                  ● ACTIVO
                </span>
              </div>
              <p className="small text-secondary mb-2">{sk.rule}</p>
              {sk.modules && (
                <div className="d-flex flex-wrap gap-1 mt-2">
                  {sk.modules.map((m: string) => (
                    <span key={m} className="badge bg-white border text-secondary" style={{ fontSize: '0.66rem' }}>
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
