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
                <h6 className="mb-0 text-dark fw-bold">
                  Cobertura Histórica Documental
                </h6>
                <small className="text-secondary">
                  Estado del acervo histórico oficial, monitoreo de medios y reportes operativos
                </small>
              </div>
            </div>
            {cobertura.map((yr: any) => (
              <div key={yr.anio} className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold text-dark">Año {yr.anio}</span>
                  <span className="fw-semibold" style={{ color: '#c2410c' }}>
                    {yr.incidentes_count} eventos · {yr.cobertura_pct}%
                  </span>
                </div>
                <div className="progress" style={{ height: 7, background: '#e2e8f0' }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${yr.cobertura_pct}%`, backgroundColor: '#ea580c' }}
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
