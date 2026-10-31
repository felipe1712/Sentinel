import React, { useState } from 'react';

interface TimeSliderProps {
  onChange: (inicio: Date, fin: Date) => void;
  onFullRange?: () => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({ onChange, onFullRange }) => {
  const MIN_YEAR = 2016;
  const minMs = new Date(MIN_YEAR, 0, 1).getTime();
  const maxMs = new Date().getTime();
  const [mesActual, setMesActual] = useState<Date>(new Date());
  const [ventanaMeses, setVentanaMeses] = useState<number>(12);

  const applyWindow = (targetMs: number, monthsWindow: number) => {
    const fin = new Date(targetMs);
    const ini = new Date(targetMs);
    ini.setMonth(ini.getMonth() - monthsWindow);
    setMesActual(fin);
    onChange(ini, fin);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ms = parseInt(e.target.value, 10);
    applyWindow(ms, ventanaMeses);
  };

  const handleQuickYear = (year: number) => {
    const ini = new Date(year, 0, 1);
    const fin = year === new Date().getFullYear() ? new Date() : new Date(year, 11, 31);
    setMesActual(fin);
    onChange(ini, fin);
  };

  const pct = Math.max(
    0,
    Math.min(100, Math.round((100 * (mesActual.getTime() - minMs)) / (maxMs - minMs)))
  );

  return (
    <div
      className="p-3 rounded-3"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined" style={{ color: '#ea580c' }}>
            history
          </span>
          <span className="fw-semibold small text-dark">
            Línea de Tiempo Histórica
          </span>
        </div>
        <div className="d-flex align-items-center gap-1 flex-wrap">
          {[2016, 2018, 2019, 2022, 2024, 2026].map((yr) => (
            <button
              key={yr}
              type="button"
              className="btn btn-sm py-0 px-2"
              style={{
                fontSize: '0.72rem',
                background: mesActual.getFullYear() === yr ? '#ea580c' : '#f1f5f9',
                color: mesActual.getFullYear() === yr ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
              }}
              onClick={() => handleQuickYear(yr)}
            >
              {yr}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-sm py-0 px-2 btn-outline-secondary"
            style={{ fontSize: '0.72rem' }}
            onClick={() => {
              setMesActual(new Date());
              onChange(new Date(2016, 0, 1), new Date());
              onFullRange?.();
            }}
          >
            Todo el periodo
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between mb-1">
        <small style={{ color: '#ea580c' }}>Ene {MIN_YEAR}</small>
        <small style={{ color: '#ea580c', fontWeight: 700 }}>
          Ventana hasta:{' '}
          {mesActual.toLocaleDateString('es-MX', {
            month: 'short',
            year: 'numeric',
          })}
        </small>
        <small style={{ color: '#ea580c' }}>Hoy</small>
      </div>

      <input
        type="range"
        className="form-range"
        min={minMs}
        max={maxMs}
        step={2592000000} // ~1 mes
        value={mesActual.getTime()}
        onChange={handleChange}
        style={{ '--bs-form-range-thumb-bg': '#ea580c' } as React.CSSProperties}
      />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-1">
        <small className="text-secondary">
          Cobertura histórica: {MIN_YEAR}–presente
        </small>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <select
            className="form-select form-select-sm bg-white text-dark border-secondary-subtle py-0"
            style={{ width: 'auto', fontSize: '0.72rem' }}
            value={ventanaMeses}
            onChange={(e) => {
              const m = parseInt(e.target.value, 10);
              setVentanaMeses(m);
              applyWindow(mesActual.getTime(), m);
            }}
          >
            <option value={3}>Ventana 3 meses</option>
            <option value={6}>Ventana 6 meses</option>
            <option value={12}>Ventana 12 meses</option>
            <option value={130}>Acumulado desde 2016</option>
          </select>
          <small className="text-secondary">{pct}% navegado</small>
        </div>
      </div>
    </div>
  );
};
