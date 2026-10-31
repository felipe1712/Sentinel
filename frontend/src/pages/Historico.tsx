import React, { useEffect, useState } from 'react';
import { uwApi } from '../services/api';
import { TimeSlider } from '../components/TimeSlider';
import { MapCDMX } from '../components/MapCDMX';

export const Historico: React.FC = () => {
  const [cobertura, setCobertura] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date(2018, 0, 1));
  const [fechaFin, setFechaFin] = useState<Date>(new Date(2018, 11, 31));
  const [selectedColonia, setSelectedColonia] = useState<string | null>(null);

  useEffect(() => {
    uwApi.getCoberturaHistorica().then((res) => setCobertura(res.anios || []));
  }, []);

  return (
    <div>
      <div className="uw-card mb-3">
        <div className="uw-card-header">
          <div>
            <h5 className="mb-0 text-dark fw-bold">
              Evolución Temporal e Histórica CDMX
            </h5>
            <small className="text-secondary">
              Toda consulta filtra por la fecha real del incidente, permitiendo auditar patrones históricos sin alterar el corte operativo actual.
            </small>
          </div>
        </div>

        <TimeSlider
          onChange={(ini, fin) => {
            setFechaInicio(ini);
            setFechaFin(fin);
          }}
        />

        {/* Barra de cobertura histórica por año */}
        <div className="mt-3">
          <small className="text-uppercase fw-bold text-secondary d-block mb-2" style={{ fontSize: '0.72rem' }}>
            Cobertura Histórica Cargada por Año
          </small>
          <div className="row g-2">
            {cobertura.map((yr: any) => (
              <div key={yr.anio} className="col-6 col-md-3 col-xl-2">
                <div
                  className="p-2 rounded-3"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                  onClick={() => {
                    setFechaInicio(new Date(yr.anio, 0, 1));
                    setFechaFin(new Date(yr.anio, 11, 31));
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark small">{yr.anio}</span>
                    <span className="badge bg-warning-subtle text-dark border border-warning">{yr.cobertura_pct}%</span>
                  </div>
                  <div className="progress mb-1" style={{ height: 5, background: '#e2e8f0' }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${yr.cobertura_pct}%`, backgroundColor: '#ea580c' }}
                    />
                  </div>
                  <small className="text-secondary" style={{ fontSize: '0.68rem' }}>
                    {yr.incidentes_count} incidentes
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="uw-card p-2" style={{ height: 540 }}>
        <MapCDMX
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          tipoFiltro={null}
          onColoniaClick={(id) => setSelectedColonia(id)}
        />
      </div>
      {selectedColonia && (
        <div className="mt-2 small fw-semibold" style={{ color: '#c2410c' }}>
          Colonia seleccionada en histórico: {selectedColonia}
        </div>
      )}
    </div>
  );
};
