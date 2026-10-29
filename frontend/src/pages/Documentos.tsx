import React, { useEffect, useState } from 'react';
import { UploadZone } from '../components/UploadZone';
import { uwApi } from '../services/api';

export const Documentos: React.FC = () => {
  const [cobertura, setCobertura] = useState<any[]>([]);

  useEffect(() => {
    uwApi.getCoberturaHistorica().then((res) => setCobertura(res.anios || []));
  }, []);

  return (
    <div>
      <div className="row g-3">
        <div className="col-lg-6">
          <UploadZone />
        </div>
        <div className="col-lg-6">
          <div className="uw-card h-100">
            <div className="uw-card-header">
              <div>
                <h6 className="mb-0 text-light fw-bold">
                  Barra de Cobertura Histórica (2016–2026)
                </h6>
                <small className="text-secondary">
                  Regla R5: Estado del acervo histórico SSPC-CDMX, E-Medios y reportes manuales
                </small>
              </div>
            </div>
            {cobertura.map((yr: any) => (
              <div key={yr.anio} className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold text-light">Año {yr.anio}</span>
                  <span className="text-warning">
                    {yr.incidentes_count} eventos · {yr.cobertura_pct}%
                  </span>
                </div>
                <div className="progress" style={{ height: 7, background: '#1e2433' }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${yr.cobertura_pct}%`, backgroundColor: '#FF6B35' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
