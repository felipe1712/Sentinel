import React, { useState } from 'react';
import { MapCDMX } from '../components/MapCDMX';
import { TimeSlider } from '../components/TimeSlider';
import { ColoniaPanel } from '../components/ColoniaPanel';
import { IncidenteCard } from '../components/IncidenteCard';
import { AlertaBadge } from '../components/AlertaBadge';

interface DashboardProps {
  rol: string;
}

const TIPOS_DELITO = [
  { value: '', label: 'Todos los tipos de incidente' },
  { value: 'extorsion', label: 'Extorsión / Cobro de piso' },
  { value: 'homicidio', label: 'Homicidio doloso / Balacera' },
  { value: 'robo_vehiculo', label: 'Robo de vehículo / Transporte carga' },
  { value: 'robo_negocio', label: 'Robo a negocio / Intrusión' },
  { value: 'narcomenudeo', label: 'Narcomenudeo / Puntos de venta' },
  { value: 'secuestro', label: 'Secuestro / Privación ilegal' },
  { value: 'presencia_criminal', label: 'Presencia criminal / Halconeo' },
  { value: 'amenaza', label: 'Amenaza en Dark Web / Vigía' },
];

const ALCALDIAS = [
  '',
  'Cuauhtémoc',
  'Iztapalapa',
  'Gustavo A. Madero',
  'Miguel Hidalgo',
  'Tlalpan',
  'Coyoacán',
  'Venustiano Carranza',
  'Tláhuac',
  'Xochimilco',
  'Benito Juárez',
  'Álvaro Obregón',
  'Azcapotzalco',
  'Iztacalco',
];

export const Dashboard: React.FC<DashboardProps> = ({ rol }) => {
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date(2016, 0, 1));
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [tipoFiltro, setTipoFiltro] = useState<string | null>(null);
  const [alcaldiaFiltro, setAlcaldiaFiltro] = useState<string | null>(null);
  const [selectedColoniaId, setSelectedColoniaId] = useState<string | null>(
    '11111111-0001-4000-a000-000000000001'
  );
  const [incidentesEnVentana, setIncidentesEnVentana] = useState<any[]>([]);

  return (
    <div>
      {/* KPIs ejecutivos estilo Trezo CronosOne */}
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-3">
          <div className="uw-kpi-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-secondary fw-semibold">COLONIAS MONITOREADAS</small>
              <span className="material-symbols-outlined" style={{ color: '#FF6B35' }}>
                map
              </span>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <h3 className="mb-0 fw-bold text-light">1,812</h3>
              <span className="badge bg-dark border border-secondary text-warning">
                16 Alcaldías CDMX
              </span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="uw-kpi-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-secondary fw-semibold">COLONIAS RIESGO CRÍTICO</small>
              <span className="material-symbols-outlined text-danger">warning</span>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <h3 className="mb-0 fw-bold text-danger">6</h3>
              <AlertaBadge nivel="critico" />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="uw-kpi-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-secondary fw-semibold">EVENTOS EN VENTANA</small>
              <span className="material-symbols-outlined" style={{ color: '#FF6B35' }}>
                analytics
              </span>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <h3 className="mb-0 fw-bold" style={{ color: '#FF6B35' }}>
                {incidentesEnVentana.length}
              </h3>
              <small className="text-secondary">
                R3: <code>fecha_incidente</code>
              </small>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="uw-kpi-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-secondary fw-semibold">ALERTAS VIGÍA PIXELRAG</small>
              <span className="material-symbols-outlined text-info">visibility</span>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <h3 className="mb-0 fw-bold text-warning">2</h3>
              <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                Diff &gt; 15% (28.6%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de filtros + Time Slider */}
      <div className="row g-3 mb-3">
        <div className="col-lg-7">
          <TimeSlider
            onChange={(ini, fin) => {
              setFechaInicio(ini);
              setFechaFin(fin);
            }}
          />
        </div>
        <div className="col-lg-5">
          <div className="uw-card h-100 d-flex flex-column justify-content-center">
            <div className="row g-2">
              <div className="col-sm-6">
                <label className="form-label small text-secondary mb-1">
                  Filtrar por Delito
                </label>
                <select
                  className="form-select form-select-sm bg-dark text-light border-secondary"
                  value={tipoFiltro || ''}
                  onChange={(e) => setTipoFiltro(e.target.value || null)}
                >
                  {TIPOS_DELITO.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-sm-6">
                <label className="form-label small text-secondary mb-1">
                  Filtrar por Alcaldía
                </label>
                <select
                  className="form-select form-select-sm bg-dark text-light border-secondary"
                  value={alcaldiaFiltro || ''}
                  onChange={(e) => setAlcaldiaFiltro(e.target.value || null)}
                >
                  <option value="">Todas las Alcaldías (16)</option>
                  {ALCALDIAS.filter(Boolean).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa principal MapLibre + deck.gl y Panel Lateral de Colonia */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="uw-card p-2" style={{ height: 560 }}>
            <MapCDMX
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              tipoFiltro={tipoFiltro}
              alcaldiaFiltro={alcaldiaFiltro}
              rol={rol}
              onColoniaClick={(id) => setSelectedColoniaId(id)}
              onIncidentesLoaded={setIncidentesEnVentana}
            />
          </div>
        </div>
        <div className="col-xl-4">
          <ColoniaPanel coloniaId={selectedColoniaId} />
        </div>
      </div>

      {/* Feed de incidentes filtrados por fecha_incidente y nivel_conf */}
      <div className="uw-card">
        <div className="uw-card-header">
          <div>
            <h6 className="mb-0 text-light fw-bold">
              Bitácora Georreferenciada de Incidentes ({incidentesEnVentana.length})
            </h6>
            <small className="text-secondary">
              Filtrado estrictamente por <code>fecha_incidente</code> (Regla R3) y nivel de
              confidencialidad autorizado para rol <strong>{rol}</strong> (Regla R4)
            </small>
          </div>
        </div>
        <div className="row g-2">
          {incidentesEnVentana.map((inc) => (
            <div key={inc.id} className="col-md-6">
              <IncidenteCard
                incidente={inc}
                onSelectColonia={(cid) => setSelectedColoniaId(cid)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
